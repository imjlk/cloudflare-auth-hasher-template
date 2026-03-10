import { describe, expect, it } from "vitest";
import {
  AUTH_HASHER_PRESET_IDS,
  assessPasswordHash,
  canonicalizePresetId,
  FREE_TIER_FALLBACK_2026Q1_PRESET,
  isMetadataRouteEnabled,
  isOwaspAlignedPreset,
  needsPasswordRehash,
  STANDARD_2026Q1_PRESET,
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
  it("returns the canonical standard preset when no env overrides are present", () => {
    expect(resolveHasherPreset(undefined)).toEqual(STANDARD_2026Q1_PRESET);
  });

  it("normalizes the legacy standard preset alias", () => {
    const preset = resolveHasherPreset({
      AUTH_HASHER_PRESET_ID: "standard-recommended"
    });

    expect(preset.id).toBe(AUTH_HASHER_PRESET_IDS.standard2026Q1);
    expect(preset.argon2id).toEqual(STANDARD_2026Q1_PRESET.argon2id);
  });

  it("normalizes the legacy free-tier alias", () => {
    const preset = resolveHasherPreset({
      AUTH_HASHER_PRESET_ID: "free-safe-probe"
    });

    expect(preset).toEqual(FREE_TIER_FALLBACK_2026Q1_PRESET);
  });

  it("derives an env-tuned preset id when argon settings are overridden without an explicit id", () => {
    const preset = resolveHasherPreset({
      AUTH_HASHER_ARGON2_MEMORY_KIB: "8192",
      AUTH_HASHER_ARGON2_TIME_COST: "2"
    });

    expect(preset.id).toBe(AUTH_HASHER_PRESET_IDS.envTuned);
    expect(preset.argon2id.memoryKiB).toBe(8192);
    expect(preset.argon2id.iterations).toBe(2);
  });

  it("rejects invalid numeric overrides", () => {
    expect(() =>
      resolveHasherPreset({
        AUTH_HASHER_ARGON2_MEMORY_KIB: "0"
      })
    ).toThrow("AUTH_HASHER_ARGON2_MEMORY_KIB must be a positive integer.");
  });
});

describe("canonicalizePresetId", () => {
  it("maps known aliases to canonical values", () => {
    expect(canonicalizePresetId("standard-recommended")).toBe(AUTH_HASHER_PRESET_IDS.standard2026Q1);
    expect(canonicalizePresetId("free-safe-probe")).toBe(AUTH_HASHER_PRESET_IDS.freeTierFallback2026Q1);
  });
});

describe("isMetadataRouteEnabled", () => {
  it("defaults to enabled", () => {
    expect(isMetadataRouteEnabled(undefined)).toBe(true);
  });

  it("disables the metadata route when set to false", () => {
    expect(
      isMetadataRouteEnabled({
        AUTH_HASHER_ENABLE_METADATA_ROUTE: "false"
      })
    ).toBe(false);
  });

  it("rejects invalid boolean values", () => {
    expect(() =>
      isMetadataRouteEnabled({
        AUTH_HASHER_ENABLE_METADATA_ROUTE: "sometimes"
      })
    ).toThrow("AUTH_HASHER_ENABLE_METADATA_ROUTE must be true/false or 1/0.");
  });
});

describe("password hash assessment helpers", () => {
  it("does not request a rehash for the standard baseline", () => {
    const hash = createArgon2HashFixture({
      memoryKiB: STANDARD_2026Q1_PRESET.argon2id.memoryKiB,
      iterations: STANDARD_2026Q1_PRESET.argon2id.iterations,
      parallelism: STANDARD_2026Q1_PRESET.argon2id.parallelism,
      outputLength: STANDARD_2026Q1_PRESET.argon2id.outputLength
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
    const strongerHash = createArgon2HashFixture({
      memoryKiB: STANDARD_2026Q1_PRESET.argon2id.memoryKiB,
      iterations: STANDARD_2026Q1_PRESET.argon2id.iterations,
      parallelism: STANDARD_2026Q1_PRESET.argon2id.parallelism,
      outputLength: STANDARD_2026Q1_PRESET.argon2id.outputLength
    });

    expect(needsPasswordRehash(strongerHash, FREE_TIER_FALLBACK_2026Q1_PRESET)).toBe(false);
  });

  it("marks the standard preset as OWASP-aligned and the free-tier fallback as not aligned", () => {
    expect(isOwaspAlignedPreset(STANDARD_2026Q1_PRESET)).toBe(true);
    expect(isOwaspAlignedPreset(FREE_TIER_FALLBACK_2026Q1_PRESET)).toBe(false);
  });
});
