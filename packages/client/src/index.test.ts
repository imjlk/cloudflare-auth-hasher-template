import { describe, expect, it, vi } from "vitest";
import {
  ensureAuthHasherBinding,
  isAuthHasherBinding,
  needsPasswordRehash,
  STANDARD_2026Q1_PRESET,
  verifyAndMaybeRehash
} from "./index";

describe("binding helpers", () => {
  const binding = {
    async hashPassword(password: string) {
      return `hash:${password}`;
    },
    async verifyPassword(hash: string, password: string) {
      return hash === `hash:${password}`;
    },
    async fetch() {
      return new Response("ok");
    }
  };

  it("detects a valid auth hasher binding", () => {
    expect(isAuthHasherBinding(binding)).toBe(true);
    expect(isAuthHasherBinding({})).toBe(false);
  });

  it("throws when the binding is missing", () => {
    expect(() => ensureAuthHasherBinding(undefined)).toThrow("Missing AUTH_HASHER service binding.");
  });
});

describe("verifyAndMaybeRehash", () => {
  const hasher = {
    async hashPassword(password: string) {
      return `next:${password}`;
    },
    async verifyPassword(hash: string, password: string) {
      return hash === `hash:${password}` || hash === "legacy-salt:deadbeef";
    }
  };

  it("does nothing when verification fails", async () => {
    await expect(verifyAndMaybeRehash(hasher, "hash:wrong", "secret")).resolves.toEqual({
      verified: false,
      needsRehash: false,
      rehashed: false,
      updatedHash: null,
      reasons: []
    });
  });

  it("rehashes legacy hashes after successful verification", async () => {
    await expect(verifyAndMaybeRehash(hasher, "legacy-salt:deadbeef", "secret")).resolves.toEqual({
      verified: true,
      needsRehash: true,
      rehashed: true,
      updatedHash: "next:secret",
      reasons: ["legacy-scrypt-format"]
    });
  });

  it("rehashes lower-cost Argon2 hashes after successful verification", async () => {
    const lowerCostHash =
      "$argon2id$v=19$m=4096,t=1,p=1$BwcHBwcHBwcHBwcHBwcHBw$CwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCws";
    const lowerCostHasher = {
      ...hasher,
      async verifyPassword(hash: string) {
        return hash === lowerCostHash;
      }
    };

    await expect(verifyAndMaybeRehash(lowerCostHasher, lowerCostHash, "secret")).resolves.toEqual({
      verified: true,
      needsRehash: true,
      rehashed: true,
      updatedHash: "next:secret",
      reasons: ["argon2-memory", "argon2-iterations"]
    });
  });

  it("does not rehash when the stored hash already meets the target", async () => {
    const currentHash =
      "$argon2id$v=19$m=12288,t=3,p=1$BwcHBwcHBwcHBwcHBwcHBw$CwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCws";
    const currentHasher = {
      ...hasher,
      async verifyPassword(hash: string) {
        return hash === currentHash;
      }
    };

    await expect(verifyAndMaybeRehash(currentHasher, currentHash, "secret")).resolves.toEqual({
      verified: true,
      needsRehash: false,
      rehashed: false,
      updatedHash: null,
      reasons: []
    });
  });

  it("persists the updated hash when a callback is provided", async () => {
    const persistUpdatedHash = vi.fn();
    await verifyAndMaybeRehash(hasher, "legacy-salt:deadbeef", "secret", {
      targetPreset: STANDARD_2026Q1_PRESET,
      persistUpdatedHash
    });

    expect(persistUpdatedHash).toHaveBeenCalledWith("next:secret", {
      previousHash: "legacy-salt:deadbeef",
      password: "secret",
      reasons: ["legacy-scrypt-format"],
      targetPreset: STANDARD_2026Q1_PRESET
    });
  });
});

describe("rehash assessment re-exports", () => {
  it("re-exports lower-level helpers", () => {
    const lowerCostHash =
      "$argon2id$v=19$m=4096,t=1,p=1$BwcHBwcHBwcHBwcHBwcHBw$CwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCws";
    expect(needsPasswordRehash(lowerCostHash, STANDARD_2026Q1_PRESET)).toBe(true);
  });
});
