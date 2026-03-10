import { describe, expect, it } from "vitest";
import {
  assessPasswordHash,
  ENV_TUNED_BENCH_PRESET_ID,
  isOwaspAlignedPreset,
  needsPasswordRehash,
  STANDARD_RECOMMENDED_PRESET,
  resolveHasherPreset
} from "./index";

const toBase64NoPad = (value: Uint8Array): string => Buffer.from(value).toString("base64").replace(/=+$/u, "");

const createArgon2HashFixture = ({
  version = 19,
  memoryKiB,
  iterations,
  parallelism,
  outputLength
}: {
  version?: number;
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  outputLength: number;
}): string => {
  const salt = toBase64NoPad(new Uint8Array(16).fill(7));
  const hash = toBase64NoPad(new Uint8Array(outputLength).fill(11));
  return `$argon2id$v=${version}$m=${memoryKiB},t=${iterations},p=${parallelism}$${salt}$${hash}`;
};

describe("resolveHasherPreset", () => {
  it("returns the standard preset when no env overrides are present", () => {
    expect(resolveHasherPreset(undefined)).toEqual(STANDARD_RECOMMENDED_PRESET);
  });

  it("derives an env-tuned preset id when argon settings are overridden without an explicit id", () => {
    const preset = resolveHasherPreset({
      AUTH_HASHER_ARGON2_MEMORY_KIB: "4096",
      AUTH_HASHER_ARGON2_TIME_COST: "1"
    });

    expect(preset.id).toBe(ENV_TUNED_BENCH_PRESET_ID);
    expect(preset.argon2id.memoryKiB).toBe(4096);
    expect(preset.argon2id.iterations).toBe(1);
    expect(preset.argon2id.parallelism).toBe(STANDARD_RECOMMENDED_PRESET.argon2id.parallelism);
  });

  it("uses an explicit preset id when provided", () => {
    const preset = resolveHasherPreset({
      AUTH_HASHER_PRESET_ID: "free-safe-probe",
      AUTH_HASHER_ARGON2_MEMORY_KIB: "4096",
      AUTH_HASHER_ARGON2_TIME_COST: "1",
      AUTH_HASHER_ARGON2_PARALLELISM: "1",
      AUTH_HASHER_ARGON2_OUTPUT_LENGTH: "32"
    });

    expect(preset.id).toBe("free-safe-probe");
    expect(preset.argon2id).toEqual({
      memoryKiB: 4096,
      iterations: 1,
      parallelism: 1,
      outputLength: 32
    });
  });

  it("rejects invalid numeric overrides", () => {
    expect(() =>
      resolveHasherPreset({
        AUTH_HASHER_ARGON2_MEMORY_KIB: "0"
      })
    ).toThrow("AUTH_HASHER_ARGON2_MEMORY_KIB must be a positive integer.");
  });
});

describe("password hash assessment helpers", () => {
  it("does not request a rehash for the standard baseline", () => {
    const hash = createArgon2HashFixture({
      memoryKiB: STANDARD_RECOMMENDED_PRESET.argon2id.memoryKiB,
      iterations: STANDARD_RECOMMENDED_PRESET.argon2id.iterations,
      parallelism: STANDARD_RECOMMENDED_PRESET.argon2id.parallelism,
      outputLength: STANDARD_RECOMMENDED_PRESET.argon2id.outputLength
    });

    expect(needsPasswordRehash(hash)).toBe(false);
    expect(assessPasswordHash(hash).reasons).toEqual([]);
  });

  it("flags lower-cost Argon2 hashes for rehash", () => {
    const hash = createArgon2HashFixture({
      memoryKiB: 4096,
      iterations: 1,
      parallelism: 1,
      outputLength: 32
    });

    expect(assessPasswordHash(hash)).toMatchObject({
      needsRehash: true,
      reasons: ["argon2-memory", "argon2-iterations"]
    });
  });

  it("flags legacy scrypt hashes for migration", () => {
    const assessment = assessPasswordHash("legacy-salt:deadbeef");
    expect(assessment).toMatchObject({
      needsRehash: true,
      reasons: ["legacy-scrypt-format"],
      parsed: {
        format: "legacy-scrypt"
      }
    });
  });

  it("does not require a rehash when the stored Argon2 cost already exceeds the target", () => {
    const target = resolveHasherPreset({
      AUTH_HASHER_PRESET_ID: "free-safe-probe",
      AUTH_HASHER_ARGON2_MEMORY_KIB: "4096",
      AUTH_HASHER_ARGON2_TIME_COST: "1",
      AUTH_HASHER_ARGON2_PARALLELISM: "1",
      AUTH_HASHER_ARGON2_OUTPUT_LENGTH: "32"
    });

    const strongerHash = createArgon2HashFixture({
      memoryKiB: STANDARD_RECOMMENDED_PRESET.argon2id.memoryKiB,
      iterations: STANDARD_RECOMMENDED_PRESET.argon2id.iterations,
      parallelism: STANDARD_RECOMMENDED_PRESET.argon2id.parallelism,
      outputLength: STANDARD_RECOMMENDED_PRESET.argon2id.outputLength
    });

    expect(needsPasswordRehash(strongerHash, target)).toBe(false);
  });

  it("marks the standard preset as OWASP-aligned and lower-cost probes as not aligned", () => {
    const freeSafeProbe = resolveHasherPreset({
      AUTH_HASHER_PRESET_ID: "free-safe-probe",
      AUTH_HASHER_ARGON2_MEMORY_KIB: "4096",
      AUTH_HASHER_ARGON2_TIME_COST: "1",
      AUTH_HASHER_ARGON2_PARALLELISM: "1",
      AUTH_HASHER_ARGON2_OUTPUT_LENGTH: "32"
    });

    expect(isOwaspAlignedPreset(STANDARD_RECOMMENDED_PRESET)).toBe(true);
    expect(isOwaspAlignedPreset(freeSafeProbe)).toBe(false);
  });
});
