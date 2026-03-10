import { WorkerEntrypoint } from "cloudflare:workers";
import { createCandidateFetchHandler } from "@cloudflare-auth-hasher/client";
import { resolveHasherPreset, type AuthHasherRuntimeEnv } from "@cloudflare-auth-hasher/contracts";
import { hashPassword, verifyPassword } from "./hasher";

type WorkerEnv = AuthHasherRuntimeEnv;

const resolvePreset = (env?: WorkerEnv) => resolveHasherPreset(env);

const candidate = {
  candidate: "ts-direct" as const,
  resolvePreset,
  hashPassword(password: string, env?: WorkerEnv) {
    return hashPassword(password, resolvePreset(env));
  },
  verifyPassword(hash: string, password: string, env?: WorkerEnv) {
    return verifyPassword(hash, password, resolvePreset(env));
  }
};

const fetchHandler = createCandidateFetchHandler(candidate);

export default class TsDirectWorker extends WorkerEntrypoint<WorkerEnv> {
  fetch(request: Request): Promise<Response> {
    return fetchHandler(request, this.env);
  }

  hashPassword(password: string): Promise<string> {
    return candidate.hashPassword(password, this.env);
  }

  verifyPassword(hash: string, password: string): Promise<boolean> {
    return candidate.verifyPassword(hash, password, this.env);
  }
}
