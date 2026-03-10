# Deployment

`main` is now a single root-deployable Worker. All deploy commands run from the repository root.

## Credentials

Wrangler reads the standard Cloudflare environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

You can provide them directly:

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
```

Or load them from `mise`:

```bash
cp mise.local.example.toml mise.local.toml
mise env -s zsh | source /dev/stdin
```

## Commands

Validate the deploy configuration without publishing:

```bash
npm run deploy:dry-run
```

Lightweight local validation without Rust tests:

```bash
npm run typecheck
npm run check
```

Deploy the root Worker:

```bash
npm run deploy
```

Local development:

```bash
npm run dev
```

## Build Behavior

The root `build` step tries to rebuild the Rust Wasm kernel first. If `cargo` is unavailable, it falls back to the committed [`src/rust-wasm-kernel.wasm`](../src/rust-wasm-kernel.wasm).

That keeps the template deployable through the root `Deploy to Cloudflare` button even when the deploy environment does not rebuild Rust sources.

If you modify the Rust code in [`crates/hash-core`](../crates/hash-core) or [`crates/rust-wasm-kernel`](../crates/rust-wasm-kernel), rebuild locally with Rust installed before committing.

If you want the full Rust-backed test suite locally, run:

```bash
npm test
```

## Optional Runtime Tuning

The deploy wrapper forwards these optional environment variables into the effective Wrangler config:

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`
- `AUTH_HASHER_WORKER_CPU_MS`

Canonical preset IDs:

- `standard-2026q1`
- `free-tier-fallback-2026q1`

Legacy aliases are still accepted for input compatibility:

- `standard-recommended`
- `free-safe-probe`

Runtime metadata and docs always use the canonical IDs.

## Free-Tier Fallback Example

Use the lower-cost fallback only when Workers Free cannot sustain the standard preset.

```bash
export AUTH_HASHER_PRESET_ID=free-tier-fallback-2026q1
export AUTH_HASHER_ARGON2_MEMORY_KIB=4096
export AUTH_HASHER_ARGON2_TIME_COST=1
export AUTH_HASHER_ARGON2_PARALLELISM=1
export AUTH_HASHER_ARGON2_OUTPUT_LENGTH=32

npm run deploy
```

This fallback is a platform accommodation only. It is not the repository's OWASP-aligned baseline.

## Paid Upgrade Example

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

## Free To Paid Migration

Recommended order:

1. move from `free-tier-fallback-2026q1` to `standard-2026q1`
2. set `AUTH_HASHER_WORKER_CPU_MS` only if the Paid deployment needs a higher per-request CPU budget
3. redeploy and confirm `GET /` returns the expected canonical preset and Argon2 settings
4. use `verifyAndMaybeRehash()` or `needsPasswordRehash()` in the caller so older hashes are upgraded gradually

Existing hashes continue to verify after you raise the preset because the stored Argon2 PHC string contains its own parameters.
`verifyAndMaybeRehash()` expects the deployed hasher Worker to already use the target preset. If the Worker still emits a lower-cost preset, the helper now throws instead of silently storing another below-target hash.
