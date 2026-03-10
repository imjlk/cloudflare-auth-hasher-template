import {
  isMetadataRouteEnabled,
  isOwaspAlignedPreset,
  resolveHasherPreset,
  type AuthHasherMetadata,
  type AuthHasherRuntimeEnv
} from "@cloudflare-auth-hasher/contracts";

type WorkerEnv = AuthHasherRuntimeEnv;

const jsonResponse = (status: number, payload: unknown): Response => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const buildMetadata = (env?: WorkerEnv): AuthHasherMetadata => {
  const preset = resolveHasherPreset(env);
  return {
    preset: preset.id,
    argon2id: preset.argon2id,
    rpc: ["hashPassword", "verifyPassword"],
    owaspAligned: isOwaspAlignedPreset(preset)
  };
};

export const handleFetch = (request: Request, env?: WorkerEnv): Response => {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/" && isMetadataRouteEnabled(env)) {
    return jsonResponse(200, buildMetadata(env));
  }

  return jsonResponse(404, {
    error: "This Worker exposes hashPassword() and verifyPassword() through WorkerEntrypoint RPC.",
    rpc: ["hashPassword", "verifyPassword"]
  });
};
