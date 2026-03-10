import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import {
  STANDARD_2026Q1_PRESET,
  ensureAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";

type Env = {
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
    const result = await verifyAndMaybeRehash(hasher, body.storedHash, body.password, {
      targetPreset: STANDARD_2026Q1_PRESET
    });

    return Response.json(result);
  }
};
