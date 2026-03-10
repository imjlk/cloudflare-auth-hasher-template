# Deployment

This repository is a single root-deployable Worker template. All commands run from the repository root.

## 1. Credentials

Wrangler reads the standard Cloudflare environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

You can export them directly:

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
```

Or load them through `mise`:

```bash
cp mise.local.example.toml mise.local.toml
mise env -s zsh | source /dev/stdin
```

## 2. Local Validation

Lightweight validation:

```bash
npm run typecheck
npm run check
npm run check:examples
```

Full Rust-backed validation:

```bash
npm test
```

`npm run check` rebuilds the Rust/Wasm kernel when `cargo` is available and performs `wrangler deploy --dry-run` from the root config.

## 3. Deploy

Deploy the root Worker:

```bash
npm run deploy
```

Local development:

```bash
npm run dev
```

The root `build` step rebuilds the Rust/Wasm kernel first. If `cargo` is unavailable, it falls back to the committed [src/rust-wasm-kernel.wasm](../src/rust-wasm-kernel.wasm). That fallback keeps the Deploy Button path usable even when the deploy environment does not rebuild Rust sources.

If you change Rust code in [crates/hash-core](../crates/hash-core) or [crates/rust-wasm-kernel](../crates/rust-wasm-kernel), rebuild locally with Rust installed before committing.
If your shell has `AUTH_HASHER_*` overrides set, `npm run build` compiles a matching custom kernel. Use `npm run build:artifact` before commit to restore the committed default artifact for `standard-2026q1`.

## 4. Preset Selection

Canonical preset IDs:

- `standard-2026q1`
- `free-tier-fallback-2026q1`

Legacy aliases still work as input compatibility shims:

- `standard-recommended`
- `free-safe-probe`

Runtime metadata always emits canonical IDs.

Optional deploy-time tuning variables:

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`
- `AUTH_HASHER_ENABLE_METADATA_ROUTE`
- `AUTH_HASHER_WORKER_CPU_MS`

The deploy wrapper injects these into the effective Wrangler config for that run.

## 5. Verify The Active Preset

By default, `GET /` returns metadata that includes:

- active preset ID
- Argon2id parameters
- exposed RPC methods
- whether the preset is OWASP-aligned

Example:

```bash
curl https://your-worker.your-subdomain.workers.dev/
```

If you disable the metadata route with `AUTH_HASHER_ENABLE_METADATA_ROUTE=false`, `GET /` returns `404`. Leave it enabled until you finish deployment verification if you want the simple curl-based check.

## 6. Workers Free Fallback

Use the lower-cost fallback only when Workers Free cannot sustain `standard-2026q1`.

```bash
export AUTH_HASHER_PRESET_ID=free-tier-fallback-2026q1
export AUTH_HASHER_ARGON2_MEMORY_KIB=4096
export AUTH_HASHER_ARGON2_TIME_COST=1
export AUTH_HASHER_ARGON2_PARALLELISM=1
export AUTH_HASHER_ARGON2_OUTPUT_LENGTH=32

npm run deploy
```

This fallback is a platform accommodation only. It is not the repository's OWASP-aligned baseline.

## 7. Free-To-Paid Upgrade

Typical migration order:

1. move from `free-tier-fallback-2026q1` to `standard-2026q1`
2. set `AUTH_HASHER_WORKER_CPU_MS` only if the Paid deployment needs a higher per-request CPU budget
3. redeploy and confirm `GET /` returns the expected canonical preset and Argon2 settings
4. use `verifyAndMaybeRehash()` or `needsPasswordRehash()` in the caller so older hashes are upgraded gradually

Paid example:

```bash
export AUTH_HASHER_PRESET_ID=standard-2026q1
export AUTH_HASHER_ARGON2_MEMORY_KIB=12288
export AUTH_HASHER_ARGON2_TIME_COST=3
export AUTH_HASHER_ARGON2_PARALLELISM=1
export AUTH_HASHER_ARGON2_OUTPUT_LENGTH=32
export AUTH_HASHER_WORKER_CPU_MS=100

npm run deploy
```

`AUTH_HASHER_WORKER_CPU_MS` only matters on plans that support a higher Worker CPU budget. It is useful for Paid migration, not for Workers Free.

Existing hashes continue to verify after you raise the preset because the stored Argon2 PHC string contains its own parameters.
`verifyAndMaybeRehash()` expects the deployed hasher Worker to already use the target preset. If the Worker still emits a lower-cost preset, the helper throws instead of silently storing another below-target hash.

## 8. Recommended Operator Checks

- confirm the deployed Worker returns the intended preset metadata
- confirm your caller Worker can reach the service binding over RPC
- tail logs during first deploys and ensure your application does not log plaintext credentials
- review whether `workers_dev`, persisted logs, and persisted traces fit your production policy

Hardening detail: [security-and-operations.md](./security-and-operations.md)
