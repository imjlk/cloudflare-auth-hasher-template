import {
  BINDING_NAMES,
  type AuthHasherBinding,
  type BaselineCandidate,
  DEFAULT_BENCH_PRESET_ID,
  type HashBenchRequest,
  type BenchmarkPreset,
  type VerifyBenchRequest,
  createBenchError,
  createBenchOk
} from "@cloudflare-auth-hasher/contracts";
import { isAuthHasherBinding } from "@cloudflare-auth-hasher/client";

type Env = Record<(typeof BINDING_NAMES)[BaselineCandidate], AuthHasherBinding>;

const jsonResponse = (status: number, payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

const resolveBinding = (env: Env, candidate: BaselineCandidate): AuthHasherBinding => {
  const binding = env[BINDING_NAMES[candidate]];
  if (!isAuthHasherBinding(binding)) {
    throw new Error(`Missing service binding for candidate '${candidate}'.`);
  }

  return binding;
};

const readNoopRequest = (url: URL) => ({
  scenarioId: url.searchParams.get("scenarioId") ?? "unknown",
  candidate: (url.searchParams.get("candidate") ?? "ts-direct") as BaselineCandidate,
  path: "binding" as const,
  track: (url.searchParams.get("track") ?? "parity") as "parity" | "deployment",
  preset: (url.searchParams.get("preset") ?? DEFAULT_BENCH_PRESET_ID) as BenchmarkPreset,
  inputId: (url.searchParams.get("inputId") ?? "ascii-12") as HashBenchRequest["inputId"],
  concurrency: Number(url.searchParams.get("concurrency") ?? 1)
});

const requestForBindingNoop = (original: URL): Request => {
  const url = new URL(original);
  url.pathname = "/_bench/noop";
  url.searchParams.set("path", "direct");
  return new Request(url.toString(), { method: "GET" });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let scenarioId = "unknown";

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return jsonResponse(200, {
          candidate: "binding-gateway",
          bench: ["/_bench/hash", "/_bench/verify", "/_bench/noop"],
          supports: Object.keys(BINDING_NAMES)
        });
      }

      if (request.method === "GET" && url.pathname === "/_bench/noop") {
        const payload = readNoopRequest(url);
        scenarioId = payload.scenarioId;
        const binding = resolveBinding(env, payload.candidate);
        const response = await binding.fetch(requestForBindingNoop(url));
        return jsonResponse(response.status, await response.json());
      }

      if (request.method === "POST" && url.pathname === "/_bench/hash") {
        const payload = (await request.json()) as HashBenchRequest;
        scenarioId = payload.scenarioId;
        if (payload.path !== "binding") {
          throw new Error(`Expected binding benchmark path but received '${payload.path}'.`);
        }
        const binding = resolveBinding(env, payload.candidate as BaselineCandidate);
        const hash = await binding.hashPassword(payload.password);
        return jsonResponse(200, createBenchOk(payload.scenarioId, { hash }));
      }

      if (request.method === "POST" && url.pathname === "/_bench/verify") {
        const payload = (await request.json()) as VerifyBenchRequest;
        scenarioId = payload.scenarioId;
        if (payload.path !== "binding") {
          throw new Error(`Expected binding benchmark path but received '${payload.path}'.`);
        }
        const binding = resolveBinding(env, payload.candidate as BaselineCandidate);
        const verified = await binding.verifyPassword(payload.hash, payload.password);
        return jsonResponse(200, createBenchOk(payload.scenarioId, { verified }));
      }

      return jsonResponse(
        404,
        createBenchError("unknown", "Unknown route. This Worker is only intended to proxy benchmark traffic.")
      );
    } catch (error) {
      return jsonResponse(400, createBenchError(scenarioId, error));
    }
  }
};
