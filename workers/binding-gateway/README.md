# `binding-gateway`

Benchmark-only Worker that measures service-binding overhead against the three baseline candidates.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/imjlk/cloudflare-auth-hasher-template)

When using the Deploy button for a public fork, set the Worker root directory to `workers/binding-gateway`.

## Why it exists

- Keeps the external benchmark HTTP contract stable.
- Routes `hash` and `verify` through `WorkerEntrypoint` RPC service bindings.
- Routes `noop` through `fetch()` to isolate service-binding path overhead from hashing cost.

## Local commands

```bash
npm --workspace @cloudflare-auth-hasher/binding-gateway run check
npm --workspace @cloudflare-auth-hasher/binding-gateway run dev -- --port 8790
npm --workspace @cloudflare-auth-hasher/binding-gateway run deploy
```

## Local development note

The service bindings are configured with `remote: true`, so local gateway runs are expected to call deployed baseline Workers in your Cloudflare account.
