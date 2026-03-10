# `ts-direct`

Pure TypeScript baseline candidate.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

When using the Deploy button for a public fork, set the Worker root directory to `workers/ts-direct`.

## Why it exists

- Establishes the pure JavaScript / TypeScript baseline.
- Keeps the full hashing path inside the Worker runtime without a Wasm boundary.
- Uses `@noble/hashes` for Argon2id plus Better Auth legacy scrypt verification.

## Local commands

```bash
npm --workspace @cloudflare-auth-hasher/ts-direct run check
npm --workspace @cloudflare-auth-hasher/ts-direct run dev -- --port 8787
npm --workspace @cloudflare-auth-hasher/ts-direct run deploy
```

## Runtime tuning

This Worker reads the shared `AUTH_HASHER_*` env vars through Wrangler `vars`.

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`

`GET /` returns the active preset ID and Argon2 settings, which makes it easy to confirm that a lower-cost probe was deployed.

## Public surface

- RPC:
  - `hashPassword(password)`
  - `verifyPassword(hash, password)`
- HTTP:
  - `POST /_bench/hash`
  - `POST /_bench/verify`
  - `GET /_bench/noop`
