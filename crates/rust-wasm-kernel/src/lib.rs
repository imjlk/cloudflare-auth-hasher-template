use std::cell::RefCell;
use std::slice;

thread_local! {
	static LAST_OUTPUT: RefCell<Vec<u8>> = RefCell::new(Vec::new());
	static LAST_ERROR: RefCell<Vec<u8>> = RefCell::new(Vec::new());
}

#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut u8 {
	let mut buffer = Vec::<u8>::with_capacity(len);
	let ptr = buffer.as_mut_ptr();
	std::mem::forget(buffer);
	ptr
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut u8, len: usize) {
	if ptr.is_null() || len == 0 {
		return;
	}

	unsafe {
		drop(Vec::from_raw_parts(ptr, len, len));
	}
}

#[no_mangle]
pub extern "C" fn hash_password(
	password_ptr: *const u8,
	password_len: usize,
	salt_ptr: *const u8,
	salt_len: usize,
) -> u32 {
	match read_utf8(password_ptr, password_len)
		.and_then(|password| read_bytes(salt_ptr, salt_len).map(|salt| (password, salt)))
		.and_then(|(password, salt)| auth_hasher_hash_core::hash_password_with_salt(&password, &salt))
	{
		Ok(hash) => {
			store_output(hash.into_bytes());
			clear_error();
			1
		}
		Err(error) => {
			store_error(error.into_bytes());
			2
		}
	}
}

#[no_mangle]
pub extern "C" fn verify_password(
	hash_ptr: *const u8,
	hash_len: usize,
	password_ptr: *const u8,
	password_len: usize,
) -> u32 {
	match read_utf8(hash_ptr, hash_len)
		.and_then(|hash| read_utf8(password_ptr, password_len).map(|password| (hash, password)))
		.and_then(|(hash, password)| auth_hasher_hash_core::verify_password(&hash, &password))
	{
		Ok(true) => {
			clear_error();
			1
		}
		Ok(false) => {
			clear_error();
			0
		}
		Err(error) => {
			store_error(error.into_bytes());
			2
		}
	}
}

#[no_mangle]
pub extern "C" fn output_ptr() -> *const u8 {
	LAST_OUTPUT.with(|buffer| buffer.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn output_len() -> usize {
	LAST_OUTPUT.with(|buffer| buffer.borrow().len())
}

#[no_mangle]
pub extern "C" fn error_ptr() -> *const u8 {
	LAST_ERROR.with(|buffer| buffer.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn error_len() -> usize {
	LAST_ERROR.with(|buffer| buffer.borrow().len())
}

#[no_mangle]
pub extern "C" fn clear_buffers() {
	LAST_OUTPUT.with(|buffer| buffer.borrow_mut().clear());
	LAST_ERROR.with(|buffer| buffer.borrow_mut().clear());
}

fn read_utf8(ptr: *const u8, len: usize) -> std::result::Result<String, String> {
	if ptr.is_null() && len != 0 {
		return Err("Kernel received a null pointer for non-empty input.".into());
	}

	let bytes = unsafe { slice::from_raw_parts(ptr, len) };
	String::from_utf8(bytes.to_vec()).map_err(|error| format!("Kernel received invalid UTF-8: {error}"))
}

fn read_bytes(ptr: *const u8, len: usize) -> std::result::Result<Vec<u8>, String> {
	if ptr.is_null() && len != 0 {
		return Err("Kernel received a null pointer for non-empty input.".into());
	}

	Ok(unsafe { slice::from_raw_parts(ptr, len).to_vec() })
}

fn store_output(bytes: Vec<u8>) {
	LAST_OUTPUT.with(|buffer| {
		let mut buffer = buffer.borrow_mut();
		buffer.clear();
		buffer.extend_from_slice(&bytes);
	});
}

fn store_error(bytes: Vec<u8>) {
	LAST_ERROR.with(|buffer| {
		let mut buffer = buffer.borrow_mut();
		buffer.clear();
		buffer.extend_from_slice(&bytes);
	});
}

fn clear_error() {
	LAST_ERROR.with(|buffer| buffer.borrow_mut().clear());
}
