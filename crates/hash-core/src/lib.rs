use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Algorithm, Argon2, Params as Argon2Params, Version};
#[cfg(feature = "random-salt")]
use getrandom::getrandom;
use hex::decode as decode_hex;
use scrypt::{scrypt, Params as ScryptParams};
use subtle::ConstantTimeEq;
use unicode_normalization::UnicodeNormalization;

pub const DEFAULT_PRESET_ID: &str = "standard-recommended";
pub const ENV_TUNED_PRESET_ID: &str = "env-tuned";
pub const DEFAULT_ARGON2_MEMORY_KIB: u32 = 12 * 1024;
pub const DEFAULT_ARGON2_TIME_COST: u32 = 3;
pub const DEFAULT_ARGON2_PARALLELISM: u32 = 1;
pub const DEFAULT_ARGON2_OUTPUT_LEN: usize = 32;

const LEGACY_SCRYPT_LOG_N: u8 = 14;
const LEGACY_SCRYPT_R: u32 = 16;
const LEGACY_SCRYPT_P: u32 = 1;
const LEGACY_SCRYPT_OUTPUT_LEN: usize = 64;

const SALT_LEN: usize = 16;
const MAX_PASSWORD_LENGTH: usize = 1024;
const MAX_HASH_LENGTH: usize = 4096;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct RuntimePreset {
	pub id: &'static str,
	pub argon2_memory_kib: u32,
	pub argon2_time_cost: u32,
	pub argon2_parallelism: u32,
	pub argon2_output_len: usize,
}

pub fn runtime_preset() -> std::result::Result<RuntimePreset, String> {
	let has_argon_overrides = option_env!("AUTH_HASHER_ARGON2_MEMORY_KIB").is_some()
		|| option_env!("AUTH_HASHER_ARGON2_TIME_COST").is_some()
		|| option_env!("AUTH_HASHER_ARGON2_PARALLELISM").is_some()
		|| option_env!("AUTH_HASHER_ARGON2_OUTPUT_LENGTH").is_some();

	let preset_id = match option_env!("AUTH_HASHER_PRESET_ID").map(str::trim) {
		Some(value) if !value.is_empty() => value,
		_ if has_argon_overrides => ENV_TUNED_PRESET_ID,
		_ => DEFAULT_PRESET_ID,
	};

	Ok(RuntimePreset {
		id: preset_id,
		argon2_memory_kib: parse_u32_env(
			"AUTH_HASHER_ARGON2_MEMORY_KIB",
			option_env!("AUTH_HASHER_ARGON2_MEMORY_KIB"),
			DEFAULT_ARGON2_MEMORY_KIB,
		)?,
		argon2_time_cost: parse_u32_env(
			"AUTH_HASHER_ARGON2_TIME_COST",
			option_env!("AUTH_HASHER_ARGON2_TIME_COST"),
			DEFAULT_ARGON2_TIME_COST,
		)?,
		argon2_parallelism: parse_u32_env(
			"AUTH_HASHER_ARGON2_PARALLELISM",
			option_env!("AUTH_HASHER_ARGON2_PARALLELISM"),
			DEFAULT_ARGON2_PARALLELISM,
		)?,
		argon2_output_len: parse_usize_env(
			"AUTH_HASHER_ARGON2_OUTPUT_LENGTH",
			option_env!("AUTH_HASHER_ARGON2_OUTPUT_LENGTH"),
			DEFAULT_ARGON2_OUTPUT_LEN,
		)?,
	})
}

#[cfg(feature = "random-salt")]
pub fn hash_password(password: &str) -> std::result::Result<String, String> {
	validate_password(password)?;
	let mut salt_bytes = [0u8; SALT_LEN];
	getrandom(&mut salt_bytes).map_err(|error| format!("Failed to generate Argon2 salt: {error}"))?;
	hash_password_with_salt(password, &salt_bytes)
}

pub fn hash_password_with_salt(password: &str, salt_bytes: &[u8]) -> std::result::Result<String, String> {
	validate_password(password)?;
	if salt_bytes.len() != SALT_LEN {
		return Err(format!("Argon2 salt must be {SALT_LEN} bytes."));
	}
	hash_argon2id(password, salt_bytes)
}

pub fn verify_password(hash: &str, password: &str) -> std::result::Result<bool, String> {
	validate_password(password)?;
	validate_hash(hash)?;
	verify_hash(hash, password)
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

fn parse_u32_env(
	env_key: &str,
	value: Option<&'static str>,
	fallback: u32,
) -> std::result::Result<u32, String> {
	match value.map(str::trim) {
		Some(raw) if raw.is_empty() => Ok(fallback),
		Some(raw) => {
			let parsed = raw
				.parse::<u32>()
				.map_err(|error| format!("Invalid {env_key} value '{raw}': {error}"))?;
			if parsed == 0 {
				return Err(format!("{env_key} must be a positive integer."));
			}
			Ok(parsed)
		}
		None => Ok(fallback),
	}
}

fn parse_usize_env(
	env_key: &str,
	value: Option<&'static str>,
	fallback: usize,
) -> std::result::Result<usize, String> {
	match value.map(str::trim) {
		Some(raw) if raw.is_empty() => Ok(fallback),
		Some(raw) => {
			let parsed = raw
				.parse::<usize>()
				.map_err(|error| format!("Invalid {env_key} value '{raw}': {error}"))?;
			if parsed == 0 {
				return Err(format!("{env_key} must be a positive integer."));
			}
			Ok(parsed)
		}
		None => Ok(fallback),
	}
}

fn argon2_instance() -> std::result::Result<Argon2<'static>, String> {
	let preset = runtime_preset()?;
	let params = Argon2Params::new(
		preset.argon2_memory_kib,
		preset.argon2_time_cost,
		preset.argon2_parallelism,
		Some(preset.argon2_output_len),
	)
	.map_err(|error| format!("Invalid Argon2id parameters: {error}"))?;

	Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}

fn hash_argon2id(password: &str, salt_bytes: &[u8]) -> std::result::Result<String, String> {
	let normalized = normalize_password(password);
	let argon2 = argon2_instance()?;

	let salt = SaltString::encode_b64(salt_bytes)
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

#[cfg(test)]
mod tests {
	use super::*;

	fn legacy_scrypt_hash(password: &str, salt: &str) -> String {
		let normalized = normalize_password(password);
		let params = ScryptParams::new(
			LEGACY_SCRYPT_LOG_N,
			LEGACY_SCRYPT_R,
			LEGACY_SCRYPT_P,
			LEGACY_SCRYPT_OUTPUT_LEN,
		)
		.expect("legacy scrypt params should be valid");
		let mut derived_key = vec![0u8; LEGACY_SCRYPT_OUTPUT_LEN];
		scrypt(normalized.as_bytes(), salt.as_bytes(), &params, &mut derived_key)
			.expect("legacy scrypt derivation should succeed");
		format!("{salt}:{}", hex::encode(derived_key))
	}

	#[test]
	fn hashes_and_verifies_argon2id() {
		let hash = hash_password("correct horse battery staple").expect("hash should succeed");
		assert!(verify_password(&hash, "correct horse battery staple").expect("verify should succeed"));
	}

	#[test]
	fn rejects_wrong_password() {
		let hash = hash_password("correct horse battery staple").expect("hash should succeed");
		assert!(!verify_password(&hash, "incorrect").expect("verify should succeed"));
	}

	#[test]
	fn verifies_legacy_scrypt_hashes() {
		let hash = legacy_scrypt_hash("hunter2", "legacy-salt");
		assert!(verify_password(&hash, "hunter2").expect("legacy verify should succeed"));
		assert!(!verify_password(&hash, "hunter3").expect("legacy verify should succeed"));
	}

	#[test]
	fn normalizes_passwords_before_verification() {
		let hash = hash_password("Å").expect("hash should succeed");
		assert!(verify_password(&hash, "Å").expect("verify should succeed"));
	}

	#[test]
	fn validates_inputs() {
		assert!(hash_password("").is_err());
		assert!(verify_password("", "password").is_err());
		assert!(hash_password(&"a".repeat(MAX_PASSWORD_LENGTH + 1)).is_err());
		assert!(verify_password(&"a".repeat(MAX_HASH_LENGTH + 1), "password").is_err());
	}
}
