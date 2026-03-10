# Using The Hasher From Another Worker

The promoted integration target in this repository is [`ts-rust-wasm`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/ts-rust-wasm/README.md).

Use it through a private Cloudflare service binding and WorkerEntrypoint RPC, not through the public benchmark HTTP routes.

Cloudflare's reference for this model is:

- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [RPC via WorkerEntrypoint](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)

## Why this path

- It keeps password hashing off the public internet path between your Workers.
- It matches the same RPC surface used in the benchmark gateway.
- It keeps the app Worker thin while the hasher Worker owns the CPU-heavy kernel.

The public `/_bench/*` routes exist for benchmarking and smoke checks only.

## RPC contract

The hasher Worker exposes two RPC methods:

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`

Those types are already captured in [`packages/contracts/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/contracts/src/index.ts).

## `wrangler.jsonc` binding

In the calling Worker, add a service binding that points at the deployed `ts-rust-wasm` Worker.

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
      "service": "auth-hasher-ts-rust-wasm",
      "remote": true
    }
  ]
}
```

Notes:

- `remote: true` matters for local development. It lets `wrangler dev` call the deployed hasher Worker in your Cloudflare account.
- In deployed production traffic, the service binding still stays private to Cloudflare's internal Worker-to-Worker path.

## Minimal caller example

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

`ensureAuthHasherBinding()` throws early if the binding is missing or has the wrong shape. The helper lives in [`packages/client/src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts).

## WorkerEntrypoint caller example

If your caller also exports a `WorkerEntrypoint`, the usage stays the same.

```ts
import { WorkerEntrypoint } from "cloudflare:workers";
import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import { ensureAuthHasherBinding } from "@cloudflare-auth-hasher/client";

type Env = {
  AUTH_HASHER: AuthHasherBinding;
};

export default class AppWorker extends WorkerEntrypoint<Env> {
  async fetch(): Promise<Response> {
    const hasher = ensureAuthHasherBinding(this.env, "AUTH_HASHER");
    const hash = await hasher.hashPassword("worker-entrypoint-secret");
    return Response.json({ hash });
  }
}
```

## Better Auth integration

If your app uses Better Auth, start from the adapter in [`packages/better-auth-adapter/README.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/better-auth-adapter/README.md). It prefers the `AUTH_HASHER` service binding when running on Workers and falls back to local Better Auth hashing outside Workers.

## Rehash-on-login example

If you start on a lower-cost preset and later move to a stronger preset, existing hashes still verify because Argon2 stores its parameters in the PHC string. The part you still need is rehash-on-login.

```ts
import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import {
  STANDARD_RECOMMENDED_PRESET,
  ensureAuthHasherBinding,
  needsPasswordRehash
} from "@cloudflare-auth-hasher/client";

type Env = {
  AUTH_HASHER: AuthHasherBinding;
};

async function verifyAndUpgradePassword(
  env: Env,
  storedHash: string,
  password: string,
  persistNextHash: (hash: string) => Promise<void>
): Promise<boolean> {
  const hasher = ensureAuthHasherBinding(env, "AUTH_HASHER");
  const verified = await hasher.verifyPassword(storedHash, password);

  if (!verified) {
    return false;
  }

  if (needsPasswordRehash(storedHash, STANDARD_RECOMMENDED_PRESET)) {
    const nextHash = await hasher.hashPassword(password);
    await persistNextHash(nextHash);
  }

  return true;
}
```

`needsPasswordRehash()` returns `true` for:

- legacy Better Auth `salt:key` scrypt hashes
- Argon2 hashes that are below the current target preset
- Argon2 hashes with a different stored version than the current repository baseline

## Free-to-Paid transition checklist

When moving a deployment from Workers Free to Workers Paid:

1. Raise the target preset from a lower-cost probe to `standard-recommended` or your new target.
2. Optionally set `AUTH_HASHER_WORKER_CPU_MS` before deploy if you need a higher Worker CPU budget on Paid.
3. Redeploy the hasher Worker and the caller Worker.
4. Keep verification backward-compatible by calling `verifyPassword()` against stored hashes as-is.
5. Add `needsPasswordRehash()` after successful verification so old hashes are upgraded gradually on login.

## Operational guidance

- Use `GET /` on the deployed hasher Worker to verify the active preset and Argon2 parameters after deploy.
- Keep the app Worker thin. Let the hasher Worker own hashing policy, preset selection, and future observability changes.
- Treat `standard-recommended` as a production candidate, not a universal guarantee. The saved benchmark profiles show that some failures were explicit CPU-limit errors and some were runtime cancel / `500` / `503` failures.
- On Workers Paid, increasing `limits.cpu_ms` can help pure CPU-budget failures. It does not guarantee removal of every failure class seen in the committed profiles.

## Benchmark-only routes

These routes are intentionally not the normal integration path:

- `POST /_bench/hash`
- `POST /_bench/verify`
- `GET /_bench/noop`

They exist so the repository can compare direct execution and service-binding overhead with a stable contract.
