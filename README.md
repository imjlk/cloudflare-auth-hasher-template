# Cloudflare Auth Hasher Template

[![CI](https://github.com/imjlk/cloudflare-auth-hasher-template/actions/workflows/ci.yml/badge.svg)](https://github.com/imjlk/cloudflare-auth-hasher-template/actions/workflows/ci.yml)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

Private password hashing template for Cloudflare Workers using `WorkerEntrypoint` RPC, Argon2id, and a Rust/Wasm kernel.

## What This Is

This repository ships a root-deployable Worker that is meant to be called from another Worker through a private service binding.

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`
- `GET /` metadata and health by default
- Better Auth legacy `salt:key` scrypt verification compatibility
- gradual upgrade helpers such as `verifyAndMaybeRehash()`

The public HTTP surface stays intentionally small. The Worker is designed to be an internal password-hashing service, not a public hash API.

## Who Should Use This

Use this template if you:

- run authentication logic on Cloudflare Workers
- want password hashing behind private service bindings instead of public HTTP
- need an incremental migration path from older Better Auth `salt:key` scrypt hashes
- want a TypeScript Worker shell while keeping the hashing kernel in Rust/Wasm

## Why Private RPC Instead Of Public HTTP

Cloudflare recommends Worker-to-Worker communication through service bindings. This template follows that pattern with `WorkerEntrypoint` RPC so your application Worker can call the hasher without exposing password hashing over a public route.

- caller Worker traffic stays on Cloudflare's internal service-binding path
- the hasher Worker keeps a narrow public surface
- the root Worker API is stable and easy to wrap from other Workers

## 60-Second Quick Start

1. Install dependencies.

```bash
npm install
```

2. Authenticate Wrangler.

```bash
npx wrangler login
npx wrangler whoami
```

3. Validate the template.

```bash
npm run typecheck
npm run check
```

Run the full Rust-backed suite when the Rust toolchain is available locally:

```bash
npm test
```

4. Deploy the Worker.

```bash
npm run deploy
```

5. Bind it from your application Worker.

- generic example: [examples/rpc-caller-worker](./examples/rpc-caller-worker)
- Better Auth-oriented example: [examples/better-auth-worker](./examples/better-auth-worker)
- full guide: [docs/using-from-workers.md](./docs/using-from-workers.md)

For cross-account deploys, set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, or copy [mise.local.example.toml](./mise.local.example.toml) to `mise.local.toml` and load it with `mise`.

## Better Auth Example

The Better Auth adapter keeps Worker binding lookup isolated from framework-specific code. Use the adapter for the primary hash/verify flow, then use `verifyAndMaybeRehash()` after successful login to migrate older or lower-cost hashes.

```ts
import { createAuthPasswordHasher } from "@cloudflare-auth-hasher/better-auth-adapter";
import {
  STANDARD_2026Q1_PRESET,
  resolveAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";

const hasher = createAuthPasswordHasher(event, {
  fallback: {
    hashPassword: fallbackHashPassword,
    verifyPassword: fallbackVerifyPassword
  }
});

const verified = await hasher.verify({ hash: storedHash, password });
if (verified) {
  const binding = resolveAuthHasherBinding(event.platform?.env);
  if (binding) {
    await verifyAndMaybeRehash(binding, storedHash, password, {
      targetPreset: STANDARD_2026Q1_PRESET
    });
  }
}
```

See [examples/better-auth-worker](./examples/better-auth-worker) for a minimal Worker-shaped example.

## Architecture

```mermaid
flowchart LR
    caller["Caller Worker"] --> binding["Private Service Binding"]
    binding --> rpc["WorkerEntrypoint RPC"]
    rpc --> hasher["Auth Hasher Worker"]
    hasher --> kernel["Rust/Wasm Argon2id Kernel"]
```

## Presets And Migration

Canonical preset IDs:

- `standard-2026q1`
  - default
  - repository OWASP-aligned floor
  - Argon2id `12288 KiB / t=3 / p=1 / 32 bytes`
- `free-tier-fallback-2026q1`
  - Workers Free fallback when the higher-cost preset is not operationally viable
  - not an OWASP-equivalent recommendation
  - Argon2id `4096 KiB / t=1 / p=1 / 32 bytes`

Legacy aliases are still accepted for input compatibility:

- `standard-recommended` -> `standard-2026q1`
- `free-safe-probe` -> `free-tier-fallback-2026q1`

If you start on the lower-cost preset and later move to `standard-2026q1`, older hashes still verify because the stored Argon2 PHC string carries its own parameters. Use `verifyAndMaybeRehash()` or `needsPasswordRehash()` to replace weaker hashes after successful login.

## Security And Operations

- `GET /` exists for metadata, health checks, and deploy verification. You can disable it with `AUTH_HASHER_ENABLE_METADATA_ROUTE=false`.
- Hashing is not exposed through public HTTP routes. The intended path is private RPC through service bindings.
- The template does not intentionally log plaintext passwords or password hashes. If you add application logs, keep credentials and hashes out of logs.
- Observability defaults are enabled so first deploys are debuggable. Harden or reduce persistence to match your own policy.
- `workers_dev: true` is enabled by default for easier first deploys. Disable it and map a custom route when you move to a tighter production posture.

More detail: [docs/security-and-operations.md](./docs/security-and-operations.md)

## When Not To Use This

Do not use this template if:

- you want a public password hashing API
- the Workers Free fallback preset is too weak for your threat model and you cannot move to a higher-budget plan
- you want an npm library instead of a private Worker service

## Maintenance Policy

This template should be reviewed at least quarterly.

- update `compatibility_date`
- review `wrangler`, TypeScript, and Rust dependencies
- rebuild the Rust/Wasm kernel and confirm there is no artifact drift
- re-evaluate preset guidance when Cloudflare plan limits materially change

Contributor workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Benchmark History

This root template was promoted from the benchmark workspace.

- `ts-rust-wasm` beat `rust-full` in the higher-cost finalist comparison
- the Free-tier fallback preset stabilized both finalists on the test account, but that fallback is a platform accommodation, not the security baseline

Full benchmark history:

- branch: [codex/benchmark-workspace](https://github.com/imjlk/cloudflare-auth-hasher-template/tree/codex/benchmark-workspace)
- saved profiles: [bench/results/profiles/2026-03-10](https://github.com/imjlk/cloudflare-auth-hasher-template/tree/codex/benchmark-workspace/bench/results/profiles/2026-03-10)

## Repository Layout

```text
src/                       # root Worker entrypoint and Wasm glue
crates/hash-core/          # shared Rust hashing logic
crates/rust-wasm-kernel/   # raw Wasm kernel wrapper
packages/contracts/        # shared RPC and preset contracts
packages/client/           # binding helpers and rehash helpers
packages/better-auth-adapter/
examples/
docs/
```

## References

- [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/tutorials/deploy-button/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [WorkerEntrypoint RPC](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
