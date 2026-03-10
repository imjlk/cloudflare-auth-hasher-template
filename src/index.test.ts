import { describe, expect, it } from "vitest";
import { handleFetch } from "./fetch-handler";

describe("AuthHasherTemplateWorker", () => {
  it("returns canonical metadata on GET /", async () => {
    const response = handleFetch(new Request("https://example.com/"), {
      AUTH_HASHER_PRESET_ID: "standard-recommended"
    });
    const payload = (await response.json()) as { preset: string; rpc: string[]; owaspAligned: boolean };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      preset: "standard-2026q1",
      rpc: ["hashPassword", "verifyPassword"],
      owaspAligned: true
    });
  });

  it("does not expose benchmark routes", async () => {
    const response = handleFetch(new Request("https://example.com/_bench/hash", { method: "POST" }), {});
    expect(response.status).toBe(404);
  });
});
