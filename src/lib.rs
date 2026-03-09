use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Algorithm, Argon2, Params as Argon2Params, Version};
use getrandom::getrandom;
use hex::decode as decode_hex;
use scrypt::{scrypt, Params as ScryptParams};
use subtle::ConstantTimeEq;
use unicode_normalization::UnicodeNormalization;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;
use worker::*;

const ARGON2_MEMORY_KIB: u32 = 12 * 1024;
const ARGON2_TIME_COST: u32 = 3;
const ARGON2_PARALLELISM: u32 = 1;
const ARGON2_OUTPUT_LEN: usize = 32;

const LEGACY_SCRYPT_LOG_N: u8 = 14;
const LEGACY_SCRYPT_R: u32 = 16;
const LEGACY_SCRYPT_P: u32 = 1;
const LEGACY_SCRYPT_OUTPUT_LEN: usize = 64;

const SALT_LEN: usize = 16;
const MAX_PASSWORD_LENGTH: usize = 1024;
const MAX_HASH_LENGTH: usize = 4096;

#[event(fetch)]
async fn fetch(_req: Request, _env: Env, _ctx: Context) -> Result<Response> {
	Response::error("This worker is intended to be called through a service binding.", 404)
}

#[wasm_bindgen(js_name = hashPassword)]
pub async fn hash_password(password: String) -> std::result::Result<String, JsValue> {
	validate_password(&password).map_err(js_error)?;
	hash_argon2id(&password).map_err(js_error)
}

#[wasm_bindgen(js_name = verifyPassword)]
pub async fn verify_password(hash: String, password: String) -> std::result::Result<bool, JsValue> {
	validate_password(&password).map_err(js_error)?;
	validate_hash(&hash).map_err(js_error)?;
	verify_hash(&hash, &password).map_err(js_error)
}

fn js_error(message: String) -> JsValue {
	js_sys::Error::new(&message).into()
}

fn validate_password(password: &str) -> std::result::Result<(), String> {
	if password.is_empty() {
		return Err("Password must not be empty.".into());
	}

	if password.len() > MAX_PASSWORD_LENGTH {
		return Err(format!(
			"Password exceeds the maximum supported length of {MAX_PASSWORD_LENGTH} bytes.",
		));
	}

	Ok(())
}

fn validate_hash(hash: &str) -> std::result::Result<(), String> {
	if hash.is_empty() {
		return Err("Hash must not be empty.".into());
	}

	if hash.len() > MAX_HASH_LENGTH {
		return Err(format!("Hash exceeds the maximum supported length of {MAX_HASH_LENGTH} bytes."));
	}

	Ok(())
}

fn normalize_password(password: &str) -> String {
	password.nfkc().collect()
}

fn argon2_instance() -> std::result::Result<Argon2<'static>, String> {
	let params = Argon2Params::new(
		ARGON2_MEMORY_KIB,
		ARGON2_TIME_COST,
		ARGON2_PARALLELISM,
		Some(ARGON2_OUTPUT_LEN),
	)
	.map_err(|error| format!("Invalid Argon2id parameters: {error}"))?;

	Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}

fn hash_argon2id(password: &str) -> std::result::Result<String, String> {
	let normalized = normalize_password(password);
	let argon2 = argon2_instance()?;

	let mut salt_bytes = [0u8; SALT_LEN];
	getrandom(&mut salt_bytes).map_err(|error| format!("Failed to generate Argon2 salt: {error}"))?;
	let salt = SaltString::encode_b64(&salt_bytes)
		.map_err(|error| format!("Failed to encode Argon2 salt: {error}"))?;

	let hash = argon2
		.hash_password(normalized.as_bytes(), &salt)
		.map_err(|error| format!("Argon2id hashing failed: {error}"))?;

	Ok(hash.to_string())
}

fn verify_hash(hash: &str, password: &str) -> std::result::Result<bool, String> {
	if hash.starts_with("$argon2") {
		return verify_argon2id(hash, password);
	}

	if hash.contains(':') {
		return verify_legacy_scrypt(hash, password);
	}

	Err("Unsupported password hash format.".into())
}

fn verify_argon2id(hash: &str, password: &str) -> std::result::Result<bool, String> {
	let parsed = PasswordHash::new(hash).map_err(|error| format!("Invalid Argon2id hash: {error}"))?;
	let argon2 = argon2_instance()?;
	let normalized = normalize_password(password);

	match argon2.verify_password(normalized.as_bytes(), &parsed) {
		Ok(()) => Ok(true),
		Err(argon2::password_hash::Error::Password) => Ok(false),
		Err(error) => Err(format!("Argon2id verification failed: {error}")),
	}
}

fn verify_legacy_scrypt(hash: &str, password: &str) -> std::result::Result<bool, String> {
	let (salt_hex, key_hex) = hash
		.split_once(':')
		.ok_or_else(|| "Invalid legacy scrypt hash format.".to_string())?;

	let expected_key = decode_hex(key_hex).map_err(|error| format!("Invalid legacy scrypt key hex: {error}"))?;
	let params = ScryptParams::new(
		LEGACY_SCRYPT_LOG_N,
		LEGACY_SCRYPT_R,
		LEGACY_SCRYPT_P,
		LEGACY_SCRYPT_OUTPUT_LEN,
	)
	.map_err(|error| format!("Invalid legacy scrypt parameters: {error}"))?;

	let normalized = normalize_password(password);
	let mut derived_key = vec![0u8; LEGACY_SCRYPT_OUTPUT_LEN];
	scrypt(normalized.as_bytes(), salt_hex.as_bytes(), &params, &mut derived_key)
		.map_err(|error| format!("Legacy scrypt verification failed: {error}"))?;

	Ok(bool::from(derived_key.ct_eq(&expected_key)))
}

