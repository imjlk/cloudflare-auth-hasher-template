# Better Auth Adapter

This package wraps the auth hasher service binding for Better Auth-style password hashing flows.

## What It Does

- uses `AUTH_HASHER` when running inside Cloudflare Workers
- falls back to local Better Auth hashing outside Workers
- keeps binding lookup isolated from framework-specific code

Guides and examples:

- [docs/using-from-workers.md](../../docs/using-from-workers.md)
- [examples/better-auth-worker](../../examples/better-auth-worker)

## Rehash Behavior

This adapter keeps `hash()` and `verify()` wired to the hasher Worker, but it does not persist upgraded hashes by itself.

If you later move from `free-tier-fallback-2026q1` to `standard-2026q1`, combine Better Auth verification with `verifyAndMaybeRehash()` from [`@cloudflare-auth-hasher/client`](../client/src/index.ts) in your post-login flow.

That split is intentional:

- the adapter keeps the primary Better Auth hash/verify surface small
- `verifyAndMaybeRehash()` stays the explicit migration path for replacing weaker stored hashes

## Example

```ts
import { createAuthPasswordHasher } from "@cloudflare-auth-hasher/better-auth-adapter";

const hasher = createAuthPasswordHasher(event, {
  fallback: {
    hashPassword: fallbackHashPassword,
    verifyPassword: fallbackVerifyPassword
  }
});
```
