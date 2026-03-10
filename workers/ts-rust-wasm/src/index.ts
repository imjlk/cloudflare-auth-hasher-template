import { WorkerEntrypoint } from "cloudflare:workers";
import { createCandidateFetchHandler } from "@cloudflare-auth-hasher/client";
import { resolveHasherPreset, type AuthHasherRuntimeEnv } from "@cloudflare-auth-hasher/contracts";
import { hashPassword, verifyPassword } from "./kernel";

type WorkerEnv = AuthHasherRuntimeEnv;

const candidate = {
  candidate: "ts-rust-wasm" as const,
  resolvePreset: (env?: WorkerEnv) => resolveHasherPreset(env),
  hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  },
  verifyPassword(hash: string, password: string): Promise<boolean> {
    return verifyPassword(hash, password);
  }
};

const fetchHandler = createCandidateFetchHandler(candidate);

export default class TsRustWasmWorker extends WorkerEntrypoint<WorkerEnv> {
  fetch(request: Request): Promise<Response> {
    return fetchHandler(request, this.env);
  }

  hashPassword(password: string): Promise<string> {
    return candidate.hashPassword(password);
  }

  verifyPassword(hash: string, password: string): Promise<boolean> {
    return candidate.verifyPassword(hash, password);
  }
}
