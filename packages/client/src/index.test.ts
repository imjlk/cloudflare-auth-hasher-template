import { describe, expect, it } from "vitest";
import { createCandidateFetchHandler } from "./index";

describe("createCandidateFetchHandler", () => {
  const fetchHandler = createCandidateFetchHandler({
    candidate: "ts-direct",
    resolvePreset(env) {
      return env?.AUTH_HASHER_PRESET_ID
        ? {
            id: env.AUTH_HASHER_PRESET_ID,
            description: "test",
            argon2id: {
              memoryKiB: 4096,
              iterations: 1,
              parallelism: 1,
              outputLength: 32
            },
            legacyScrypt: {
              logN: 14,
              r: 16,
              p: 1,
              outputLength: 64
            }
          }
        : {
            id: "standard-recommended",
            description: "test",
            argon2id: {
              memoryKiB: 12 * 1024,
              iterations: 3,
              parallelism: 1,
              outputLength: 32
            },
            legacyScrypt: {
              logN: 14,
              r: 16,
              p: 1,
              outputLength: 64
            }
          };
    },
    async hashPassword(password) {
      return `hash:${password}`;
    },
    async verifyPassword(hash, password) {
      return hash === `hash:${password}`;
    }
  });

  it("serves the benchmark metadata route", async () => {
    const response = await fetchHandler(new Request("https://example.com/"), {
      AUTH_HASHER_PRESET_ID: "free-safe-probe"
    });
    const payload = (await response.json()) as { candidate: string; preset: string };
    expect(response.status).toBe(200);
    expect(payload.candidate).toBe("ts-direct");
    expect(payload.preset).toBe("free-safe-probe");
  });

  it("serves noop, hash, and verify routes", async () => {
    const noop = await fetchHandler(
      new Request(
        "https://example.com/_bench/noop?scenarioId=s1&candidate=ts-direct&path=direct&track=parity&preset=standard-recommended&inputId=ascii-12&concurrency=1"
      )
    );
    expect(noop.status).toBe(200);
    expect((await noop.json()) as { ok: boolean }).toMatchObject({ ok: true });

    const hash = await fetchHandler(
      new Request("https://example.com/_bench/hash", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: "s2",
          candidate: "ts-direct",
          path: "direct",
          track: "parity",
          preset: "standard-recommended",
          inputId: "ascii-12",
          concurrency: 1,
          password: "secret"
        })
      })
    );
    expect(hash.status).toBe(200);
    expect((await hash.json()) as { result: { hash: string } }).toMatchObject({
      result: { hash: "hash:secret" }
    });

    const verify = await fetchHandler(
      new Request("https://example.com/_bench/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: "s3",
          candidate: "ts-direct",
          path: "direct",
          track: "parity",
          preset: "standard-recommended",
          inputId: "ascii-12",
          concurrency: 1,
          password: "secret",
          hash: "hash:secret"
        })
      })
    );
    expect(verify.status).toBe(200);
    expect((await verify.json()) as { result: { verified: boolean } }).toMatchObject({
      result: { verified: true }
    });
  });
});
