# Cloudflare Auth Hasher Template

Rust-based Argon2id password hashing Worker for Cloudflare service bindings.

It is designed to be deployed once per account and consumed internally by other Workers or Pages projects over a service binding RPC interface.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

If your repository URL is different, update the button target to match your GitHub repository.

## What it exposes

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(hash: string, password: string): Promise<boolean>`

## Defaults

- Argon2id: `12 MiB / t=3 / p=1`
- Output length: `32 bytes`
- Password normalization: Unicode NFKC
- Legacy compatibility: verifies `salt:key` scrypt hashes using Better Auth defaults

This makes it useful for gradual migrations from Better Auth's default scrypt hashes to Argon2id.

## Deploy

### 1. Install dependencies

```bash
npm install
```

### 2. Authenticate Wrangler

```bash
npx wrangler whoami
```

If needed:

```bash
npx wrangler login
```

### 3. Validate the Rust build

```bash
npm run check
```

### 4. Deploy

```bash
npm run deploy
```

The deployed Worker is not meant to be called over public HTTP. The supported interface is the service binding RPC surface.

For Deploy to Cloudflare and Workers Builds, keep the `build` script in `package.json`. Cloudflare pre-populates build settings from package scripts, while Workers Builds does not rely on Wrangler's custom build configuration alone.

## Bind it from another Worker

Caller `wrangler.jsonc`:

```jsonc
{
  "services": [
    {
      "binding": "AUTH_HASHER",
      "service": "cloudflare-auth-hasher-template"
    }
  ]
}
```

Caller code:

```ts
type AuthHasherBinding = {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
};

export interface Env {
  AUTH_HASHER: AuthHasherBinding;
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const hash = await env.AUTH_HASHER.hashPassword("correct horse battery staple");
    const ok = await env.AUTH_HASHER.verifyPassword(hash, "correct horse battery staple");
    return Response.json({ ok, hash });
  }
};
```

## Better Auth example

See [examples/better-auth/auth-password-hasher.ts](./examples/better-auth/auth-password-hasher.ts) and [examples/better-auth/wrangler.caller.jsonc](./examples/better-auth/wrangler.caller.jsonc).

The typical pattern is:

1. Use the service binding when running on Cloudflare.
2. Fall back to local `better-auth/crypto` hashing outside Cloudflare.
3. Rehash old scrypt credentials to Argon2id on successful login.

## Notes

- Service bindings are for internal Worker-to-Worker calls on the same Cloudflare account.
- Moving hashing into a separate Worker does not create a separate CPU budget. It mainly improves reuse, isolation, and implementation flexibility.
- Rust can outperform pure JS hashing in Workers, but the biggest practical win usually comes from choosing a more suitable algorithm and parameter set.

## Local development

```bash
npm run dev
```

## License

MIT
