# `rust-full`

Full Rust Worker baseline candidate.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

When using the Deploy button for a public fork, set the Worker root directory to `workers/rust-full`.

## Why it exists

- Preserves the existing Workers-RS deployment style.
- Measures the cost and value of moving the entire Worker into Rust rather than only the compute kernel.
- Reuses the shared Rust hashing core from [`crates/hash-core`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/crates/hash-core/src/lib.rs).

## Local commands

```bash
npm --workspace @cloudflare-auth-hasher/rust-full run check
npm --workspace @cloudflare-auth-hasher/rust-full run dev -- --port 8789
npm --workspace @cloudflare-auth-hasher/rust-full run deploy
```

## Runtime tuning

This Worker consumes the shared `AUTH_HASHER_*` values at build time, so changing the shell env before `npm run build`, `npm run check`, or `npm run deploy` changes the compiled Argon2 preset.

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`

`GET /` returns the active preset ID and compiled Argon2 settings.

## Public surface

- RPC:
  - `hashPassword(password)`
  - `verifyPassword(hash, password)`
- HTTP:
  - `POST /_bench/hash`
  - `POST /_bench/verify`
  - `GET /_bench/noop`
