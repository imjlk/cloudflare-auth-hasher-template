import { describe, expect, it } from "vitest";
import { verifyPassword as verifyDirect } from "../../ts-direct/src/hasher";
import { hashPassword, verifyPassword } from "./kernel-node";

describe("ts-rust-wasm kernel", () => {
  it("hashes and verifies with the Rust Wasm kernel", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });

  it("produces hashes compatible with the pure TypeScript verifier", async () => {
    const hash = await hashPassword("cross-runtime-secret");
    await expect(verifyDirect(hash, "cross-runtime-secret")).resolves.toBe(true);
  });
});
