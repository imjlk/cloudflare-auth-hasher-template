import { describe, expect, it } from "vitest";
import { parseStoredPasswordHash } from "@cloudflare-auth-hasher/contracts";
import { buildMetadata } from "./fetch-handler";
import { hashPassword, verifyPassword } from "./kernel-node";

describe("Rust Wasm kernel", () => {
  it("hashes and verifies with the Rust Wasm kernel", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });

  it("emits a parseable Argon2id PHC string", async () => {
    const hash = await hashPassword("cross-runtime-secret");
    expect(parseStoredPasswordHash(hash)).toMatchObject({
      format: "argon2id"
    });
  });

  it("keeps emitted Argon2 parameters aligned with metadata", async () => {
    const hash = await hashPassword("metadata-parity-secret");
    const parsed = parseStoredPasswordHash(hash);
    const metadata = buildMetadata(process.env);

    expect(parsed).toMatchObject({
      format: "argon2id"
    });

    if (parsed.format !== "argon2id") {
      throw new Error("Expected an argon2id hash.");
    }

    expect(parsed.argon2id).toEqual(metadata.argon2id);
  });
});
