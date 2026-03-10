use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;
use worker::*;

const CANDIDATE: &str = "rust-full";

#[derive(Deserialize)]
#[allow(dead_code)]
#[serde(rename_all = "camelCase")]
struct HashBenchRequest {
	scenario_id: String,
	candidate: String,
	path: String,
	track: String,
	preset: String,
	input_id: String,
	concurrency: u32,
	password: String,
}

#[derive(Deserialize)]
#[allow(dead_code)]
#[serde(rename_all = "camelCase")]
struct VerifyBenchRequest {
	scenario_id: String,
	candidate: String,
	path: String,
	track: String,
	preset: String,
	input_id: String,
	concurrency: u32,
	password: String,
	hash: String,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct BenchEnvelope<T: Serialize> {
	scenarioId: String,
	ok: bool,
	result: Option<T>,
	error: Option<String>,
}

#[derive(Serialize)]
struct HashResult {
	hash: String,
}

#[derive(Serialize)]
struct VerifyResult {
	verified: bool,
}

#[derive(Serialize)]
struct NoopResult<'a> {
	candidate: &'a str,
	path: String,
	noop: bool,
}

#[derive(Serialize)]
#[allow(non_snake_case)]
struct Argon2Metadata {
	memoryKiB: u32,
	iterations: u32,
	parallelism: u32,
	outputLength: usize,
}

#[derive(Serialize)]
struct WorkerMetadata<'a> {
	candidate: &'a str,
	preset: &'a str,
	argon2id: Argon2Metadata,
	rpc: [&'a str; 2],
	bench: [&'a str; 3],
}

#[event(fetch)]
async fn fetch(mut req: Request, _env: Env, _ctx: Context) -> Result<Response> {
	let url = req.url()?;
	match (req.method(), url.path()) {
		(Method::Get, "/") => {
			let preset = auth_hasher_hash_core::runtime_preset().map_err(|message| Error::RustError(message.into()))?;
			json_response(
				200,
				&WorkerMetadata {
					candidate: CANDIDATE,
					preset: preset.id,
					argon2id: Argon2Metadata {
						memoryKiB: preset.argon2_memory_kib,
						iterations: preset.argon2_time_cost,
						parallelism: preset.argon2_parallelism,
						outputLength: preset.argon2_output_len,
					},
					rpc: ["hashPassword", "verifyPassword"],
					bench: ["/_bench/hash", "/_bench/verify", "/_bench/noop"],
				},
			)
		}
		(Method::Get, "/_bench/noop") => {
			let scenario_id = query_param(&url, "scenarioId");
			let candidate = query_param(&url, "candidate");
			let preset = query_param(&url, "preset");
			let path = query_param(&url, "path");
			validate_candidate(&candidate)?;
			validate_preset(&preset)?;
			validate_direct_path(&path)?;
			json_response(
				200,
				&ok_response(
					scenario_id,
					NoopResult {
						candidate: CANDIDATE,
						path,
						noop: true,
					},
				),
			)
		}
		(Method::Post, "/_bench/hash") => {
			let payload = req.json::<HashBenchRequest>().await?;
			validate_candidate(&payload.candidate)?;
			validate_preset(&payload.preset)?;
			validate_direct_path(&payload.path)?;
			let hash = auth_hasher_hash_core::hash_password(&payload.password)
				.map_err(|message| Error::RustError(message.into()))?;
			json_response(200, &ok_response(payload.scenario_id, HashResult { hash }))
		}
		(Method::Post, "/_bench/verify") => {
			let payload = req.json::<VerifyBenchRequest>().await?;
			validate_candidate(&payload.candidate)?;
			validate_preset(&payload.preset)?;
			validate_direct_path(&payload.path)?;
			let verified = auth_hasher_hash_core::verify_password(&payload.hash, &payload.password)
				.map_err(|message| Error::RustError(message.into()))?;
			json_response(
				200,
				&ok_response(payload.scenario_id, VerifyResult { verified }),
			)
		}
		_ => json_response(
			404,
			&error_response::<()>(
				"unknown".into(),
				"Unknown route. This Worker only exposes RPC methods and benchmark endpoints.".into(),
			),
		),
	}
}

#[wasm_bindgen(js_name = hashPassword)]
pub async fn hash_password(password: String) -> std::result::Result<String, JsValue> {
	auth_hasher_hash_core::hash_password(&password).map_err(js_error)
}

#[wasm_bindgen(js_name = verifyPassword)]
pub async fn verify_password(hash: String, password: String) -> std::result::Result<bool, JsValue> {
	auth_hasher_hash_core::verify_password(&hash, &password).map_err(js_error)
}

fn js_error(message: String) -> JsValue {
	js_sys::Error::new(&message).into()
}

fn ok_response<T: Serialize>(scenario_id: String, result: T) -> BenchEnvelope<T> {
	BenchEnvelope {
		scenarioId: scenario_id,
		ok: true,
		result: Some(result),
		error: None,
	}
}

fn error_response<T: Serialize>(scenario_id: String, message: String) -> BenchEnvelope<T> {
	BenchEnvelope {
		scenarioId: scenario_id,
		ok: false,
		result: None,
		error: Some(message),
	}
}

fn json_response<T: Serialize>(status: u16, payload: &T) -> Result<Response> {
	Response::builder().with_status(status).from_json(payload)
}

fn query_param(url: &url::Url, key: &str) -> String {
	url.query_pairs()
		.find_map(|(candidate, value)| (candidate == key).then(|| value.into_owned()))
		.unwrap_or_else(|| "unknown".into())
}

fn validate_candidate(candidate: &str) -> Result<()> {
	if candidate != CANDIDATE {
		return Err(Error::RustError(format!(
			"Expected candidate '{CANDIDATE}' but received '{candidate}'."
		)));
	}

	Ok(())
}

fn validate_preset(preset: &str) -> Result<()> {
	let active_preset =
		auth_hasher_hash_core::runtime_preset().map_err(|message| Error::RustError(message.into()))?;
	if preset != active_preset.id {
		return Err(Error::RustError(format!(
			"Expected preset '{}' but received '{preset}'.",
			active_preset.id
		)));
	}

	Ok(())
}

fn validate_direct_path(path: &str) -> Result<()> {
	if path != "direct" {
		return Err(Error::RustError(format!(
			"Expected direct benchmark path but received '{path}'."
		)));
	}

	Ok(())
}
