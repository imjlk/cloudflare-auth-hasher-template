import { describe, expect, it } from "vitest";
import { STANDARD_RECOMMENDED_PRESET } from "@cloudflare-auth-hasher/contracts";
import { createLegacyScryptHashForTests, hashPassword, verifyPassword } from "./hasher";

describe("ts-direct hasher", () => {
  it("hashes and verifies argon2id passwords", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true);
  });

  it("rejects wrong passwords", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });

  it("verifies Better Auth style legacy scrypt hashes", async () => {
    const legacy = await createLegacyScryptHashForTests("hunter2", "legacy-salt");
    await expect(verifyPassword(legacy, "hunter2")).resolves.toBe(true);
    await expect(verifyPassword(legacy, "hunter3")).resolves.toBe(false);
  });

  it("normalizes passwords with NFKC", async () => {
    const hash = await hashPassword("Å");
    await expect(verifyPassword(hash, "Å")).resolves.toBe(true);
  });

  it("supports env-tuned Argon2id presets", async () => {
    const hash = await hashPassword("probe-secret", {
      ...STANDARD_RECOMMENDED_PRESET,
      id: "free-safe-probe",
      argon2id: {
        memoryKiB: 4096,
        iterations: 1,
        parallelism: 1,
        outputLength: 32
      }
    });

    expect(hash).toContain("$m=4096,t=1,p=1$");
    await expect(verifyPassword(hash, "probe-secret")).resolves.toBe(true);
  });

  it("validates empty and oversized inputs", async () => {
    await expect(hashPassword("")).rejects.toThrow("Password must not be empty.");
    await expect(hashPassword("a".repeat(1025))).rejects.toThrow("Password exceeds the maximum supported length");
    await expect(verifyPassword("a".repeat(4097), "secret")).rejects.toThrow(
      "Hash exceeds the maximum supported length"
    );
  });
});
