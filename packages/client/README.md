# Client Helpers

Helpers for consuming the auth hasher Worker from another Worker.

## Main helpers

- `isAuthHasherBinding(value)`
- `resolveAuthHasherBinding(env, bindingName?)`
- `ensureAuthHasherBinding(env, bindingName?)`

These helpers are implemented in [`src/index.ts`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/packages/client/src/index.ts).

## Recommended use

Use these helpers with a Cloudflare service binding that targets the promoted [`ts-rust-wasm`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/ts-rust-wasm/README.md) Worker.

Full guide:

- [`docs/using-from-workers.md`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/docs/using-from-workers.md)
