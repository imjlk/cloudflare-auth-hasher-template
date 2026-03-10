# Cloudflare Auth Hasher Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

Root-deployable Cloudflare Worker template for password hashing with a TypeScript Worker shell and a Rust Wasm kernel.

This template exposes password hashing through `WorkerEntrypoint` RPC so another Worker can call it through a private service binding instead of a public HTTP hop.

## What This Template Ships

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`
- `GET /` metadata with the active preset ID and Argon2 parameters
- Better Auth legacy `salt:key` scrypt verification compatibility
- shared client helpers in [`packages/client`](./packages/client)
- Better Auth integration helpers in [`packages/better-auth-adapter`](./packages/better-auth-adapter)

## Presets

Canonical preset IDs on `main`:

- `standard-2026q1`
  - default
  - repository OWASP-aligned floor
  - Argon2id `12288 KiB / t=3 / p=1 / 32 bytes`
- `free-tier-fallback-2026q1`
  - platform fallback for Workers Free when the higher-cost preset is not operationally viable
  - not an OWASP-equivalent recommendation
  - Argon2id `4096 KiB / t=1 / p=1 / 32 bytes`

Legacy input aliases are still accepted for compatibility:

- `standard-recommended` -> `standard-2026q1`
- `free-safe-probe` -> `free-tier-fallback-2026q1`

If you start on the lower-cost preset and later move up, existing hashes still verify. Use `verifyAndMaybeRehash()` or `needsPasswordRehash()` to upgrade stored hashes after successful login.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

Rust is only required when you want to rebuild or test the Wasm kernel locally. If `cargo` is unavailable, the root build script falls back to the committed [`src/rust-wasm-kernel.wasm`](./src/rust-wasm-kernel.wasm).

### 2. Authenticate Cloudflare

```bash
npx wrangler login
npx wrangler whoami
```

### 3. Validate the template

```bash
npm run typecheck
npm test
npm run check
```

### 4. Develop locally

```bash
npm run dev
```

### 5. Deploy

```bash
npm run deploy
```

For cross-account deploys, set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` or load them from [`mise.local.toml`](./mise.local.toml). More detail is in [docs/deployment.md](./docs/deployment.md).

## Use From Another Worker

The intended integration path is a private service binding plus `WorkerEntrypoint` RPC.

- guide: [docs/using-from-workers.md](./docs/using-from-workers.md)
- binding helpers: [packages/client](./packages/client)
- Better Auth wrapper: [packages/better-auth-adapter](./packages/better-auth-adapter)

The public HTTP surface is intentionally small. `GET /` is metadata and health. Hashing is meant to happen over RPC, not over public routes.

## Free To Paid Migration

The supported migration path is:

1. start on `free-tier-fallback-2026q1` only if Workers Free cannot sustain `standard-2026q1`
2. move to `standard-2026q1` once your account budget allows it
3. keep verifying old hashes as-is
4. call `verifyAndMaybeRehash()` after successful login so weaker hashes are replaced gradually

If you need a higher Worker CPU budget on Workers Paid, the deploy wrapper also accepts `AUTH_HASHER_WORKER_CPU_MS` and injects `limits.cpu_ms` for that deploy.

## Benchmark History

This root template was promoted from the benchmark workspace. The short conclusion is:

- the `ts-rust-wasm` layout beat `rust-full` in the higher-cost finalist comparison
- the Free-tier fallback preset stabilized both finalists on the test account, but that fallback is a platform accommodation, not the repository security baseline

Full benchmark history stays on the archival branch:

- benchmark branch: [codex/benchmark-workspace](https://github.com/imjlk/cloudflare-auth-hasher-template/tree/codex/benchmark-workspace)
- saved benchmark profiles: [bench/results/profiles/2026-03-10](https://github.com/imjlk/cloudflare-auth-hasher-template/tree/codex/benchmark-workspace/bench/results/profiles/2026-03-10)

## Repository Layout

```text
src/                       # root Worker entrypoint and Wasm glue
crates/hash-core/          # shared Rust hashing logic
crates/rust-wasm-kernel/   # raw Wasm kernel wrapper
packages/contracts/        # shared RPC and preset contracts
packages/client/           # service-binding and rehash helpers
packages/better-auth-adapter/
docs/
```

## References

- [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/tutorials/deploy-button/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [WorkerEntrypoint RPC](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
