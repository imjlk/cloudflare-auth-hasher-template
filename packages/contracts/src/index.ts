const ARGON2_VERSION = 19;
const ARGON2_PHC_REGEX =
  /^\$(argon2id)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/.-]+)\$([A-Za-z0-9+/.-]+)$/;

export const AUTH_HASHER_PRESET_IDS = {
  standard2026Q1: "standard-2026q1",
  freeTierFallback2026Q1: "free-tier-fallback-2026q1",
  envTuned: "env-tuned"
} as const;

export const LEGACY_PRESET_ID_ALIASES = {
  "standard-recommended": AUTH_HASHER_PRESET_IDS.standard2026Q1,
  "free-safe-probe": AUTH_HASHER_PRESET_IDS.freeTierFallback2026Q1
} as const;

export const AUTH_HASHER_ENV_KEYS = {
  presetId: "AUTH_HASHER_PRESET_ID",
  memoryKiB: "AUTH_HASHER_ARGON2_MEMORY_KIB",
  iterations: "AUTH_HASHER_ARGON2_TIME_COST",
  parallelism: "AUTH_HASHER_ARGON2_PARALLELISM",
  outputLength: "AUTH_HASHER_ARGON2_OUTPUT_LENGTH",
  metadataRouteEnabled: "AUTH_HASHER_ENABLE_METADATA_ROUTE",
  workerCpuMs: "AUTH_HASHER_WORKER_CPU_MS"
} as const;

export interface Argon2idConfig {
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  outputLength: number;
}

export interface LegacyScryptConfig {
  logN: number;
  r: number;
  p: number;
  outputLength: number;
}

export interface HashPresetDefinition {
  id: string;
  description: string;
  argon2id: Argon2idConfig;
  legacyScrypt: LegacyScryptConfig;
}

export interface AuthHasherRuntimeEnv {
  AUTH_HASHER_PRESET_ID?: string;
  AUTH_HASHER_ARGON2_MEMORY_KIB?: string;
  AUTH_HASHER_ARGON2_TIME_COST?: string;
  AUTH_HASHER_ARGON2_PARALLELISM?: string;
  AUTH_HASHER_ARGON2_OUTPUT_LENGTH?: string;
  AUTH_HASHER_ENABLE_METADATA_ROUTE?: string;
}

export interface AuthHasherRpc {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
}

export interface AuthHasherBinding extends AuthHasherRpc {
  fetch(request: Request): Promise<Response>;
}

export interface AuthHasherMetadata {
  preset: string;
  argon2id: Argon2idConfig;
  rpc: ["hashPassword", "verifyPassword"];
  owaspAligned: boolean;
}

export type PasswordHashFormat = "argon2id" | "legacy-scrypt";

export type PasswordHashUpgradeReason =
  | "legacy-scrypt-format"
  | "argon2-version"
  | "argon2-memory"
  | "argon2-iterations"
  | "argon2-parallelism"
  | "argon2-output-length";

export interface ParsedArgon2PasswordHash {
  format: "argon2id";
  version: number;
  argon2id: Argon2idConfig;
  saltBase64: string;
  hashBase64: string;
}

export interface ParsedLegacyScryptPasswordHash {
  format: "legacy-scrypt";
  salt: string;
  keyHex: string;
}

export type ParsedPasswordHash = ParsedArgon2PasswordHash | ParsedLegacyScryptPasswordHash;

export interface PasswordHashRehashAssessment {
  parsed: ParsedPasswordHash;
  needsRehash: boolean;
  reasons: PasswordHashUpgradeReason[];
}

export const STANDARD_2026Q1_PRESET = {
  id: AUTH_HASHER_PRESET_IDS.standard2026Q1,
  description: "Canonical Argon2id preset for the 2026 Q1 template release.",
  argon2id: {
    memoryKiB: 12 * 1024,
    iterations: 3,
    parallelism: 1,
    outputLength: 32
  },
  legacyScrypt: {
    logN: 14,
    r: 16,
    p: 1,
    outputLength: 64
  }
} as const satisfies HashPresetDefinition;

export const FREE_TIER_FALLBACK_2026Q1_PRESET = {
  id: AUTH_HASHER_PRESET_IDS.freeTierFallback2026Q1,
  description: "Lower-cost fallback preset for constrained Workers Free deployments.",
  argon2id: {
    memoryKiB: 4096,
    iterations: 1,
    parallelism: 1,
    outputLength: 32
  },
  legacyScrypt: STANDARD_2026Q1_PRESET.legacyScrypt
} as const satisfies HashPresetDefinition;

// Deprecated export retained for compatibility with older examples and consumers.
export const STANDARD_RECOMMENDED_PRESET = STANDARD_2026Q1_PRESET;

const runtimeEnvValue = (
  env: Partial<AuthHasherRuntimeEnv> | Record<string, unknown> | null | undefined,
  key: keyof AuthHasherRuntimeEnv
): string | undefined => {
  const value = env?.[key];
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
};

const parsePositiveInteger = (label: string, rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer. Received '${rawValue}'.`);
  }

  return parsed;
};

const parseBoolean = (label: string, rawValue: string | undefined, fallback: boolean): boolean => {
  if (!rawValue) {
    return fallback;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`${label} must be true/false or 1/0. Received '${rawValue}'.`);
};

export const canonicalizePresetId = (rawPresetId: string | undefined, hasArgonOverrides = false): string => {
  if (!rawPresetId) {
    return hasArgonOverrides ? AUTH_HASHER_PRESET_IDS.envTuned : STANDARD_2026Q1_PRESET.id;
  }

  return LEGACY_PRESET_ID_ALIASES[rawPresetId as keyof typeof LEGACY_PRESET_ID_ALIASES] ?? rawPresetId;
};

export const resolveHasherPreset = (
  env: Partial<AuthHasherRuntimeEnv> | Record<string, unknown> | null | undefined
): HashPresetDefinition => {
  const presetId = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.presetId);
  const memoryKiB = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.memoryKiB);
  const iterations = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.iterations);
  const parallelism = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.parallelism);
  const outputLength = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.outputLength);
  const hasArgonOverrides = Boolean(memoryKiB || iterations || parallelism || outputLength);
  const canonicalPresetId = canonicalizePresetId(presetId, hasArgonOverrides);

  if (!hasArgonOverrides && canonicalPresetId === FREE_TIER_FALLBACK_2026Q1_PRESET.id) {
    return FREE_TIER_FALLBACK_2026Q1_PRESET;
  }

  return {
    id: canonicalPresetId,
    description: hasArgonOverrides
      ? "Argon2id preset loaded from AUTH_HASHER_* environment variables."
      : STANDARD_2026Q1_PRESET.description,
    argon2id: {
      memoryKiB: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.memoryKiB,
        memoryKiB,
        (canonicalPresetId === FREE_TIER_FALLBACK_2026Q1_PRESET.id
          ? FREE_TIER_FALLBACK_2026Q1_PRESET
          : STANDARD_2026Q1_PRESET
        ).argon2id.memoryKiB
      ),
      iterations: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.iterations,
        iterations,
        (canonicalPresetId === FREE_TIER_FALLBACK_2026Q1_PRESET.id
          ? FREE_TIER_FALLBACK_2026Q1_PRESET
          : STANDARD_2026Q1_PRESET
        ).argon2id.iterations
      ),
      parallelism: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.parallelism,
        parallelism,
        (canonicalPresetId === FREE_TIER_FALLBACK_2026Q1_PRESET.id
          ? FREE_TIER_FALLBACK_2026Q1_PRESET
          : STANDARD_2026Q1_PRESET
        ).argon2id.parallelism
      ),
      outputLength: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.outputLength,
        outputLength,
        (canonicalPresetId === FREE_TIER_FALLBACK_2026Q1_PRESET.id
          ? FREE_TIER_FALLBACK_2026Q1_PRESET
          : STANDARD_2026Q1_PRESET
        ).argon2id.outputLength
      )
    },
    legacyScrypt: { ...STANDARD_2026Q1_PRESET.legacyScrypt }
  };
};

export const isMetadataRouteEnabled = (
  env: Partial<AuthHasherRuntimeEnv> | Record<string, unknown> | null | undefined
): boolean => {
  return parseBoolean(
    AUTH_HASHER_ENV_KEYS.metadataRouteEnabled,
    runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.metadataRouteEnabled),
    true
  );
};

const base64NoPadByteLength = (value: string): number => {
  const remainder = value.length % 4;
  const padding = remainder === 0 ? 0 : 4 - remainder;
  return ((value.length + padding) * 3) / 4 - padding;
};

export const parseStoredPasswordHash = (hash: string): ParsedPasswordHash => {
  const argonMatch = ARGON2_PHC_REGEX.exec(hash);
  if (argonMatch) {
    const [, algorithm, version, memoryKiB, iterations, parallelism, saltBase64, hashBase64] = argonMatch;
    if (algorithm !== "argon2id") {
      throw new Error(`Unsupported Argon2 variant '${algorithm}'.`);
    }

    return {
      format: "argon2id",
      version: Number(version),
      argon2id: {
        memoryKiB: Number(memoryKiB),
        iterations: Number(iterations),
        parallelism: Number(parallelism),
        outputLength: base64NoPadByteLength(hashBase64)
      },
      saltBase64,
      hashBase64
    };
  }

  const legacyScrypt = hash.split(":");
  if (legacyScrypt.length === 2 && legacyScrypt[0] && legacyScrypt[1]) {
    return {
      format: "legacy-scrypt",
      salt: legacyScrypt[0],
      keyHex: legacyScrypt[1]
    };
  }

  throw new Error("Unsupported password hash format.");
};

export const assessPasswordHash = (
  hash: string,
  targetPreset: HashPresetDefinition = STANDARD_2026Q1_PRESET
): PasswordHashRehashAssessment => {
  const parsed = parseStoredPasswordHash(hash);
  const reasons: PasswordHashUpgradeReason[] = [];

  if (parsed.format === "legacy-scrypt") {
    reasons.push("legacy-scrypt-format");
    return {
      parsed,
      needsRehash: true,
      reasons
    };
  }

  if (parsed.version !== ARGON2_VERSION) {
    reasons.push("argon2-version");
  }

  if (parsed.argon2id.memoryKiB < targetPreset.argon2id.memoryKiB) {
    reasons.push("argon2-memory");
  }

  if (parsed.argon2id.iterations < targetPreset.argon2id.iterations) {
    reasons.push("argon2-iterations");
  }

  if (parsed.argon2id.parallelism < targetPreset.argon2id.parallelism) {
    reasons.push("argon2-parallelism");
  }

  if (parsed.argon2id.outputLength < targetPreset.argon2id.outputLength) {
    reasons.push("argon2-output-length");
  }

  return {
    parsed,
    needsRehash: reasons.length > 0,
    reasons
  };
};

export const needsPasswordRehash = (
  hash: string,
  targetPreset: HashPresetDefinition = STANDARD_2026Q1_PRESET
): boolean => {
  return assessPasswordHash(hash, targetPreset).needsRehash;
};

export const isOwaspAlignedPreset = (preset: HashPresetDefinition): boolean => {
  return (
    preset.argon2id.memoryKiB >= STANDARD_2026Q1_PRESET.argon2id.memoryKiB &&
    preset.argon2id.iterations >= STANDARD_2026Q1_PRESET.argon2id.iterations &&
    preset.argon2id.parallelism >= STANDARD_2026Q1_PRESET.argon2id.parallelism &&
    preset.argon2id.outputLength >= STANDARD_2026Q1_PRESET.argon2id.outputLength
  );
};
