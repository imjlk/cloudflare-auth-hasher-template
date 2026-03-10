# RPC Caller Worker Example

Minimal Worker that calls the auth hasher through a private service binding and uses `verifyAndMaybeRehash()` during a login-style request.

## What It Demonstrates

- resolving the `AUTH_HASHER` service binding
- verifying a stored hash through `WorkerEntrypoint` RPC
- deciding whether the stored hash should be upgraded
- persisting any replacement hash on the server side
- returning only non-sensitive upgrade status fields

## Local Shape

```bash
npx wrangler deploy --dry-run --config examples/rpc-caller-worker/wrangler.jsonc
```

Example request body:

```json
{
  "storedHash": "<stored password hash from your database>",
  "password": "<candidate plaintext password>"
}
```

Replace the service name in [wrangler.jsonc](./wrangler.jsonc) with your deployed hasher Worker name.
Do not send `updatedHash` back to clients. Store upgraded hashes server-side instead.
