# Benchmark Summary

Source: `/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/bench/results/profiles/2026-03-10/free-safe-probe-parity-baseline.json`

| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 154.92ms | 154.92ms | 589.20ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-12.c1 | 0 | n/a | n/a | 193.06ms | 193.06ms | 193.06ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-12.c1 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.16ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 164.02ms | 164.02ms | 503.37ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-12.c1 | 0 | n/a | n/a | 193.14ms | 193.14ms | 193.14ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-12.c1 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.03ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 157.31ms | 411.94ms | 160.04ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-12.c4 | 0 | n/a | n/a | 172.59ms | 200.24ms | 179.94ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-12.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 156.56ms | 424.56ms | 162.23ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-12.c4 | 0 | n/a | n/a | 184.72ms | 188.64ms | 188.64ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-12.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 149.35ms | 441.31ms | 149.85ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-12.c16 | 0.625 | n/a | n/a | 215.51ms | 269.23ms | 201.04ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-12.c16 | 0 | n/a | n/a | 0.02ms | 0.02ms | 0.03ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 161.25ms | 444.69ms | 161.25ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-12.c16 | 0.8125 | n/a | n/a | 294.61ms | 718.96ms | 189.24ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-12.c16 | 0 | n/a | n/a | 0.02ms | 0.07ms | 0.03ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 149.42ms | 149.42ms | 149.42ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-32.c1 | 0 | n/a | n/a | 150.50ms | 150.50ms | 179.93ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-32.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.01ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 160.11ms | 160.11ms | 160.11ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-32.c1 | 0.5 | n/a | n/a | 191.27ms | 191.27ms | 191.27ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-32.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.02ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 146.55ms | 437.87ms | 145.58ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-32.c4 | 0.375 | n/a | n/a | 180.65ms | 225.92ms | 180.65ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-32.c4 | 0 | n/a | n/a | 0.01ms | 0.02ms | 0.03ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 151.04ms | 158.87ms | 160.68ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-32.c4 | 0.5 | n/a | n/a | 190.31ms | 232.11ms | 190.31ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-32.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 150.37ms | 446.92ms | 150.77ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-32.c16 | 0.625 | n/a | n/a | 223.26ms | 306.51ms | 255.85ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-32.c16 | 0.5313 | n/a | n/a | 209.57ms | 252.13ms | 209.57ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 154.07ms | 449.58ms | 155.79ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-32.c16 | 0.75 | n/a | n/a | 258.73ms | 549.13ms | 313.39ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-32.c16 | 0.5938 | n/a | n/a | 220.93ms | 396.08ms | 330.53ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 140.90ms | 140.90ms | 140.90ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 207.44ms | 207.44ms | 223.43ms | none |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 209.12ms | 209.12ms | 209.12ms | none |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 152.33ms | 152.33ms | 156.51ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 244.83ms | 244.83ms | 255.09ms | none |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 231.08ms | 231.08ms | 231.08ms | none |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 142.90ms | 422.03ms | 141.05ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-96.c4 | 0.25 | n/a | n/a | 188.85ms | 212.89ms | 215.42ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-96.c4 | 0.25 | n/a | n/a | 157.84ms | 211.31ms | 211.31ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 165.96ms | 423.70ms | 171.42ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-96.c4 | 0.75 | n/a | n/a | 207.21ms | 234.97ms | 241.08ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-96.c4 | 0.75 | n/a | n/a | 208.63ms | 250.15ms | 254.39ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 157.70ms | 441.57ms | 141.39ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.ascii-96.c16 | 0.75 | n/a | n/a | 240.48ms | 638.82ms | 205.20ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.ascii-96.c16 | 0.5938 | n/a | n/a | 213.79ms | 570.74ms | 203.90ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 152.96ms | 451.10ms | 155.09ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.ascii-96.c16 | 0.7813 | n/a | n/a | 231.74ms | 366.92ms | 228.02ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.ascii-96.c16 | 0.8125 | n/a | n/a | 235.84ms | 365.23ms | 240.60ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 141.52ms | 141.52ms | 141.52ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 205.18ms | 205.18ms | 205.18ms | none |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 204.81ms | 204.81ms | 275.38ms | none |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 150.96ms | 150.96ms | 150.96ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 243.43ms | 243.43ms | 243.43ms | none |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-12.c1 | 0.5 | n/a | n/a | 170.43ms | 170.43ms | 170.43ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 147.21ms | 424.11ms | 142.87ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-12.c4 | 0.5 | n/a | n/a | 203.69ms | 217.45ms | 212.46ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-12.c4 | 0.5 | n/a | n/a | 164.18ms | 218.03ms | 204.57ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 154.78ms | 434.21ms | 157.72ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-12.c4 | 0.625 | n/a | n/a | 208.51ms | 239.47ms | 184.73ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-12.c4 | 0 | n/a | n/a | 0.01ms | 0.02ms | 0.06ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 149.67ms | 442.39ms | 141.73ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-12.c16 | 0.5625 | n/a | n/a | 219.75ms | 267.18ms | 220.50ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-12.c16 | 0.5625 | n/a | n/a | 210.85ms | 248.14ms | 210.85ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 151.48ms | 447.11ms | 156.90ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-12.c16 | 0.4375 | n/a | n/a | 219.20ms | 357.55ms | 208.41ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-12.c16 | 0 | n/a | n/a | 0.01ms | 0.02ms | 0.03ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 141.54ms | 141.54ms | 145.90ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-32.c1 | 0 | n/a | n/a | 163.43ms | 163.43ms | 190.63ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-32.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.01ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 155.52ms | 155.52ms | 155.52ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-32.c1 | 0 | n/a | n/a | 158.06ms | 158.06ms | 191.18ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-32.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.01ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 145.10ms | 148.48ms | 139.76ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-32.c4 | 0.25 | n/a | n/a | 171.74ms | 215.28ms | 171.74ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-32.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 153.05ms | 155.72ms | 150.35ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-32.c4 | 0.5 | n/a | n/a | 185.54ms | 241.32ms | 185.54ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-32.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 150.78ms | 444.45ms | 142.04ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-32.c16 | 0.5 | n/a | n/a | 212.91ms | 297.00ms | 171.04ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-32.c16 | 0 | n/a | n/a | 0.01ms | 0.02ms | 0.03ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 152.23ms | 454.08ms | 156.19ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-32.c16 | 0.4063 | n/a | n/a | 224.11ms | 368.90ms | 224.84ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-32.c16 | 0 | n/a | n/a | 0.01ms | 0.02ms | 0.03ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 140.43ms | 140.43ms | 140.43ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-96.c1 | 0 | n/a | n/a | 165.38ms | 165.38ms | 171.43ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-96.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.02ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 155.70ms | 155.70ms | 155.70ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-96.c1 | 0 | n/a | n/a | 161.11ms | 161.11ms | 190.13ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-96.c1 | 0 | n/a | n/a | 0.00ms | 0.00ms | 0.02ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 142.99ms | 147.98ms | 142.99ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-96.c4 | 0.25 | n/a | n/a | 172.15ms | 207.27ms | 172.15ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-96.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.02ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 152.82ms | 154.89ms | 153.16ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-96.c4 | 0.25 | n/a | n/a | 178.53ms | 230.74ms | 185.85ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-96.c4 | 0 | n/a | n/a | 0.01ms | 0.01ms | 0.03ms | Worker exceeded CPU time limit. |
| ts-direct.direct.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 147.79ms | 458.00ms | 141.48ms | none |
| ts-direct.direct.hash.parity.free-safe-probe.utf8-96.c16 | 0.5 | n/a | n/a | 212.52ms | 266.12ms | 175.69ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.direct.verify.parity.free-safe-probe.utf8-96.c16 | 0 | n/a | n/a | 0.02ms | 0.02ms | 0.03ms | Benchmark request returned non-JSON content with 503: <!DOCTYPE html> <!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]-. |
| ts-direct.binding.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 155.82ms | 434.00ms | 157.85ms | none |
| ts-direct.binding.hash.parity.free-safe-probe.utf8-96.c16 | 0.2813 | n/a | n/a | 214.90ms | 330.34ms | 208.81ms | Worker exceeded CPU time limit. |
| ts-direct.binding.verify.parity.free-safe-probe.utf8-96.c16 | 0 | n/a | n/a | 0.01ms | 0.03ms | 0.04ms | Worker exceeded CPU time limit. |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 149.51ms | 149.51ms | 436.02ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 151.94ms | 151.94ms | 155.26ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 153.72ms | 153.72ms | 153.72ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 155.96ms | 155.96ms | 155.96ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 160.64ms | 160.64ms | 160.64ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 162.16ms | 162.16ms | 162.29ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 152.91ms | 429.20ms | 154.06ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 156.85ms | 158.12ms | 157.12ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 154.35ms | 158.19ms | 158.19ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 159.80ms | 443.88ms | 159.80ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 156.69ms | 166.21ms | 157.97ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 157.44ms | 163.52ms | 160.92ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 150.83ms | 443.32ms | 149.41ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 159.80ms | 167.07ms | 161.92ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 166.40ms | 247.22ms | 253.73ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 157.99ms | 448.57ms | 157.19ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 167.56ms | 588.08ms | 171.37ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 160.03ms | 170.63ms | 169.26ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 150.00ms | 150.00ms | 152.38ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 155.77ms | 155.77ms | 156.89ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 152.84ms | 152.84ms | 157.17ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 159.44ms | 159.44ms | 159.44ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 161.27ms | 161.27ms | 165.65ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 160.97ms | 160.97ms | 164.88ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 158.31ms | 440.71ms | 148.07ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 157.17ms | 157.66ms | 157.42ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 153.39ms | 156.09ms | 152.71ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 160.45ms | 162.13ms | 161.47ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 156.99ms | 160.36ms | 160.36ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 158.79ms | 161.53ms | 161.73ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 152.11ms | 452.31ms | 153.11ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 158.62ms | 164.91ms | 156.61ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 157.34ms | 163.12ms | 159.59ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 156.72ms | 448.27ms | 157.24ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 160.09ms | 172.34ms | 170.18ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 171.05ms | 180.89ms | 180.89ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 150.35ms | 150.35ms | 150.35ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 156.53ms | 156.53ms | 156.53ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 157.25ms | 157.25ms | 159.68ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 159.22ms | 159.22ms | 159.38ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 164.32ms | 164.32ms | 164.32ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 164.11ms | 164.11ms | 164.11ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 147.53ms | 152.17ms | 149.98ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 155.70ms | 157.47ms | 154.77ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 157.36ms | 160.61ms | 160.32ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 154.78ms | 160.29ms | 160.29ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 155.21ms | 162.93ms | 163.18ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 158.55ms | 160.14ms | 162.57ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 150.82ms | 448.28ms | 147.13ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 158.99ms | 175.42ms | 169.02ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 155.11ms | 168.95ms | 157.50ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 158.19ms | 448.91ms | 160.45ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 160.57ms | 167.84ms | 164.28ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 159.35ms | 167.61ms | 177.50ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 150.32ms | 150.32ms | 151.40ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 155.95ms | 155.95ms | 156.25ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 154.94ms | 154.94ms | 155.28ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 157.13ms | 157.13ms | 160.13ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 161.42ms | 161.42ms | 161.42ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 162.30ms | 162.30ms | 162.30ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 149.26ms | 159.24ms | 149.26ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 157.85ms | 159.05ms | 159.18ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 154.78ms | 158.10ms | 152.57ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 155.56ms | 157.86ms | 157.86ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 158.46ms | 161.21ms | 161.21ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 162.31ms | 163.66ms | 163.90ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 150.75ms | 448.96ms | 153.46ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 159.91ms | 167.68ms | 160.41ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 161.67ms | 172.05ms | 161.67ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 158.65ms | 450.96ms | 159.48ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 162.10ms | 173.21ms | 163.13ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 158.84ms | 172.75ms | 163.70ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 149.20ms | 149.20ms | 149.20ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 154.35ms | 154.35ms | 154.79ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 155.27ms | 155.27ms | 156.31ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 156.17ms | 156.17ms | 156.17ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 165.39ms | 165.39ms | 174.62ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 162.11ms | 162.11ms | 162.11ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 151.30ms | 152.05ms | 152.05ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 155.18ms | 157.52ms | 154.71ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 155.56ms | 160.00ms | 155.58ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 157.07ms | 161.00ms | 160.94ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 159.24ms | 162.16ms | 159.50ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 156.19ms | 161.21ms | 161.21ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 153.21ms | 448.66ms | 153.01ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 161.41ms | 167.88ms | 156.28ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 163.73ms | 168.35ms | 161.53ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 154.97ms | 450.26ms | 164.34ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 165.25ms | 177.44ms | 181.93ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 167.22ms | 173.35ms | 173.83ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 150.83ms | 150.83ms | 150.83ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 154.09ms | 154.09ms | 154.09ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 158.38ms | 158.38ms | 158.38ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 158.93ms | 158.93ms | 158.93ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 160.41ms | 160.41ms | 160.41ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 159.87ms | 159.87ms | 159.87ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 148.94ms | 152.99ms | 146.91ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 155.76ms | 158.27ms | 155.73ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 159.80ms | 161.14ms | 159.80ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 156.53ms | 163.32ms | 163.68ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 158.59ms | 161.31ms | 163.24ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 157.86ms | 160.28ms | 161.19ms | none |
| ts-rust-wasm.direct.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 151.84ms | 445.72ms | 151.84ms | none |
| ts-rust-wasm.direct.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 161.00ms | 169.27ms | 167.48ms | none |
| ts-rust-wasm.direct.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 165.71ms | 170.12ms | 157.84ms | none |
| ts-rust-wasm.binding.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 161.52ms | 453.66ms | 159.38ms | none |
| ts-rust-wasm.binding.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 160.91ms | 170.72ms | 171.00ms | none |
| ts-rust-wasm.binding.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 163.26ms | 172.91ms | 168.81ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 153.33ms | 153.33ms | 446.57ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 157.60ms | 157.60ms | 158.41ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 153.80ms | 153.80ms | 156.44ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 161.51ms | 161.51ms | 161.51ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 164.60ms | 164.60ms | 164.84ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-12.c1 | 1 | n/a | n/a | 160.39ms | 160.39ms | 160.39ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 154.91ms | 448.31ms | 154.88ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 163.03ms | 169.00ms | 169.13ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 157.22ms | 165.92ms | 156.06ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 157.36ms | 451.98ms | 153.69ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 158.22ms | 165.95ms | 158.18ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-12.c4 | 1 | n/a | n/a | 160.79ms | 161.80ms | 160.98ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 154.09ms | 438.61ms | 150.52ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 163.56ms | 170.14ms | 167.93ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 167.13ms | 176.57ms | 170.75ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 158.96ms | 477.49ms | 160.75ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 169.14ms | 175.77ms | 169.66ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-12.c16 | 1 | n/a | n/a | 163.07ms | 180.43ms | 178.18ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 150.79ms | 150.79ms | 161.18ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 161.34ms | 161.34ms | 170.02ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 159.40ms | 159.40ms | 159.40ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 161.05ms | 161.05ms | 161.05ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 162.97ms | 162.97ms | 171.67ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-32.c1 | 1 | n/a | n/a | 166.53ms | 166.53ms | 166.53ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 150.33ms | 154.17ms | 150.82ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 156.82ms | 160.11ms | 159.27ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 154.05ms | 162.86ms | 158.18ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 159.10ms | 160.91ms | 159.10ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 161.32ms | 166.74ms | 161.32ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-32.c4 | 1 | n/a | n/a | 167.35ms | 167.75ms | 167.35ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 154.83ms | 446.66ms | 159.72ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 161.63ms | 175.26ms | 171.66ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 159.07ms | 167.57ms | 161.08ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 156.00ms | 462.95ms | 155.01ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 161.28ms | 175.79ms | 162.46ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-32.c16 | 1 | n/a | n/a | 159.50ms | 175.19ms | 163.90ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 148.36ms | 148.36ms | 148.87ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 153.18ms | 153.18ms | 157.69ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 153.00ms | 153.00ms | 153.00ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 159.29ms | 159.29ms | 160.54ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 160.37ms | 160.37ms | 160.37ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-96.c1 | 1 | n/a | n/a | 159.03ms | 159.03ms | 166.69ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 149.71ms | 154.41ms | 150.18ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 154.78ms | 161.00ms | 154.78ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 160.65ms | 167.31ms | 159.55ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 156.38ms | 161.53ms | 160.19ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 160.69ms | 161.29ms | 161.29ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-96.c4 | 1 | n/a | n/a | 157.60ms | 160.37ms | 159.16ms | none |
| rust-full.direct.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 150.04ms | 439.87ms | 148.21ms | none |
| rust-full.direct.hash.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 160.35ms | 173.29ms | 160.83ms | none |
| rust-full.direct.verify.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 155.90ms | 171.46ms | 158.40ms | none |
| rust-full.binding.noop.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 155.04ms | 446.20ms | 157.69ms | none |
| rust-full.binding.hash.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 161.12ms | 176.65ms | 162.62ms | none |
| rust-full.binding.verify.parity.free-safe-probe.ascii-96.c16 | 1 | n/a | n/a | 161.08ms | 172.75ms | 164.16ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 152.44ms | 152.44ms | 152.44ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 153.64ms | 153.64ms | 157.34ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 155.70ms | 155.70ms | 155.70ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 155.88ms | 155.88ms | 155.88ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 161.65ms | 161.65ms | 161.65ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c1 | 1 | n/a | n/a | 169.03ms | 169.03ms | 169.03ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 147.59ms | 153.44ms | 145.06ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 156.43ms | 159.13ms | 155.26ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 156.51ms | 159.53ms | 155.95ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 162.03ms | 162.78ms | 166.49ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 173.86ms | 586.62ms | 160.88ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c4 | 1 | n/a | n/a | 160.19ms | 164.35ms | 160.19ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 150.07ms | 447.61ms | 149.71ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 157.90ms | 176.06ms | 176.06ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 162.53ms | 174.28ms | 173.09ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 156.02ms | 451.14ms | 160.12ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 160.12ms | 173.86ms | 166.25ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-12.c16 | 1 | n/a | n/a | 163.30ms | 173.92ms | 168.13ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 149.38ms | 149.38ms | 149.38ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 154.17ms | 154.17ms | 154.43ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 155.12ms | 155.12ms | 155.12ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 163.59ms | 163.59ms | 168.60ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 161.46ms | 161.46ms | 161.46ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c1 | 1 | n/a | n/a | 160.82ms | 160.82ms | 160.82ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 147.27ms | 152.23ms | 148.14ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 160.56ms | 161.86ms | 161.86ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 153.80ms | 162.61ms | 155.32ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 157.45ms | 159.08ms | 153.09ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 159.32ms | 161.16ms | 162.34ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c4 | 1 | n/a | n/a | 159.70ms | 164.36ms | 159.34ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 153.69ms | 441.55ms | 149.70ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 157.39ms | 173.79ms | 170.59ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 157.47ms | 178.35ms | 172.82ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 161.55ms | 451.82ms | 162.28ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 160.03ms | 172.37ms | 172.37ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-32.c16 | 1 | n/a | n/a | 160.27ms | 171.91ms | 164.49ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 148.42ms | 148.42ms | 150.79ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 154.76ms | 154.76ms | 155.49ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 151.50ms | 151.50ms | 151.50ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 160.59ms | 160.59ms | 163.52ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 158.96ms | 158.96ms | 165.64ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c1 | 1 | n/a | n/a | 160.74ms | 160.74ms | 163.52ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 151.41ms | 152.02ms | 151.41ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 153.88ms | 158.74ms | 154.84ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 153.94ms | 158.89ms | 153.81ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 156.72ms | 161.48ms | 165.96ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 160.33ms | 162.07ms | 162.07ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c4 | 1 | n/a | n/a | 159.07ms | 165.86ms | 165.86ms | none |
| rust-full.direct.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 150.77ms | 443.82ms | 151.09ms | none |
| rust-full.direct.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 160.67ms | 175.73ms | 173.00ms | none |
| rust-full.direct.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 160.88ms | 171.21ms | 169.53ms | none |
| rust-full.binding.noop.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 155.47ms | 444.63ms | 154.10ms | none |
| rust-full.binding.hash.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 158.87ms | 178.95ms | 158.43ms | none |
| rust-full.binding.verify.parity.free-safe-probe.utf8-96.c16 | 1 | n/a | n/a | 159.52ms | 182.84ms | 163.26ms | none |
