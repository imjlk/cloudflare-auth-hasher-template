import {
  assessPasswordHash,
  type AuthHasherBinding,
  type AuthHasherRpc,
  FREE_TIER_FALLBACK_2026Q1_PRESET,
  type HashPresetDefinition,
  isOwaspAlignedPreset,
  needsPasswordRehash,
  parseStoredPasswordHash,
  type PasswordHashRehashAssessment,
  type PasswordHashUpgradeReason,
  type ParsedPasswordHash,
  STANDARD_2026Q1_PRESET,
  STANDARD_RECOMMENDED_PRESET
} from "@cloudflare-auth-hasher/contracts";

export {
  assessPasswordHash,
  FREE_TIER_FALLBACK_2026Q1_PRESET,
  isOwaspAlignedPreset,
  needsPasswordRehash,
  parseStoredPasswordHash,
  STANDARD_2026Q1_PRESET,
  STANDARD_RECOMMENDED_PRESET
} from "@cloudflare-auth-hasher/contracts";
export type {
  HashPresetDefinition,
  PasswordHashRehashAssessment,
  PasswordHashUpgradeReason,
  ParsedPasswordHash
} from "@cloudflare-auth-hasher/contracts";

export const isAuthHasherBinding = (value: unknown): value is AuthHasherBinding => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthHasherBinding>;
  return (
    typeof candidate.hashPassword === "function" &&
    typeof candidate.verifyPassword === "function" &&
    typeof candidate.fetch === "function"
  );
};

export const resolveAuthHasherBinding = (
  env: Record<string, unknown> | null | undefined,
  bindingName = "AUTH_HASHER"
): AuthHasherBinding | null => {
  const value = env?.[bindingName];
  return isAuthHasherBinding(value) ? value : null;
};

export const ensureAuthHasherBinding = (
  env: Record<string, unknown> | null | undefined,
  bindingName = "AUTH_HASHER"
): AuthHasherBinding => {
  const binding = resolveAuthHasherBinding(env, bindingName);
  if (!binding) {
    throw new Error(`Missing ${bindingName} service binding.`);
  }

  return binding;
};

export interface VerifyAndMaybeRehashContext {
  previousHash: string;
  password: string;
  reasons: PasswordHashUpgradeReason[];
  targetPreset: HashPresetDefinition;
}

export interface VerifyAndMaybeRehashOptions {
  targetPreset?: HashPresetDefinition;
  persistUpdatedHash?: (nextHash: string, context: VerifyAndMaybeRehashContext) => Promise<void> | void;
}

export interface VerifyAndMaybeRehashResult {
  verified: boolean;
  needsRehash: boolean;
  rehashed: boolean;
  updatedHash: string | null;
  reasons: PasswordHashUpgradeReason[];
}

export const verifyAndMaybeRehash = async (
  hasher: AuthHasherRpc,
  storedHash: string,
  password: string,
  options: VerifyAndMaybeRehashOptions = {}
): Promise<VerifyAndMaybeRehashResult> => {
  const verified = await hasher.verifyPassword(storedHash, password);
  if (!verified) {
    return {
      verified: false,
      needsRehash: false,
      rehashed: false,
      updatedHash: null,
      reasons: []
    };
  }

  const targetPreset = options.targetPreset ?? STANDARD_2026Q1_PRESET;
  const assessment = assessPasswordHash(storedHash, targetPreset);
  if (!assessment.needsRehash) {
    return {
      verified: true,
      needsRehash: false,
      rehashed: false,
      updatedHash: null,
      reasons: []
    };
  }

  const updatedHash = await hasher.hashPassword(password);
  await options.persistUpdatedHash?.(updatedHash, {
    previousHash: storedHash,
    password,
    reasons: assessment.reasons,
    targetPreset
  });

  return {
    verified: true,
    needsRehash: true,
    rehashed: true,
    updatedHash,
    reasons: assessment.reasons
  };
};
