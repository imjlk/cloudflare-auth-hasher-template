
> cloudflare-auth-hasher-workspace@0.1.0 bench:summary
> tsx bench/src/summarize.ts bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.json

# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-ts-rust-wasm-stress.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 79.74ms | 304.80ms | 351.49ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 73.48ms | 85.57ms | 73.48ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 67.06ms | 87.58ms | 60.40ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 89.15ms | 171.46ms | 148.48ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 70.60ms | 94.78ms | 64.19ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 61.19ms | 92.27ms | 51.60ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 74.72ms | 227.40ms | 52.58ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 70.96ms | 93.28ms | 81.96ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 71.10ms | 95.13ms | 65.56ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 80.23ms | 228.56ms | 52.15ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 70.02ms | 100.50ms | 54.25ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 71.29ms | 108.52ms | 54.56ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 56.51ms | 80.04ms | 56.86ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 68.27ms | 82.66ms | 70.32ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 73.68ms | 82.33ms | 62.75ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 57.64ms | 87.46ms | 52.13ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 60.98ms | 94.01ms | 54.45ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 62.87ms | 94.95ms | 50.24ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 74.63ms | 224.16ms | 55.32ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 71.14ms | 113.88ms | 66.44ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 70.75ms | 103.24ms | 66.61ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 78.37ms | 180.26ms | 49.06ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 73.54ms | 91.26ms | 52.29ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 70.91ms | 94.14ms | 52.51ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 55.89ms | 80.48ms | 54.53ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 68.83ms | 86.24ms | 69.02ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 64.32ms | 85.43ms | 62.37ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 56.56ms | 83.39ms | 50.48ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 60.13ms | 91.55ms | 52.92ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 62.82ms | 93.04ms | 50.77ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 61.31ms | 179.83ms | 52.74ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 72.57ms | 94.84ms | 59.99ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 72.14ms | 93.91ms | 63.39ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 67.97ms | 188.42ms | 51.94ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 72.42ms | 102.87ms | 51.70ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 71.46ms | 93.01ms | 51.79ms | none |
