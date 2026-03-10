# Client Helpers

Helpers for consuming the auth hasher Worker from another Worker.

## Main Helpers

- `isAuthHasherBinding(value)`
- `resolveAuthHasherBinding(env, bindingName?)`
- `ensureAuthHasherBinding(env, bindingName?)`
- `parseStoredPasswordHash(hash)`
- `assessPasswordHash(hash, targetPreset?)`
- `needsPasswordRehash(hash, targetPreset?)`
- `verifyAndMaybeRehash(hasher, storedHash, password, options?)`
- `isOwaspAlignedPreset(preset)`

Canonical preset exports:

- `STANDARD_2026Q1_PRESET`
- `FREE_TIER_FALLBACK_2026Q1_PRESET`

Compatibility export:

- `STANDARD_RECOMMENDED_PRESET`

## Recommended Use

Use these helpers with a Cloudflare service binding that targets the deployed root template Worker.

- guide: [docs/using-from-workers.md](../../docs/using-from-workers.md)
- generic example: [examples/rpc-caller-worker](../../examples/rpc-caller-worker)

`verifyAndMaybeRehash()` is the highest-level helper for gradual upgrades. It verifies the current hash first, determines whether the stored hash is below the target preset, and can hand the replacement hash to your persistence callback.

The helper also validates that the replacement hash actually satisfies the requested target preset. If the deployed hasher Worker is still configured too low, it throws instead of silently persisting another below-target hash.

## Example

```ts
import {
  STANDARD_2026Q1_PRESET,
  ensureAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";
import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";

type Env = {
  AUTH_HASHER: AuthHasherBinding;
};

async function login(
  env: Env,
  storedHash: string,
  password: string,
  saveHash: (updatedHash: string) => Promise<void>
) {
  const hasher = ensureAuthHasherBinding(env, "AUTH_HASHER");

  return verifyAndMaybeRehash(hasher, storedHash, password, {
    targetPreset: STANDARD_2026Q1_PRESET,
    persistUpdatedHash: saveHash
  });
}
```
