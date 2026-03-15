# Contributing

## Local Validation

Install dependencies first:

```bash
npm install
```

Lightweight validation:

```bash
npm run types
npm run types:examples
npm run typecheck
npm run typecheck:examples
npm run check
npm run check:examples
```

Full validation with Rust:

```bash
npm test
```

## Rust And Wasm Regeneration

The committed [src/rust-wasm-kernel.wasm](./src/rust-wasm-kernel.wasm) is part of the template contract because the Deploy Button path must still work when Rust is unavailable.

If you change anything under:

- [crates/hash-core](./crates/hash-core)
- [crates/rust-wasm-kernel](./crates/rust-wasm-kernel)

then:

1. rebuild locally with Rust installed
2. run `npm run check`
3. run `npm run build:artifact` before commit so the committed Wasm artifact goes back to the default template preset
4. do not commit stale generated artifacts

CI verifies:

- `worker-configuration.d.ts` is up to date
- the default artifact build manifest matches the current Rust source set
- the example Workers still pass `wrangler deploy --dry-run`

## Documentation Expectations

Keep docs aligned with the public template posture:

- private Worker-to-Worker RPC first
- Better Auth migration-friendly examples
- canonical preset IDs only in examples and docs
- clear distinction between OWASP-aligned baseline and Free-tier fallback

## Dependency Update Policy

Dependabot owns routine dependency version updates for this repository.

- version update PRs are opened monthly
- `npm`, `cargo`, and `github-actions` are managed separately
- minor and patch updates are grouped per ecosystem
- major updates stay as separate PRs for explicit review
- security updates continue to use GitHub's default Dependabot behavior

## Quarterly Maintenance Checklist

At least once per quarter:

1. review and bump `compatibility_date`
2. review `wrangler`, TypeScript, Vitest, and Rust dependency versions
3. regenerate `worker-configuration.d.ts`
4. rebuild the Rust/Wasm kernel and confirm no unexpected artifact drift
5. re-check preset guidance against Cloudflare runtime limits
6. update release notes if template posture changes
