# Better Auth Adapter

This package wraps the service binding contract for Better Auth style password hashing flows.

## What it does

- Uses `AUTH_HASHER` when running inside Cloudflare Workers.
- Falls back to local Better Auth hashing outside Cloudflare.
- Keeps the binding lookup isolated from framework-specific code.

Recommended Worker-to-Worker integration guide:

- [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)

Note:

- This adapter keeps `hash()` and `verify()` wired to the hasher Worker.
- It does not automatically perform `rehash-on-login` when you raise Argon2 cost later.
- Use `needsPasswordRehash()` from [`@cloudflare-auth-hasher/client`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts) in your post-login flow if you want gradual hash upgrades.

## Example

```ts
import {
  hashPassword as fallbackHashPassword,
  verifyPassword as fallbackVerifyPassword
} from "better-auth/crypto";
import { createAuthPasswordHasher } from "@cloudflare-auth-hasher/better-auth-adapter";

const hasher = createAuthPasswordHasher(event, {
  fallback: {
    hashPassword: fallbackHashPassword,
    verifyPassword: fallbackVerifyPassword
  }
});
```
