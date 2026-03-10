# AssemblyScript Kernel Scaffold

This package is intentionally kept out of the baseline benchmark matrix.

It exists to answer one narrow question: how much implementation and startup overhead is involved when the team explores a TypeScript-like WebAssembly path on Cloudflare Workers.

## What is included

- A minimal AssemblyScript kernel that compiles to WebAssembly.
- A local build script: `npm --workspace @cloudflare-auth-hasher/assemblyscript-kernel run build`
- No Worker wrapper yet. The baseline workspace continues to compare:
  - `ts-direct`
  - `ts-rust-wasm`
  - `rust-full`

## Why it is excluded from v1 scoring

- The baseline benchmark compares equivalent Argon2id behavior across direct and service-binding paths.
- AssemblyScript is currently a feasibility track, not a parity candidate.
- Its output is still useful for cold-start experiments, bundle inspection, and future prototype work.
