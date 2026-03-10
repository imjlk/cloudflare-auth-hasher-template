
> cloudflare-auth-hasher-workspace@0.1.0 bench:summary
> tsx bench/src/summarize.ts bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.json

# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-stress.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 76.56ms | 210.42ms | 210.42ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 82.73ms | 89.18ms | 89.18ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 74.31ms | 78.71ms | 74.61ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 84.95ms | 171.64ms | 163.86ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 62.96ms | 86.23ms | 63.52ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 57.56ms | 83.89ms | 57.56ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 66.99ms | 172.97ms | 62.92ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 69.97ms | 85.20ms | 69.06ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 68.65ms | 84.16ms | 71.30ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 75.35ms | 217.67ms | 54.70ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 71.79ms | 91.80ms | 56.41ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 71.23ms | 89.16ms | 58.10ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 66.42ms | 74.21ms | 66.67ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 69.13ms | 81.08ms | 68.80ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 70.37ms | 80.49ms | 68.58ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 55.97ms | 82.78ms | 55.97ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 56.59ms | 84.50ms | 56.59ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 56.35ms | 84.59ms | 56.35ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 81.01ms | 234.44ms | 68.48ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 78.43ms | 94.29ms | 90.79ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 77.47ms | 180.85ms | 82.36ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 84.82ms | 237.99ms | 55.66ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 68.90ms | 97.87ms | 54.42ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 64.19ms | 93.64ms | 55.24ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 65.79ms | 76.99ms | 63.92ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 70.38ms | 79.87ms | 74.56ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 72.45ms | 78.75ms | 74.98ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 52.86ms | 82.76ms | 48.90ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 56.40ms | 84.45ms | 54.10ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 58.24ms | 84.16ms | 58.43ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 74.85ms | 224.64ms | 64.16ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 67.84ms | 89.71ms | 69.27ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 69.90ms | 92.00ms | 69.90ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 68.07ms | 179.78ms | 56.23ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 65.64ms | 87.65ms | 55.03ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 65.71ms | 89.37ms | 55.08ms | none |
