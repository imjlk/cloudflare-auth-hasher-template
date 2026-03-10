# Using The Hasher From Another Worker

Use this Worker through a private Cloudflare service binding and `WorkerEntrypoint` RPC.

References:

- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [RPC via WorkerEntrypoint](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)

## RPC Contract

The Worker exposes:

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`

The shared types live in [`packages/contracts`](../packages/contracts/src/index.ts).

## Service Binding Configuration

In the calling Worker, add a service binding that points at the deployed hasher Worker name.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-app-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-03-10",
  "compatibility_flags": ["nodejs_compat"],
  "services": [
    {
      "binding": "AUTH_HASHER",
      "service": "cloudflare-auth-hasher-template",
      "remote": true
    }
  ]
}
```

Replace `"cloudflare-auth-hasher-template"` with the actual Worker name you deployed.

`remote: true` matters during local `wrangler dev` because it lets your local caller reach the deployed hasher Worker over Cloudflare's private service-binding path.

## Minimal Caller Example

```ts
import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import { ensureAuthHasherBinding } from "@cloudflare-auth-hasher/client";

type Env = {
  AUTH_HASHER: AuthHasherBinding;
};

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const hasher = ensureAuthHasherBinding(env, "AUTH_HASHER");
    const password = "correct horse battery staple";
    const hash = await hasher.hashPassword(password);
    const verified = await hasher.verifyPassword(hash, password);

    return Response.json({ verified, hash });
  }
};
```

## Rehash-On-Login With `verifyAndMaybeRehash()`

If you later raise the target preset, old hashes still verify. The upgrade step is rehash-on-login.

```ts
import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import {
  STANDARD_2026Q1_PRESET,
  ensureAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";

type Env = {
  AUTH_HASHER: AuthHasherBinding;
};

async function verifyPasswordAndUpgrade(
  env: Env,
  storedHash: string,
  password: string,
  persistNextHash: (nextHash: string) => Promise<void>
): Promise<boolean> {
  const hasher = ensureAuthHasherBinding(env, "AUTH_HASHER");
  const result = await verifyAndMaybeRehash(hasher, storedHash, password, {
    targetPreset: STANDARD_2026Q1_PRESET,
    persistUpdatedHash: async (nextHash) => {
      await persistNextHash(nextHash);
    }
  });

  return result.verified;
}
```

`verifyAndMaybeRehash()` returns:

- `verified`
- `needsRehash`
- `rehashed`
- `updatedHash`
- `reasons`

`reasons` tells you why the stored hash was considered below the current target. That includes legacy Better Auth scrypt hashes and lower-cost Argon2 hashes.

## Better Auth Integration

If your app uses Better Auth, start from [`packages/better-auth-adapter`](../packages/better-auth-adapter/README.md). It resolves the `AUTH_HASHER` service binding automatically on Workers and falls back to local Better Auth hashing outside Workers.

## Operational Notes

- `GET /` returns metadata for health checks and deploy verification.
- Runtime metadata always emits canonical preset IDs such as `standard-2026q1`, even if you configured a legacy alias.
- `standard-2026q1` is the template's OWASP-aligned floor.
- `free-tier-fallback-2026q1` is a platform fallback for constrained Workers Free deployments, not a general security recommendation.
- On Workers Paid, `AUTH_HASHER_WORKER_CPU_MS` can be used at deploy time to inject `limits.cpu_ms` if a higher Worker CPU budget is required.
