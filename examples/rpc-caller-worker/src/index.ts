import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import {
  STANDARD_2026Q1_PRESET,
  ensureAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";

// Wrangler types service bindings as Fetcher, so narrow the binding to the
// RPC-capable shape that this template exposes.
type Env = Cloudflare.Env & {
  AUTH_HASHER: AuthHasherBinding;
};

interface LoginRequestBody {
  storedHash: string;
  password: string;
}

const badRequest = (message: string): Response => {
  return Response.json({ error: message }, { status: 400 });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({
        route: "/login",
        method: "POST",
        description: "Send storedHash + password to verify and optionally rehash through the private binding."
      });
    }

    let body: LoginRequestBody;
    try {
      body = (await request.json()) as LoginRequestBody;
    } catch {
      return badRequest("Request body must be valid JSON.");
    }

    if (!body?.storedHash || !body?.password) {
      return badRequest("storedHash and password are required.");
    }

    const hasher = ensureAuthHasherBinding(env);
    const persistUpdatedHash = async (_nextHash: string): Promise<void> => {
      // Replace this stub with your own database update.
    };

    const result = await verifyAndMaybeRehash(hasher, body.storedHash, body.password, {
      targetPreset: STANDARD_2026Q1_PRESET,
      persistUpdatedHash
    });

    return Response.json({
      verified: result.verified,
      needsRehash: result.needsRehash,
      rehashed: result.rehashed,
      reasons: result.reasons
    });
  }
};
