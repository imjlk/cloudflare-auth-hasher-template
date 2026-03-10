import { describe, expect, it } from "vitest";
import packageJson from "../package.json";
import buildManifest from "./rust-wasm-kernel.build.json";
import { handleFetch } from "./fetch-handler";

describe("AuthHasherTemplateWorker", () => {
  it("returns canonical metadata on GET /", async () => {
    const response = handleFetch(new Request("https://example.com/"), {
      AUTH_HASHER_PRESET_ID: "standard-recommended"
    });
    const payload = (await response.json()) as {
      algorithm: string;
      version: string;
      artifactSourceChecksum: string;
      preset: string;
      rpc: string[];
      owaspAligned: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      algorithm: "argon2id",
      version: packageJson.version,
      artifactSourceChecksum: buildManifest.artifactSourceChecksum,
      preset: "standard-2026q1",
      rpc: ["hashPassword", "verifyPassword"],
      owaspAligned: true
    });
  });

  it("does not expose benchmark routes", async () => {
    const response = handleFetch(new Request("https://example.com/_bench/hash", { method: "POST" }), {});
    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("");
  });

  it("can disable the metadata route through runtime env", async () => {
    const response = handleFetch(new Request("https://example.com/"), {
      AUTH_HASHER_ENABLE_METADATA_ROUTE: "false"
    });

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("");
  });
});
