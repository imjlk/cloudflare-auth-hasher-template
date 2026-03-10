
> cloudflare-auth-hasher-workspace@0.1.0 bench:summary
> tsx bench/src/summarize.ts bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.json

# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-rust-full-focused.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 60.32ms | 60.32ms | 192.68ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 63.67ms | 63.67ms | 74.98ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 72.81ms | 72.81ms | 72.81ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 54.60ms | 54.60ms | 183.14ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 57.76ms | 57.76ms | 71.11ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 56.95ms | 56.95ms | 56.95ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 61.33ms | 61.33ms | 61.33ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 65.45ms | 65.45ms | 65.45ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 61.51ms | 61.51ms | 61.51ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 55.75ms | 55.75ms | 55.75ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 53.93ms | 53.93ms | 57.23ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 56.76ms | 56.76ms | 52.94ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 58.70ms | 58.70ms | 57.37ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 63.82ms | 63.82ms | 62.75ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 64.33ms | 64.33ms | 64.33ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 65.21ms | 65.21ms | 64.55ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 55.94ms | 55.94ms | 55.94ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 55.14ms | 55.14ms | 55.72ms | none |
