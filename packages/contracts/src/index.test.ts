import { describe, expect, it } from "vitest";
import {
  ENV_TUNED_BENCH_PRESET_ID,
  STANDARD_RECOMMENDED_PRESET,
  resolveHasherPreset
} from "./index";

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
