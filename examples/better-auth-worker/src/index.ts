import type { AuthHasherBinding } from "@cloudflare-auth-hasher/contracts";
import { createAuthPasswordHasher } from "@cloudflare-auth-hasher/better-auth-adapter";
import {
  STANDARD_2026Q1_PRESET,
  resolveAuthHasherBinding,
  verifyAndMaybeRehash
} from "@cloudflare-auth-hasher/client";

type Env = {
  AUTH_HASHER?: AuthHasherBinding;
};

interface LoginRequestBody {
  storedHash: string;
  password: string;
}

const fallbackHashPassword = async (password: string): Promise<string> => {
  return `replace-with-better-auth-hash:${password}`;
};

const fallbackVerifyPassword = async (hash: string, password: string): Promise<boolean> => {
  return hash === `replace-with-better-auth-hash:${password}`;
};

const badRequest = (message: string): Response => {
  return Response.json({ error: message }, { status: 400 });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({
        route: "/login",
        method: "POST",
        description: "Demonstrates Better Auth style verification plus gradual rehash."
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

    const event = { platform: { env } };
    const betterAuthHasher = createAuthPasswordHasher(event, {
      fallback: {
        hashPassword: fallbackHashPassword,
        verifyPassword: fallbackVerifyPassword
      }
    });

    const verified = await betterAuthHasher.verify({
      hash: body.storedHash,
      password: body.password
    });

    if (!verified) {
      return Response.json({ verified: false }, { status: 401 });
    }

    const binding = resolveAuthHasherBinding(env);
    const upgrade = binding
      ? await verifyAndMaybeRehash(binding, body.storedHash, body.password, {
          targetPreset: STANDARD_2026Q1_PRESET
        })
      : {
          verified: true,
          needsRehash: false,
          rehashed: false,
          updatedHash: null,
          reasons: []
        };

    return Response.json({
      verified: true,
      usedBinding: Boolean(binding),
      rehash: {
        needsRehash: upgrade.needsRehash,
        rehashed: upgrade.rehashed,
        updatedHash: upgrade.updatedHash,
        reasons: upgrade.reasons
      }
    });
  }
};
