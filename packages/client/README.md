# Client Helpers

Helpers for consuming the auth hasher Worker from another Worker.

## Main helpers

- `isAuthHasherBinding(value)`
- `resolveAuthHasherBinding(env, bindingName?)`
- `ensureAuthHasherBinding(env, bindingName?)`
- `parseStoredPasswordHash(hash)`
- `assessPasswordHash(hash, targetPreset?)`
- `needsPasswordRehash(hash, targetPreset?)`
- `isOwaspAlignedPreset(preset)`

These helpers are implemented in [`src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts).

## Recommended use

Use these helpers with a Cloudflare service binding that targets the promoted [`ts-rust-wasm`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/ts-rust-wasm/README.md) Worker.

Full guide:

- [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)

Use the hash-assessment helpers when you raise Argon2 cost later and want `rehash-on-login` behavior without breaking verification of older hashes.
