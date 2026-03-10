# Using The Hasher From Another Worker

Use this Worker through a private Cloudflare service binding and `WorkerEntrypoint` RPC.

References:

- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [RPC via WorkerEntrypoint](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)

## RPC Contract

The Worker exposes:

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`

Shared contracts live in [packages/contracts](../packages/contracts/src/index.ts).

## Service Binding Configuration

In the calling Worker, add a service binding that points at the deployed hasher Worker name.

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
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

Replace `"cloudflare-auth-hasher-template"` with your deployed Worker name.

`remote: true` matters during local `wrangler dev` because it lets the local caller reach the deployed hasher Worker over Cloudflare's private service-binding path.

## Primary Upgrade Path: `verifyAndMaybeRehash()`

The recommended application flow is:

1. verify the stored hash
2. detect whether the stored hash is below the current target preset
3. replace it only after successful verification

That is what `verifyAndMaybeRehash()` does.

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
    persistUpdatedHash: persistNextHash
  });

  return result.verified;
}
```

Returned fields:

- `verified`
- `needsRehash`
- `rehashed`
- `updatedHash`
- `reasons`

`reasons` tells you why the stored hash was considered below the current target. That includes legacy Better Auth scrypt hashes and lower-cost Argon2 hashes.
`updatedHash` is meant for server-side persistence only. Do not send the replacement hash back to clients in public responses.

## Preset Mismatch Failure

`verifyAndMaybeRehash()` assumes the deployed hasher Worker is already configured to the same target preset you pass in.

If the Worker still emits a weaker hash than the requested target preset, the helper throws instead of silently persisting another below-target hash.

That guard exists to keep Free-to-Paid migration explicit:

- upgrade the hasher Worker preset first
- verify the deployed metadata through `GET /`
- then let callers persist stronger hashes on login

## Generic Caller Example

See [examples/rpc-caller-worker](../examples/rpc-caller-worker) for a minimal Worker that:

- resolves the `AUTH_HASHER` binding
- accepts a login-style request
- calls `verifyAndMaybeRehash()`
- persists replacement hashes server-side
- returns only non-sensitive upgrade status fields

## Better Auth Integration

If your app uses Better Auth, start from [packages/better-auth-adapter](../packages/better-auth-adapter/README.md) and [examples/better-auth-worker](../examples/better-auth-worker).

Recommended Better Auth shape:

1. use `createAuthPasswordHasher()` for the primary Better Auth hash/verify flow
2. resolve the binding directly after successful login
3. call `verifyAndMaybeRehash()` so legacy or lower-cost hashes are replaced gradually

## Operational Notes

- `GET /` returns metadata for health checks and deploy verification by default
- set `AUTH_HASHER_ENABLE_METADATA_ROUTE=false` to disable the metadata route and make `GET /` return `404`
- metadata includes `algorithm`, template `version`, and `artifactSourceChecksum` for deploy verification
- runtime metadata always emits canonical preset IDs such as `standard-2026q1`, even if you configured a legacy alias
- `standard-2026q1` is the template's OWASP-aligned floor
- `free-tier-fallback-2026q1` is a constrained Workers Free fallback, not a general security recommendation
- on Workers Paid, `AUTH_HASHER_WORKER_CPU_MS` can be used at deploy time to inject `limits.cpu_ms`
