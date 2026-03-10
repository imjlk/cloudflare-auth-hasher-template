
> cloudflare-auth-hasher-workspace@0.1.0 bench:summary
> tsx bench/src/summarize.ts bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.json

# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-focused.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 57.41ms | 57.41ms | 198.44ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 59.19ms | 59.19ms | 71.74ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 59.77ms | 59.77ms | 58.67ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 54.38ms | 54.38ms | 153.79ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 54.48ms | 54.48ms | 70.19ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 53.38ms | 53.38ms | 56.22ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 53.26ms | 53.26ms | 55.60ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 59.00ms | 59.00ms | 59.00ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 57.97ms | 57.97ms | 57.97ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 52.73ms | 52.73ms | 53.56ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 57.96ms | 57.96ms | 57.96ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 53.92ms | 53.92ms | 55.56ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 54.18ms | 54.18ms | 54.18ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 59.77ms | 59.77ms | 58.49ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 58.22ms | 58.22ms | 60.53ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 53.46ms | 53.46ms | 53.46ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 54.47ms | 54.47ms | 54.47ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 63.67ms | 63.67ms | 63.67ms | none |
