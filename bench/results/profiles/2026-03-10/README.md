# 2026-03-10 Benchmark Profiles

These files capture production-facing benchmark runs against deployed Workers.

## Profiles

- `free-safe-probe-parity-baseline`
  - Candidates: `ts-direct`, `ts-rust-wasm`, `rust-full`
  - Preset: `free-safe-probe`
  - Argon2id: `4096 KiB / t=1 / p=1 / 32 bytes`
  - Purpose: lower-cost probe to check whether `ts-direct` could avoid Cloudflare CPU-limit failures
- `standard-recommended-finalists`
  - Candidates: `ts-rust-wasm`, `rust-full`
  - Preset: `standard-recommended`
  - Argon2id: `12288 KiB / t=3 / p=1 / 32 bytes`
  - Purpose: final head-to-head comparison between the two stable finalists
- `standard-recommended-finalists-cpu-tail`
  - Candidates: `ts-rust-wasm`, `rust-full`
  - Preset: `standard-recommended`
  - Argon2id: `12288 KiB / t=3 / p=1 / 32 bytes`
  - Purpose: supplemental `CPUTimeMs` capture from `wrangler tail`
- `standard-recommended-ts-rust-wasm-focused`
  - Candidates: `ts-rust-wasm`
  - Preset: `standard-recommended`
  - Argon2id: `12288 KiB / t=3 / p=1 / 32 bytes`
  - Purpose: focused rerun after benchmark-runner fixes for verify seeding and scenario cooldown
- `free-safe-probe-ts-rust-wasm-focused`
  - Candidates: `ts-rust-wasm`
  - Preset: `free-safe-probe`
  - Argon2id: `4096 KiB / t=1 / p=1 / 32 bytes`
  - Purpose: focused Free-tier validation of the promoted candidate at the lower-cost probe preset
- `free-safe-probe-ts-rust-wasm-stress`
  - Candidates: `ts-rust-wasm`
  - Preset: `free-safe-probe`
  - Argon2id: `4096 KiB / t=1 / p=1 / 32 bytes`
  - Purpose: follow-up stress sweep for the promoted candidate at `c4` and `c16`
- `free-safe-probe-rust-full-focused`
  - Candidates: `rust-full`
  - Preset: `free-safe-probe`
  - Argon2id: `4096 KiB / t=1 / p=1 / 32 bytes`
  - Purpose: lower-cost focused validation of the full Rust Worker on the deployed Free-tier account
- `free-safe-probe-rust-full-stress`
  - Candidates: `rust-full`
  - Preset: `free-safe-probe`
  - Argon2id: `4096 KiB / t=1 / p=1 / 32 bytes`
  - Purpose: follow-up stress sweep for the full Rust Worker at `c4` and `c16`

## Matrix

All three profiles used the same benchmark shape:

- paths: `direct`, `binding`
- operations: `noop`, `hash`, `verify`
- inputs: `ascii-12`, `ascii-32`, `ascii-96`, `utf8-12`, `utf8-32`, `utf8-96`
- concurrency: `1`, `4`, `16`
- samples: `2` for the committed finalist sweep, `2` for the final free-safe baseline

## Interpretation

- `hash` and `verify` binding scenarios use WorkerEntrypoint RPC through service bindings.
- `noop` binding scenarios use `fetch()` intentionally as a control path for binding overhead.
- `free-safe-probe-parity-baseline` and `standard-recommended-finalists` are the primary wall-time / success-rate profiles.
- `standard-recommended-finalists-cpu-tail` is a supplemental profile for `CPUTimeMs` and failure-class inspection.
- `free-safe-probe-ts-rust-wasm-focused` is the cleanest current proof that the promoted candidate can run stably on the deployed Free-tier account when the preset is lowered.
- `free-safe-probe-ts-rust-wasm-stress` extends that lower-cost validation to `c4` and `c16`.
- `free-safe-probe-rust-full-focused` and `free-safe-probe-rust-full-stress` show the same lower-cost stabilization effect for the full Rust Worker.

## Commands

Free-safe baseline:

```bash
BENCH_TRACKS=parity \
BENCH_SAMPLES=2 \
BENCH_OUTPUT=/tmp/free-safe-probe-parity-all-fixed.json \
npm run bench:local
```

Standard finalists:

```bash
BENCH_CANDIDATES=ts-rust-wasm,rust-full \
BENCH_TRACKS=parity \
BENCH_SAMPLES=2 \
BENCH_OUTPUT=/tmp/standard-recommended-finalists.json \
npm run bench:local
```

Standard finalists with CPU tail capture:

```bash
BENCH_CANDIDATES=ts-rust-wasm,rust-full \
BENCH_TRACKS=parity \
BENCH_SAMPLES=2 \
BENCH_OUTPUT=/tmp/standard-recommended-finalists-cpu.json \
npm run bench:cpu
```

Focused rerun for the promoted candidate:

```bash
BENCH_CANDIDATES=ts-rust-wasm \
BENCH_TRACKS=parity \
BENCH_INPUTS=utf8-12,utf8-32,utf8-96 \
BENCH_CONCURRENCY=1,4,16 \
BENCH_SAMPLES=3 \
BENCH_VERIFY_SEED_RETRIES=3 \
BENCH_SCENARIO_COOLDOWN_MS=250 \
BENCH_OUTPUT=bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.json \
npm run bench:local
```

Lower-cost focused validation for the promoted candidate:

```bash
BENCH_CANDIDATES=ts-rust-wasm \
BENCH_TRACKS=parity \
BENCH_INPUTS=utf8-12,utf8-32,utf8-96 \
BENCH_PATHS=direct,binding \
BENCH_CONCURRENCY=1 \
BENCH_SAMPLES=3 \
BENCH_VERIFY_SEED_RETRIES=3 \
BENCH_SCENARIO_COOLDOWN_MS=250 \
BENCH_OUTPUT=bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.json \
npm run bench:local
```

Lower-cost stress follow-up:

```bash
BENCH_CANDIDATES=ts-rust-wasm \
BENCH_TRACKS=parity \
BENCH_INPUTS=utf8-12,utf8-32,utf8-96 \
BENCH_PATHS=direct,binding \
BENCH_CONCURRENCY=4,16 \
BENCH_SAMPLES=2 \
BENCH_VERIFY_SEED_RETRIES=3 \
BENCH_SCENARIO_COOLDOWN_MS=250 \
BENCH_OUTPUT=bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.json \
npm run bench:local
```

Lower-cost focused validation for the full Rust Worker:

```bash
BENCH_CANDIDATES=rust-full \
BENCH_TRACKS=parity \
BENCH_INPUTS=utf8-12,utf8-32,utf8-96 \
BENCH_PATHS=direct,binding \
BENCH_CONCURRENCY=1 \
BENCH_SAMPLES=3 \
BENCH_VERIFY_SEED_RETRIES=3 \
BENCH_SCENARIO_COOLDOWN_MS=250 \
BENCH_OUTPUT=bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.json \
npm run bench:local
```

Lower-cost stress follow-up for the full Rust Worker:

```bash
BENCH_CANDIDATES=rust-full \
BENCH_TRACKS=parity \
BENCH_INPUTS=utf8-12,utf8-32,utf8-96 \
BENCH_PATHS=direct,binding \
BENCH_CONCURRENCY=4,16 \
BENCH_SAMPLES=2 \
BENCH_VERIFY_SEED_RETRIES=3 \
BENCH_SCENARIO_COOLDOWN_MS=250 \
BENCH_OUTPUT=bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.json \
npm run bench:local
```

## Headline metrics

Free-safe baseline:

- `ts-rust-wasm`: overall avg success `1.0000`
- `rust-full`: overall avg success `1.0000`
- `ts-direct`: overall avg success `0.5544`

Standard finalists:

- `ts-rust-wasm`: overall avg success `0.8921`
- `rust-full`: overall avg success `0.7648`
- `ts-rust-wasm` UTF-8 avg success: `0.7841`
- `rust-full` UTF-8 avg success: `0.5301`

Standard finalists CPU-tail addendum:

- `ts-rust-wasm`: successful hash/verify avg `CPUTimeMs p50` `41.389`
- `rust-full`: successful hash/verify avg `CPUTimeMs p50` `35.000`
- CPU time alone did not predict the winner; `rust-full` still had the weaker stability profile

Focused rerun for `ts-rust-wasm`:

- average success by concurrency: `c1=0.8889`, `c4=0.9167`, `c16=0.8941`
- average success by input: `utf8-12=0.9670`, `utf8-32=0.9010`, `utf8-96=0.8316`
- focused reruns removed the old verify-seed ambiguity, but `binding` still hit CPU-limit errors for some UTF-8 scenarios on the current deployed account

Lower-cost focused rerun for `ts-rust-wasm`:

- `direct + binding + c1` on `utf8-12`, `utf8-32`, and `utf8-96`: `18/18` scenarios succeeded
- `c4` and `c16` stress follow-up on the same UTF-8 inputs: `36/36` scenarios succeeded
- no CPU-limit, `500`, or `503` errors were recorded in the saved lower-cost follow-up profiles

Lower-cost focused rerun for `rust-full`:

- `direct + binding + c1` on `utf8-12`, `utf8-32`, and `utf8-96`: `18/18` scenarios succeeded
- `c4` and `c16` stress follow-up on the same UTF-8 inputs: `36/36` scenarios succeeded
- no CPU-limit, `500`, or `503` errors were recorded in the saved lower-cost follow-up profiles

## Error summary

From the committed `standard-recommended-finalists` wall-time profile:

- `27` non-JSON `500` responses
- `18` runtime-canceled-as-hung responses
- `13` explicit CPU-limit failures
- `9` non-JSON `503` responses

That means "move to Paid" is not a full answer by itself. Some failures are plausibly CPU-budget related, but some are not.

## Plan interpretation

Cloudflare documents a `10 ms` HTTP request CPU cap on Workers Free and a default `30,000 ms` cap on Paid, configurable up to `300,000 ms`.

The saved CPU-tail profile includes successful requests above `10 ms`, so these measurements were very likely not constrained by the Free `10 ms` cap alone. This is an inference from the committed trace data plus Cloudflare's published limits.

## Current recommendation

The final default template recommendation is `ts-rust-wasm`.

Why:

- it stayed ahead of `rust-full` on the `standard-recommended` finalist sweep
- it handled the UTF-8 scenarios better under the same preset
- it preserved the TypeScript Worker shell while keeping the hashing kernel in Rust Wasm

## Temporary stability guidance

Use these profiles with the current benchmark-runner caveats in mind:

- treat focused `direct c1` runs as the current implementation acceptance gate
- treat focused `binding c1` runs as account-specific service-binding validation
- treat `concurrency=4` as stress-only
- treat `concurrency=16` as exploratory only
- keep a Paid-only `limits.cpu_ms` retest in backlog until a Paid account is available

The runner now retries and caches verify seed hashes, so verify failures are cleaner than before. But long sweeps still represent accumulated pressure rather than pristine single-scenario measurements.
