# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/standard-recommended-ts-rust-wasm-focused.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 88.53ms | 88.53ms | 310.78ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 125.14ms | 125.14ms | 138.46ms | none |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 125.87ms | 125.87ms | 123.57ms | none |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 82.99ms | 82.99ms | 247.65ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 119.75ms | 119.75ms | 120.57ms | none |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-12.c1 | 1 | n/a | n/a | 141.27ms | 141.27ms | 132.31ms | none |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 75.23ms | 238.81ms | 113.64ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 125.17ms | 157.23ms | 127.45ms | none |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 126.39ms | 182.18ms | 182.41ms | none |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 84.67ms | 233.14ms | 79.14ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 129.00ms | 175.32ms | 175.78ms | none |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-12.c4 | 1 | n/a | n/a | 128.14ms | 141.95ms | 117.86ms | none |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-12.c16 | 1 | n/a | n/a | 78.80ms | 216.34ms | 78.23ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-12.c16 | 0.875 | n/a | n/a | 140.76ms | 215.53ms | 141.54ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-12.c16 | 0.875 | n/a | n/a | 125.56ms | 205.41ms | 128.66ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-12.c16 | 1 | n/a | n/a | 92.58ms | 241.81ms | 88.83ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-12.c16 | 0.8958 | n/a | n/a | 126.81ms | 181.84ms | 181.84ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-12.c16 | 0.9583 | n/a | n/a | 136.06ms | 206.49ms | 208.15ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 76.46ms | 76.46ms | 77.78ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 129.53ms | 129.53ms | 129.81ms | none |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 125.52ms | 125.52ms | 125.42ms | none |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 89.85ms | 89.85ms | 99.33ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 133.26ms | 133.26ms | 150.39ms | none |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-32.c1 | 1 | n/a | n/a | 124.56ms | 124.56ms | 138.03ms | none |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-32.c4 | 1 | n/a | n/a | 77.18ms | 214.02ms | 77.18ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-32.c4 | 0.8333 | n/a | n/a | 122.78ms | 136.18ms | 124.46ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-32.c4 | 0.8333 | n/a | n/a | 118.72ms | 125.55ms | 122.86ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-32.c4 | 1 | n/a | n/a | 86.20ms | 273.49ms | 123.83ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-32.c4 | 0.9167 | n/a | n/a | 126.25ms | 169.03ms | 169.03ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-32.c4 | 0.75 | n/a | n/a | 118.51ms | 128.60ms | 118.51ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-32.c16 | 1 | n/a | n/a | 76.58ms | 237.55ms | 98.27ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-32.c16 | 0.8333 | n/a | n/a | 133.10ms | 241.54ms | 115.19ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-32.c16 | 0.9167 | n/a | n/a | 141.29ms | 228.31ms | 134.74ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-32.c16 | 1 | n/a | n/a | 86.99ms | 254.75ms | 80.75ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-32.c16 | 0.9583 | n/a | n/a | 135.36ms | 212.33ms | 248.58ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-32.c16 | 0.7708 | n/a | n/a | 140.59ms | 200.31ms | 187.16ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-96.c1 | 1 | n/a | n/a | 82.73ms | 82.73ms | 78.53ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-96.c1 | 1 | n/a | n/a | 137.46ms | 137.46ms | 116.38ms | none |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-96.c1 | 1 | n/a | n/a | 121.00ms | 121.00ms | 121.00ms | none |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-96.c1 | 1 | n/a | n/a | 88.70ms | 88.70ms | 103.36ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-96.c1 | 0.3333 | n/a | n/a | 140.96ms | 140.96ms | 140.96ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-96.c1 | 0.3333 | n/a | n/a | 113.48ms | 113.48ms | 113.48ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-96.c4 | 1 | n/a | n/a | 74.43ms | 244.08ms | 96.26ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-96.c4 | 1 | n/a | n/a | 127.00ms | 170.28ms | 130.32ms | none |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-96.c4 | 1 | n/a | n/a | 126.41ms | 192.78ms | 192.78ms | none |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-96.c4 | 1 | n/a | n/a | 86.32ms | 236.09ms | 90.97ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-96.c4 | 0.75 | n/a | n/a | 121.41ms | 136.06ms | 121.36ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-96.c4 | 0.9167 | n/a | n/a | 125.54ms | 138.73ms | 86.98ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.standard-recommended.utf8-96.c16 | 1 | n/a | n/a | 111.56ms | 241.78ms | 81.54ms | none |
| ts-rust-wasm.direct.hash.parity.standard-recommended.utf8-96.c16 | 0.9792 | n/a | n/a | 139.38ms | 226.96ms | 137.15ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.direct.verify.parity.standard-recommended.utf8-96.c16 | 0.9375 | n/a | n/a | 135.04ms | 210.41ms | 135.04ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-rust-wasm.binding.noop.parity.standard-recommended.utf8-96.c16 | 1 | n/a | n/a | 88.63ms | 230.75ms | 89.20ms | none |
| ts-rust-wasm.binding.hash.parity.standard-recommended.utf8-96.c16 | 0.9792 | n/a | n/a | 167.74ms | 251.75ms | 153.82ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.binding.verify.parity.standard-recommended.utf8-96.c16 | 0.75 | n/a | n/a | 132.70ms | 221.67ms | 146.85ms | Worker exceeded CPU time limit. |
