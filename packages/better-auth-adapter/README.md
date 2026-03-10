# Better Auth Adapter

This package wraps the service binding contract for Better Auth style password hashing flows.

## What it does

- Uses `AUTH_HASHER` when running inside Cloudflare Workers.
- Falls back to local Better Auth hashing outside Cloudflare.
- Keeps the binding lookup isolated from framework-specific code.

Recommended Worker-to-Worker integration guide:

- [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)

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
