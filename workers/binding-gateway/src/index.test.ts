import { describe, expect, it } from "vitest";
import gateway from "./index";

describe("binding gateway", () => {
  const binding = {
    async hashPassword(password: string) {
      return `hash:${password}`;
    },
    async verifyPassword(hash: string, password: string) {
      return hash === `hash:${password}`;
    },
    async fetch(request: Request) {
      const url = new URL(request.url);
      return new Response(
        JSON.stringify({
          scenarioId: url.searchParams.get("scenarioId"),
          ok: true,
          result: {
            candidate: "ts-direct",
            path: url.searchParams.get("path"),
            noop: true
          },
          error: null
        }),
        {
          headers: { "content-type": "application/json" }
        }
      );
    }
  };

  const env = {
    TS_DIRECT: binding,
    TS_RUST_WASM: binding,
    RUST_FULL: binding
  };

  it("proxies hash and verify over service bindings", async () => {
    const hashResponse = await gateway.fetch(
      new Request("https://example.com/_bench/hash", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: "binding-hash",
          candidate: "ts-direct",
          path: "binding",
          track: "parity",
          preset: "standard-recommended",
          inputId: "ascii-12",
          concurrency: 1,
          password: "secret"
        })
      }),
      env
    );

    expect(hashResponse.status).toBe(200);
    expect((await hashResponse.json()) as { result: { hash: string } }).toMatchObject({
      result: { hash: "hash:secret" }
    });

    const verifyResponse = await gateway.fetch(
      new Request("https://example.com/_bench/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: "binding-verify",
          candidate: "ts-direct",
          path: "binding",
          track: "parity",
          preset: "standard-recommended",
          inputId: "ascii-12",
          concurrency: 1,
          password: "secret",
          hash: "hash:secret"
        })
      }),
      env
    );

    expect(verifyResponse.status).toBe(200);
    expect((await verifyResponse.json()) as { result: { verified: boolean } }).toMatchObject({
      result: { verified: true }
    });
  });

  it("proxies noop through fetch", async () => {
    const response = await gateway.fetch(
      new Request(
        "https://example.com/_bench/noop?scenarioId=noop-1&candidate=ts-direct&path=binding&track=parity&preset=standard-recommended&inputId=ascii-12&concurrency=1"
      ),
      env
    );

    expect(response.status).toBe(200);
    expect((await response.json()) as { result: { noop: boolean } }).toMatchObject({
      result: { noop: true }
    });
  });
});
