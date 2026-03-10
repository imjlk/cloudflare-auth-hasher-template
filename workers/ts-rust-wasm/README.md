# `ts-rust-wasm`

TypeScript Worker shell with an imported Rust Wasm hashing kernel.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

When using the Deploy button for a public fork, set the Worker root directory to `workers/ts-rust-wasm`.

## Why it exists

- Keeps the Worker integration surface in TypeScript.
- Moves the CPU-heavy kernel into Rust-generated WebAssembly.
- Is the main hypothesis candidate for balancing developer ergonomics and compute performance.
- Is the promoted default template candidate in this workspace.
- Won the saved `standard-recommended` finalist comparison in [`bench/results/profiles/2026-03-10/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/README.md).

## Local commands

```bash
npm --workspace @cloudflare-auth-hasher/ts-rust-wasm run build
npm --workspace @cloudflare-auth-hasher/ts-rust-wasm run check
npm --workspace @cloudflare-auth-hasher/ts-rust-wasm run dev -- --port 8788
npm --workspace @cloudflare-auth-hasher/ts-rust-wasm run deploy
```

## Runtime tuning

The TypeScript shell reads the shared `AUTH_HASHER_*` env vars through Wrangler `vars`, and the Rust Wasm kernel sees the same values at build time.

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`

`GET /` returns the active preset ID and Argon2 settings for the deployed build.

## Recommended integration path

Use this Worker from other Workers through a private service binding and WorkerEntrypoint RPC.

- Guide: [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)
- Runtime helpers: [`packages/client/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts)

The benchmark HTTP routes are for benchmarking and smoke checks. Normal Worker-to-Worker integration should call `hashPassword()` and `verifyPassword()` over the service binding.

If you deploy a higher-cost preset on a Paid plan, `limits.cpu_ms` can help with pure CPU-budget failures, but the saved `standard-recommended` profiles in this repo show that Paid alone is not a full correctness guarantee.

## Notes

- The Wasm file is generated from [`crates/rust-wasm-kernel`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/crates/rust-wasm-kernel/src/lib.rs).
- The TypeScript shell reuses the same benchmark HTTP contract as the other baseline candidates.
