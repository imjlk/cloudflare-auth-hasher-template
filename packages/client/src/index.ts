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
  env: object | null | undefined,
  bindingName = "AUTH_HASHER"
): AuthHasherBinding | null => {
  const value = (env as Record<string, unknown> | null | undefined)?.[bindingName];
  return isAuthHasherBinding(value) ? value : null;
};

export const ensureAuthHasherBinding = (
  env: object | null | undefined,
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

const createTargetPresetMismatchError = (
  targetPreset: HashPresetDefinition,
  reasons: PasswordHashUpgradeReason[]
): Error => {
  return new Error(
    `Hasher output does not satisfy target preset '${targetPreset.id}'. Remaining differences: ${reasons.join(", ")}.`
  );
};

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
  const updatedAssessment = assessPasswordHash(updatedHash, targetPreset);
  if (updatedAssessment.needsRehash) {
    throw createTargetPresetMismatchError(targetPreset, updatedAssessment.reasons);
  }

  await options.persistUpdatedHash?.(updatedHash, {
    previousHash: storedHash,
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
