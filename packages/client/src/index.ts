import {
  BENCH_ENDPOINTS,
  type AuthHasherBinding,
  type AuthHasherRuntimeEnv,
  type BaselineCandidate,
  type BenchmarkOperation,
  type BenchResponse,
  createBenchError,
  createBenchOk,
  DEFAULT_BENCH_PRESET_ID,
  type HashBenchRequest,
  type HashBenchResult,
  type HashPresetDefinition,
  type NoopBenchRequest,
  type NoopBenchResult,
  resolveHasherPreset,
  type VerifyBenchRequest,
  type VerifyBenchResult
} from "@cloudflare-auth-hasher/contracts";

export const isAuthHasherBinding = (value: unknown): value is AuthHasherBinding => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthHasherBinding>;
  return (
    typeof candidate.hashPassword === "function" &&
    typeof candidate.verifyPassword === "function" &&
    typeof candidate.fetch === "function"
  );
};

export const resolveAuthHasherBinding = (
  env: Record<string, unknown> | null | undefined,
  bindingName = "AUTH_HASHER"
): AuthHasherBinding | null => {
  const value = env?.[bindingName];
  return isAuthHasherBinding(value) ? value : null;
};

export const ensureAuthHasherBinding = (
  env: Record<string, unknown> | null | undefined,
  bindingName = "AUTH_HASHER"
): AuthHasherBinding => {
  const binding = resolveAuthHasherBinding(env, bindingName);
  if (!binding) {
    throw new Error(`Missing ${bindingName} service binding.`);
  }

  return binding;
};

const joinUrl = (baseUrl: string, pathname: string): string => {
  return new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
};

async function readBenchResponse<T>(response: Response): Promise<BenchResponse<T>> {
  const responseText = await response.text();
  let payload: BenchResponse<T>;

  try {
    payload = JSON.parse(responseText) as BenchResponse<T>;
  } catch (error) {
    const preview = responseText.replace(/\s+/gu, " ").trim().slice(0, 160);
    const fallback = error instanceof Error ? error.message : "empty response";
    throw new Error(
      `Benchmark request returned non-JSON content with ${response.status}: ${preview || fallback}.`
    );
  }

  if (!response.ok) {
    throw new Error(payload.error ?? `Benchmark request failed with ${response.status}.`);
  }

  return payload;
}

export const postHashBench = async (
  baseUrl: string,
  request: HashBenchRequest
): Promise<BenchResponse<HashBenchResult>> => {
  const response = await fetch(joinUrl(baseUrl, BENCH_ENDPOINTS.hash), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });

  return readBenchResponse<HashBenchResult>(response);
};

export const postVerifyBench = async (
  baseUrl: string,
  request: VerifyBenchRequest
): Promise<BenchResponse<VerifyBenchResult>> => {
  const response = await fetch(joinUrl(baseUrl, BENCH_ENDPOINTS.verify), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });

  return readBenchResponse<VerifyBenchResult>(response);
};

export const getNoopBench = async (
  baseUrl: string,
  request: NoopBenchRequest
): Promise<BenchResponse<NoopBenchResult>> => {
  const url = new URL(joinUrl(baseUrl, BENCH_ENDPOINTS.noop));
  url.searchParams.set("scenarioId", request.scenarioId);
  url.searchParams.set("candidate", request.candidate);
  url.searchParams.set("path", request.path);
  url.searchParams.set("track", request.track);
  url.searchParams.set("preset", request.preset);
  url.searchParams.set("inputId", request.inputId);
  url.searchParams.set("concurrency", String(request.concurrency));

  const response = await fetch(url);
  return readBenchResponse<NoopBenchResult>(response);
};

export const toBenchUrl = (baseUrl: string, operation: BenchmarkOperation): string => {
  return joinUrl(baseUrl, BENCH_ENDPOINTS[operation]);
};

const jsonResponse = (status: number, payload: unknown): Response => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

const readNoopRequest = (url: URL): NoopBenchRequest => ({
  scenarioId: url.searchParams.get("scenarioId") ?? "unknown",
  candidate: (url.searchParams.get("candidate") ?? "ts-direct") as NoopBenchRequest["candidate"],
  path: (url.searchParams.get("path") ?? "direct") as NoopBenchRequest["path"],
  track: (url.searchParams.get("track") ?? "parity") as NoopBenchRequest["track"],
  preset: (url.searchParams.get("preset") ?? DEFAULT_BENCH_PRESET_ID) as NoopBenchRequest["preset"],
  inputId: (url.searchParams.get("inputId") ?? "ascii-12") as NoopBenchRequest["inputId"],
  concurrency: Number(url.searchParams.get("concurrency") ?? 1)
});

interface CandidateWorkerImplementation<TEnv = AuthHasherRuntimeEnv> {
  candidate: BaselineCandidate;
  hashPassword(password: string, env?: TEnv): Promise<string>;
  verifyPassword(hash: string, password: string, env?: TEnv): Promise<boolean>;
  resolvePreset?(env?: TEnv): HashPresetDefinition;
}

const validateBenchRequest = (
  candidate: BaselineCandidate,
  expectedPresetId: string,
  request: { candidate: string; preset: string }
): void => {
  if (request.candidate !== candidate) {
    throw new Error(`Expected candidate '${candidate}' but received '${request.candidate}'.`);
  }

  if (request.preset !== expectedPresetId) {
    throw new Error(`Expected preset '${expectedPresetId}' but received '${request.preset}'.`);
  }
};

const validateDirectPath = (path: string): void => {
  if (path !== "direct") {
    throw new Error(`Expected direct benchmark path but received '${path}'.`);
  }
};

export const createCandidateFetchHandler = <TEnv = AuthHasherRuntimeEnv>(
  implementation: CandidateWorkerImplementation<TEnv>
) => {
  return async (request: Request, env?: TEnv): Promise<Response> => {
    const url = new URL(request.url);
    let scenarioId = "unknown";
    const preset = implementation.resolvePreset?.(env) ?? resolveHasherPreset(env as Record<string, unknown> | null);

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return jsonResponse(200, {
          candidate: implementation.candidate,
          preset: preset.id,
          argon2id: preset.argon2id,
          rpc: ["hashPassword", "verifyPassword"],
          bench: Object.values(BENCH_ENDPOINTS)
        });
      }

      if (request.method === "GET" && url.pathname === BENCH_ENDPOINTS.noop) {
        const payload = readNoopRequest(url);
        scenarioId = payload.scenarioId;
        validateBenchRequest(implementation.candidate, preset.id, payload);
        validateDirectPath(payload.path);
        return jsonResponse(
          200,
          createBenchOk(payload.scenarioId, {
            candidate: implementation.candidate,
            path: payload.path,
            noop: true
          } satisfies NoopBenchResult)
        );
      }

      if (request.method === "POST" && url.pathname === BENCH_ENDPOINTS.hash) {
        const payload = (await request.json()) as HashBenchRequest;
        scenarioId = payload.scenarioId;
        validateBenchRequest(implementation.candidate, preset.id, payload);
        validateDirectPath(payload.path);
        const hash = await implementation.hashPassword(payload.password, env);
        return jsonResponse(200, createBenchOk(payload.scenarioId, { hash } satisfies HashBenchResult));
      }

      if (request.method === "POST" && url.pathname === BENCH_ENDPOINTS.verify) {
        const payload = (await request.json()) as VerifyBenchRequest;
        scenarioId = payload.scenarioId;
        validateBenchRequest(implementation.candidate, preset.id, payload);
        validateDirectPath(payload.path);
        const verified = await implementation.verifyPassword(payload.hash, payload.password, env);
        return jsonResponse(
          200,
          createBenchOk(payload.scenarioId, { verified } satisfies VerifyBenchResult)
        );
      }

      return jsonResponse(
        404,
        createBenchError("unknown", "Unknown route. This Worker only exposes benchmark endpoints and RPC methods.")
      );
    } catch (error) {
      return jsonResponse(400, createBenchError(scenarioId, error));
    }
  };
};
