# Security And Operations

This template is designed to be used as a private password-hashing service inside Cloudflare Workers, not as a public password API.

## Public Surface

By default, the Worker exposes:

- `hashPassword()` over `WorkerEntrypoint` RPC
- `verifyPassword()` over `WorkerEntrypoint` RPC
- `GET /` for metadata, health checks, and deploy verification

All other public HTTP routes return `404`.

If you do not want the metadata route after deployment verification, set:

```bash
export AUTH_HASHER_ENABLE_METADATA_ROUTE=false
```

That makes `GET /` return `404`.

## Why The Metadata Route Exists

`GET /` exists so operators can quickly confirm:

- the Worker is deployed and reachable
- the active canonical preset ID
- the active Argon2id parameters
- whether the active preset is OWASP-aligned

That is useful during first deploys, Free-to-Paid migration, and post-change validation. If your environment does not allow that public metadata route, disable it after deployment checks are complete.

## Observability Defaults

The root [wrangler.jsonc](../wrangler.jsonc) ships with:

- `workers_dev: true`
- persisted logs
- persisted traces
- `head_sampling_rate: 1`

These defaults make first deploys easier to validate and debug. They are not a claim that every production environment should keep the same persistence settings.

Recommended production review items:

- whether persisted logs match your policy
- whether persisted traces match your policy
- whether `workers_dev` should remain enabled
- whether a custom route and tighter public exposure are preferable

## Log Hygiene

The template does not intentionally log plaintext passwords or password hashes.

Operational expectations:

- do not add request logging that includes plaintext passwords
- do not log full password hashes
- keep exception handling from echoing credentials into logs
- tail logs during first deploys to verify your application code does not leak secret material

## Secret Handling

Do not place secrets in source or `wrangler.jsonc`.

Use:

- `wrangler secret put` for deployed secrets
- `.dev.vars` or local environment variables for local development
- `mise.local.toml` only for local machine state, never for committed credentials

## Preset Guidance

- `standard-2026q1` is the repository's OWASP-aligned floor
- `free-tier-fallback-2026q1` is an operational fallback for constrained Workers Free deployments
- the fallback preset is not presented as the template's security baseline

If you start with the fallback and later move to the standard preset, old hashes continue to verify. Use `verifyAndMaybeRehash()` or `needsPasswordRehash()` in the caller to replace weaker hashes after successful login.

## Maintenance Expectations

Review this template at least quarterly:

- update `compatibility_date`
- review Cloudflare runtime changes
- refresh the Rust/Wasm kernel and verify no committed artifact drift
- revisit preset guidance against current Cloudflare plan limits and current password-storage guidance
