# Cloudflare Auth Hasher Workspace

Neutral benchmark workspace for comparing password-hasher layouts on Cloudflare Workers.

This repository is intentionally not a single default template yet. It exists to answer one concrete question first:

> Which layout gives the best operational balance for a reusable Cloudflare auth hasher?

## Baseline candidates

| Candidate | Layout | Status | Notes |
| --- | --- | --- | --- |
| `ts-direct` | Pure TypeScript Worker | Baseline | Uses `@noble/hashes` for Argon2id and legacy Better Auth scrypt verification. |
| `ts-rust-wasm` | TypeScript Worker shell + imported Rust Wasm kernel | Promoted default | Keeps the Worker surface in TypeScript and moves the compute kernel into raw Wasm. |
| `rust-full` | Full Rust Worker | Baseline | Keeps the existing Workers-RS deployment style, but now reuses the shared hashing core. |
| `assemblyscript-probe` | AssemblyScript kernel scaffold | Optional | Kept out of v1 scoring; useful for feasibility and cold-start experiments only. |

## Current recommendation

Current default-template recommendation: `ts-rust-wasm`.

The saved production-facing benchmark profiles in [`bench/results/profiles/2026-03-10/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/README.md) showed:

- `ts-direct` remained unstable even with a lower-cost probe preset
- `ts-rust-wasm` and `rust-full` were the two viable finalists
- `ts-rust-wasm` held up better than `rust-full` on the `standard-recommended` UTF-8 scenarios
- the `standard-recommended` failures were not only CPU-limit failures, so a Paid plan is not a complete explanation by itself
- the Free-tier-stable `free-safe-probe` preset is a platform-constrained fallback, not the general security recommendation

This workspace still keeps all candidates side by side for reference, but `ts-rust-wasm` is now the implementation to promote first.

## Free-tier guidance

The current benchmark evidence supports a narrow conclusion for Workers Free:

- use a lowered preset only as an operational fallback when the platform budget forces it
- do not describe that lowered preset as equivalent to the repository's `standard-recommended` baseline
- do not describe that lowered preset as OWASP-aligned password hashing guidance

The saved `free-safe-probe` runs were stable on the current Free-tier account, but that preset is intentionally below the Argon2id parameter sets listed in the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). In this repository, `standard-recommended` is the OWASP-aligned floor and `free-safe-probe` is the platform-constrained fallback.

## Workspace layout

```text
workers/
  ts-direct/
  ts-rust-wasm/
  rust-full/
  binding-gateway/
crates/
  hash-core/
  rust-wasm-kernel/
kernels/
  assemblyscript/
packages/
  contracts/
  client/
  better-auth-adapter/
bench/
docs/
```

## What stays constant across baseline candidates

- RPC surface:
  - `hashPassword(password: string): Promise<string>`
  - `verifyPassword(hash: string, password: string): Promise<boolean>`
- Benchmark HTTP surface:
  - `POST /_bench/hash`
  - `POST /_bench/verify`
  - `GET /_bench/noop`
- Default preset when `AUTH_HASHER_*` is unset:
  - Argon2id `12 MiB / t=3 / p=1 / 32 bytes`
- Legacy compatibility:
  - Better Auth style `salt:key` scrypt verification
- Password normalization:
  - Unicode `NFKC`

## Service binding shape

The benchmark gateway uses Cloudflare service bindings in two different ways on purpose:

- `hashPassword()` and `verifyPassword()` are called through `WorkerEntrypoint` RPC methods.
- `GET /_bench/noop` is forwarded through `binding.fetch()` as a control path so the repository can measure service-binding overhead without the hashing kernel.

That split matches the intent of this workspace: compare hash kernels with RPC, while still keeping a pure binding-overhead control case.

## Using it from another Worker

The recommended integration path is a private service binding to the promoted `ts-rust-wasm` Worker, not a public HTTP call.

- Guide: [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)
- Runtime helpers: [`packages/client/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts)
- Better Auth wrapper: [`packages/better-auth-adapter/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/better-auth-adapter/README.md)

The root README still does not carry a single-template Deploy button. The consumer guide is the prerequisite for that promotion.

## Getting started

### 1. Install toolchains

- Node.js 24+
- npm 11+
- Rust stable
- `wasm32-unknown-unknown` target

```bash
rustup target add wasm32-unknown-unknown
npm install
```

### 2. Authenticate Cloudflare

```bash
npx wrangler login
npx wrangler whoami
```

For CI or cross-account deployment, the workspace also supports the standard Wrangler environment variables:

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
```

For local shell-based setup, copy [`mise.local.example.toml`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/mise.local.example.toml) to `mise.local.toml` and load it with `mise`.

### 3. Validate the workspace

```bash
npm run typecheck
cargo check --workspace --target wasm32-unknown-unknown
npm run check
```

## Deploying to Cloudflare

Use the root deployment helper when you want to deploy the baseline candidates and the binding gateway into a specific Cloudflare account.

### Environment variable mode

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
npm run deploy:workers
```

Dry-run validation:

```bash
npm run deploy:workers:dry-run
```

### Interactive mode

If the environment variables are missing and the terminal is interactive, the script will prompt for both values:

```bash
npm run deploy:workers
```

### Deploy only selected workers

```bash
npm run deploy:workers -- --workers=ts-direct,ts-rust-wasm
```

The deployment order is fixed to avoid service-binding issues:

1. `ts-direct`
2. `ts-rust-wasm`
3. `rust-full`
4. `binding-gateway`

More detail is documented in [`docs/deployment.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/deployment.md).

## Argon2 tuning

All baseline candidates now read the same optional environment knobs:

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`
- `AUTH_HASHER_WORKER_CPU_MS`

These values are consumed in two places:

- TypeScript Workers receive them as Wrangler `vars`.
- Rust candidates read them at build time through the surrounding shell environment.

That means one `mise.local.toml` change can alter `ts-direct`, `ts-rust-wasm`, and `rust-full` together.

Example CPU-limit probe:

```bash
export AUTH_HASHER_PRESET_ID=free-safe-probe
export AUTH_HASHER_ARGON2_MEMORY_KIB=4096
export AUTH_HASHER_ARGON2_TIME_COST=1
export AUTH_HASHER_ARGON2_PARALLELISM=1
export AUTH_HASHER_ARGON2_OUTPUT_LENGTH=32

npm run deploy:workers -- --yes
```

Use that lower-cost probe only when you are validating what can survive on Workers Free. It should not replace the repository's `standard-recommended` preset for deployments that need an OWASP-aligned baseline.

After deploy, each direct candidate exposes its active preset and Argon2 parameters at `/`, so you can verify the effective config with `curl`.
When `AUTH_HASHER_WORKER_CPU_MS` is set, the deploy wrapper also injects `limits.cpu_ms` for that deploy. This is mainly useful when moving from Workers Free to Workers Paid.

If you raise Argon2 cost later, existing hashes still verify. Use `needsPasswordRehash()` from [`packages/client/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts) or [`packages/contracts/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/contracts/src/index.ts) to implement `rehash-on-login` for old hashes.

## Running the candidates locally

Start each baseline Worker on a dedicated port:

```bash
npm --workspace @cloudflare-auth-hasher/ts-direct run dev -- --port 8787
npm --workspace @cloudflare-auth-hasher/ts-rust-wasm run dev -- --port 8788
npm --workspace @cloudflare-auth-hasher/rust-full run dev -- --port 8789
```

The binding gateway can also run locally:

```bash
npm --workspace @cloudflare-auth-hasher/binding-gateway run dev -- --port 8790
```

The gateway uses `remote: true` service bindings in local development, so it expects the three baseline candidates to already exist in your Cloudflare account.

## Local benchmark workflow

Run the local wall-time runner:

```bash
npm run bench:local
```

Write a Markdown summary from the latest JSON output:

```bash
npm run bench:summary -- bench/results/local-latest.json docs/benchmarks-local.md
```

Environment overrides:

- `TS_DIRECT_URL`
- `TS_RUST_WASM_URL`
- `RUST_FULL_URL`
- `BINDING_GATEWAY_URL`
- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`
- `BENCH_CANDIDATES`
- `BENCH_INPUTS`
- `BENCH_PATHS`
- `BENCH_TRACKS`
- `BENCH_CONCURRENCY`
- `BENCH_SAMPLES`
- `BENCH_VERIFY_SEED_RETRIES`
- `BENCH_SCENARIO_COOLDOWN_MS`
- `BENCH_OUTPUT`

## Production benchmark workflow

Production CPU time is intentionally separated from local profiling.

- Use local profiling to understand hot paths such as encoding, JSON handling, and Wasm boundary cost.
- Use deployed Workers plus Logs / Trace Events to capture `CPUTimeMs`, wall time, and first-hit behavior.
- Use `npm run bench:cpu` when you want the repository to capture `CPUTimeMs` directly from `wrangler tail` and save it in the same result schema.

The committed `standard-recommended` CPU-tail profile is supplemental evidence, not the sole winner-picking input. It is useful for CPU bands and failure classes, but the non-tailed wall-time profile remains the primary stability signal.
- The runner now retries verify seed hashes and inserts scenario cooldowns so focused reruns are less likely to misclassify verify failures as seed-hash failures.
- Store production summaries in [`docs/benchmarks.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/benchmarks.md).
- The local runner and scenario IDs automatically use the active preset ID from `AUTH_HASHER_PRESET_ID` or fall back to `env-tuned` when only numeric overrides are present.

## Better Auth integration

The old example has been promoted into a package:

- [`packages/better-auth-adapter`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/better-auth-adapter/src/index.ts)

It keeps the Cloudflare service binding path separate from the local Better Auth fallback.

## Candidate docs

- [`workers/ts-direct/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/ts-direct/README.md)
- [`workers/ts-rust-wasm/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/ts-rust-wasm/README.md)
- [`workers/rust-full/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/rust-full/README.md)
- [`workers/binding-gateway/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/binding-gateway/README.md)
- [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)
- [`kernels/assemblyscript/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/kernels/assemblyscript/README.md)

## References

- [Wasm in JavaScript](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Profiling CPU usage](https://developers.cloudflare.com/workers/observability/dev-tools/cpu-usage/)
- [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/)
