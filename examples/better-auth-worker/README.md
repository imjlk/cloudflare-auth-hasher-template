# Better Auth Worker Example

Minimal Worker-shaped example that uses the Better Auth adapter for the primary hash/verify flow and then uses `verifyAndMaybeRehash()` for gradual upgrades.

This example does not bundle Better Auth itself. It keeps the shape small and CI-friendly, then shows where to replace the fallback helpers with `better-auth/crypto` in a real application.

## What It Demonstrates

- creating a Better Auth-style hasher from `createAuthPasswordHasher()`
- resolving the Cloudflare binding when running on Workers
- performing rehash-on-login after successful verification
- storing upgraded hashes server-side rather than returning them to clients

## Local Shape

```bash
npx wrangler deploy --dry-run --config examples/better-auth-worker/wrangler.jsonc
```

Replace the fallback helpers in [src/index.ts](./src/index.ts) with your actual Better Auth crypto functions when wiring this into an application.
Do not expose replacement hashes in public HTTP responses.
