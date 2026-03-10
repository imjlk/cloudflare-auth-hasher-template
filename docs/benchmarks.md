# Benchmarks

This document is the durable home for benchmark results captured against deployed Cloudflare Workers.

The repository now commits:

- the result schema
- a sample JSON record
- saved production-facing profile runs under `bench/results/profiles/`
- the local benchmark runner
- the summary generator

## Benchmark matrix

### Paths

- `direct`
- `binding`

For `binding` scenarios, `hash` and `verify` run through WorkerEntrypoint RPC service bindings, while `noop` runs through `fetch()` intentionally as a control case.

### Operations

- `noop`
- `hash`
- `verify`

### Tracks

- `parity`: same algorithm and parameters across candidates
- `deployment`: production-facing presets and deployment trade-offs

### Inputs

- `ascii-12`
- `ascii-32`
- `ascii-96`
- `utf8-12`
- `utf8-32`
- `utf8-96`

### Concurrency sweep

- `1`
- `4`
- `16`

## Baseline preset

- Preset: `standard-recommended`
- Argon2id: `12 MiB / t=3 / p=1 / 32 bytes`

The `free-safe` preset is intentionally not promoted into the code defaults yet. It will be introduced only after first-pass production measurements.

Security interpretation:

- `standard-recommended` is the repository's OWASP-aligned baseline.
- `free-safe-probe` is a platform-constrained fallback for Workers Free validation only.
- `free-safe-probe` should not be presented as an OWASP-equivalent password hashing preset.
- This distinction follows the current [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and the current [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) guidance.

## Runtime-tuned presets

The benchmark runner now derives the active preset ID from the same environment used for deployment:

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`
- `BENCH_VERIFY_SEED_RETRIES`
- `BENCH_SCENARIO_COOLDOWN_MS`

Behavior:

- If only numeric Argon2 overrides are present, scenario IDs and records use `env-tuned`.
- If `AUTH_HASHER_PRESET_ID` is set, that exact value is used in benchmark records.
- `BENCH_VERIFY_SEED_RETRIES` controls how many times the runner retries the one-time verify seed hash before it records a verify-seed failure.
- `BENCH_SCENARIO_COOLDOWN_MS` inserts a pause between scenarios so long sweeps put less accumulated pressure on later records.

Recommended CPU-limit triage flow:

1. Lower the Argon2 cost in `mise.local.toml`.
2. Set an explicit probe preset ID such as `free-safe-probe`.
3. Redeploy all baseline candidates.
4. Re-run the smoke benchmark first.
5. Only then run the wider `1 / 4 / 16` concurrency sweep.

## Data sources

### Local

Use the local runner for:

- endpoint correctness
- relative wall-time comparisons
- first-hit smoke checks
- Wasm boundary experimentation

Command:

```bash
npm run bench:local
```

The runner uses the active preset ID from the shell environment, so if `mise` loads a lower-cost probe preset the output records will reflect it automatically.

### Production

Use deployed Workers plus Cloudflare observability for:

- `CPUTimeMs` percentiles
- wall-time percentiles under real execution conditions
- first-hit and startup observations
- error rates under concurrency

Recommended workflow:

1. Deploy the three baseline candidates and the binding gateway.
2. Run `npm run bench:local` against deployed URLs for the wall-time and success-rate profile.
3. Run `npm run bench:cpu` against the same URLs when you also want `CPUTimeMs` from `wrangler tail`.
4. Save both artifacts under `bench/results/profiles/<date>/`.
5. Add the summarized table below.

## Result table

Production result profiles are now checked in for future reference:

- [`bench/results/profiles/2026-03-10/free-safe-probe-parity-baseline.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-parity-baseline.json)
- [`bench/results/profiles/2026-03-10/free-safe-probe-parity-baseline.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-parity-baseline.md)
- [`bench/results/profiles/2026-03-10/standard-recommended-finalists.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-finalists.json)
- [`bench/results/profiles/2026-03-10/standard-recommended-finalists.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-finalists.md)
- [`bench/results/profiles/2026-03-10/standard-recommended-finalists-cpu-tail.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-finalists-cpu-tail.json)
- [`bench/results/profiles/2026-03-10/standard-recommended-finalists-cpu-tail.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-finalists-cpu-tail.md)
- [`bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.json)
- [`bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.md)
- [`bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.json)
- [`bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.md)
- [`bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.json)
- [`bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.md)
- [`bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.json)
- [`bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.md)
- [`bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.json)
- [`bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.md)

Current readout from deployed endpoint wall-time tests:

| Profile | Candidates | Key outcome |
| --- | --- | --- |
| `free-safe-probe` parity baseline | `ts-direct`, `ts-rust-wasm`, `rust-full` | `ts-rust-wasm` and `rust-full` were fully stable; `ts-direct` averaged `0.5544` success rate and frequently hit CPU-limit / 503 failures. |
| `standard-recommended` finalists | `ts-rust-wasm`, `rust-full` | `ts-rust-wasm` won the final comparison. Overall average success rate was `0.8921` vs `0.7648` for `rust-full`, with the biggest gap on UTF-8 inputs. |
| `standard-recommended` focused rerun | `ts-rust-wasm` | Runner improvements removed the verify-seed ambiguity, but service-binding UTF-8 stress cases still showed CPU-limit failures on the current deployed account. |
| `free-safe-probe` focused rerun | `ts-rust-wasm` | Lowering Argon2 to `4096 KiB / t=1 / p=1 / 32 bytes` cleared the previously failing UTF-8 `direct` and `binding` `c1` scenarios on the current Free-tier account. |
| `free-safe-probe` stress rerun | `ts-rust-wasm` | The same lower-cost preset also completed the saved `c4` and `c16` UTF-8 follow-up sweep without recorded failures. |
| `free-safe-probe` focused rerun | `rust-full` | The full Rust Worker also completed the same focused `direct` and `binding` UTF-8 `c1` validation without recorded failures at the lowered preset. |
| `free-safe-probe` stress rerun | `rust-full` | The full Rust Worker also completed the saved `c4` and `c16` UTF-8 stress follow-up without recorded failures at the lowered preset. |

Interpretation:

- the lower-cost `free-safe-probe` profile is useful evidence for what survives on the current Workers Free account
- it is not evidence that the lowered preset is the right long-term password hashing policy
- in this repository, lower-cost Free-tier presets are documented as platform accommodations, not as the preferred security baseline

## Final recommendation

Default public template recommendation: `ts-rust-wasm`.

Reasoning from the committed profiles:

- `free-safe-probe` showed that `ts-direct` remained too unstable even after lowering Argon2 cost.
- `standard-recommended` showed both finalists handling ASCII inputs well enough, but `ts-rust-wasm` held up better on UTF-8 scenarios.
- Final deployed wall-time sweep:
  - `ts-rust-wasm` overall avg success: `0.8921`
  - `rust-full` overall avg success: `0.7648`
  - `ts-rust-wasm` UTF-8 avg success: `0.7841`
  - `rust-full` UTF-8 avg success: `0.5301`
- Supplemental CPU-tail sweep:
  - `ts-rust-wasm` successful hash/verify avg `CPUTimeMs p50`: `41.389`
  - `rust-full` successful hash/verify avg `CPUTimeMs p50`: `35.000`
  - lower CPU time alone was not enough to overcome `rust-full`'s lower stability under the same preset

This repo still keeps the neutral workspace layout, but the benchmark evidence now points to `ts-rust-wasm` as the default template to promote first.

## Error interpretation

The `standard-recommended` finalist wall-time profile did not fail for only one reason. Across the saved records, the dominant error strings were:

- `27` cases of non-JSON `500` HTML responses
- `18` cases where the Workers runtime canceled a request as hung
- `13` cases of `Worker exceeded CPU time limit.`
- `9` cases of non-JSON `503` HTML responses

That matters for plan selection:

- Cloudflare's [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) page documents a `10 ms` HTTP request CPU cap on Workers Free.
- The same [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) page describes a default `30,000 ms` cap on Paid, configurable up to `300,000 ms`.
- The committed CPU-tail profile recorded successful `CPUTimeMs` values well above `10 ms`, so this benchmark was very likely not operating under a strict Free-plan ceiling. This is an inference from the saved trace data plus Cloudflare's limits docs.
- Raising `limits.cpu_ms` on Paid may reduce the pure CPU-limit failures, but it does not guarantee elimination of the hung / `500` / `503` failure classes that also appeared in the finalist runs.

Because of that, the benchmark conclusion is:

- Paid can be necessary for higher-cost presets.
- Paid is not sufficient by itself.
- `ts-rust-wasm` is still the better default template because it kept the better stability profile under the same deployed `standard-recommended` settings.
- A Paid-only `limits.cpu_ms` retest remains a backlog item until a Paid account is available for validation.

## Current gating recommendation

Use the following interpretation for promotion and CI:

- focused `direct` + `concurrency=1`: implementation acceptance gate
- focused `binding` + `concurrency=1`: service-binding validation gate
- `concurrency=4`: stress signal, not a release blocker by itself
- `concurrency=16`: exploratory only, not a template-promotion gate

Rationale:

- the saved full sweep runs every scenario back-to-back, so later `c1` cases can inherit pressure from earlier heavy scenarios
- the runner now retries verify seed hashes and reuses a cached direct seed so verify timing is cleaner than before
- focused follow-up probes showed the promoted `ts-rust-wasm` candidate behaving much better under isolated `c1` runs than it did in the original long full sweep
- even after that runner fix, the current deployed account still showed service-binding CPU-limit failures on `ts-rust-wasm` for some `utf8-96` and higher-stress cases under `standard-recommended`
- the saved `free-safe-probe` follow-up shows that the promoted candidate becomes cleanly stable on the current Free-tier account once Argon2 is reduced to `4096 KiB / t=1 / p=1 / 32 bytes`

Current practical recommendation for the promoted `ts-rust-wasm` template:

- use focused `direct c1` as the implementation pass/fail signal
- treat focused `binding c1` as account-specific validation before public template promotion
- keep `concurrency=4` in saved benchmark profiles as a realism check
- keep `concurrency=16` only for exploratory stress work until the runner separates scenario state more cleanly
- if the target deployment is Workers Free, use the saved `free-safe-probe` profile as the current safest reference point rather than `standard-recommended`
- on the current Free-tier account, both `ts-rust-wasm` and `rust-full` stabilized at the lowered preset; `ts-rust-wasm` remains the promoted default because it won the higher-cost finalist comparison and keeps the TypeScript shell ergonomics
- if OWASP-aligned Argon2id settings are a requirement, do not treat the lowered Free-tier preset as sufficient; use the `standard-recommended` floor and plan for a platform budget that can actually sustain it

## Output contract

Benchmark result files follow [`bench/results/schema.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/schema.json).

Example:

- [`bench/results/example.json`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/example.json)
