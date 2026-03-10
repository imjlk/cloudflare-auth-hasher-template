const encoder = new TextEncoder();

export const BASELINE_CANDIDATES = ["ts-direct", "ts-rust-wasm", "rust-full"] as const;
export const OPTIONAL_CANDIDATES = ["assemblyscript-probe"] as const;
export const ALL_CANDIDATES = [...BASELINE_CANDIDATES, ...OPTIONAL_CANDIDATES] as const;

export const BENCH_PATHS = ["direct", "binding"] as const;
export const BENCH_OPERATIONS = ["hash", "verify", "noop"] as const;
export const BENCH_TRACKS = ["parity", "deployment"] as const;
export const DEFAULT_BENCH_PRESET_ID = "standard-recommended";
export const ENV_TUNED_BENCH_PRESET_ID = "env-tuned";
export const BENCH_PRESETS = [DEFAULT_BENCH_PRESET_ID, ENV_TUNED_BENCH_PRESET_ID] as const;
export const BENCH_CONCURRENCY = [1, 4, 16] as const;

export const AUTH_HASHER_ENV_KEYS = {
  presetId: "AUTH_HASHER_PRESET_ID",
  memoryKiB: "AUTH_HASHER_ARGON2_MEMORY_KIB",
  iterations: "AUTH_HASHER_ARGON2_TIME_COST",
  parallelism: "AUTH_HASHER_ARGON2_PARALLELISM",
  outputLength: "AUTH_HASHER_ARGON2_OUTPUT_LENGTH"
} as const;

export type BenchmarkCandidate = (typeof ALL_CANDIDATES)[number];
export type BaselineCandidate = (typeof BASELINE_CANDIDATES)[number];
export type OptionalCandidate = (typeof OPTIONAL_CANDIDATES)[number];
export type BenchmarkPath = (typeof BENCH_PATHS)[number];
export type BenchmarkOperation = (typeof BENCH_OPERATIONS)[number];
export type BenchmarkTrack = (typeof BENCH_TRACKS)[number];
export type BenchmarkPreset = string;
export type BenchmarkConcurrency = (typeof BENCH_CONCURRENCY)[number];

export const BENCH_ENDPOINTS = {
  hash: "/_bench/hash",
  verify: "/_bench/verify",
  noop: "/_bench/noop"
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
  id: BenchmarkPreset;
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
}

export const STANDARD_RECOMMENDED_PRESET = {
  id: DEFAULT_BENCH_PRESET_ID,
  description: "Baseline Argon2id preset used by every baseline candidate in the workspace.",
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

export const resolveHasherPreset = (
  env: Partial<AuthHasherRuntimeEnv> | Record<string, unknown> | null | undefined
): HashPresetDefinition => {
  const presetId = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.presetId);
  const memoryKiB = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.memoryKiB);
  const iterations = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.iterations);
  const parallelism = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.parallelism);
  const outputLength = runtimeEnvValue(env, AUTH_HASHER_ENV_KEYS.outputLength);
  const hasArgonOverrides = Boolean(memoryKiB || iterations || parallelism || outputLength);

  return {
    id: presetId ?? (hasArgonOverrides ? ENV_TUNED_BENCH_PRESET_ID : STANDARD_RECOMMENDED_PRESET.id),
    description: hasArgonOverrides
      ? "Argon2id preset loaded from AUTH_HASHER_* environment variables."
      : STANDARD_RECOMMENDED_PRESET.description,
    argon2id: {
      memoryKiB: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.memoryKiB,
        memoryKiB,
        STANDARD_RECOMMENDED_PRESET.argon2id.memoryKiB
      ),
      iterations: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.iterations,
        iterations,
        STANDARD_RECOMMENDED_PRESET.argon2id.iterations
      ),
      parallelism: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.parallelism,
        parallelism,
        STANDARD_RECOMMENDED_PRESET.argon2id.parallelism
      ),
      outputLength: parsePositiveInteger(
        AUTH_HASHER_ENV_KEYS.outputLength,
        outputLength,
        STANDARD_RECOMMENDED_PRESET.argon2id.outputLength
      )
    },
    legacyScrypt: { ...STANDARD_RECOMMENDED_PRESET.legacyScrypt }
  };
};

type CharsetKind = "ascii" | "utf8";

export interface BenchInputDefinition {
  id: string;
  charset: CharsetKind;
  password: string;
  byteLength: number;
  label: string;
}

const makeBenchInput = (id: string, charset: CharsetKind, password: string, label: string): BenchInputDefinition => ({
  id,
  charset,
  password,
  byteLength: encoder.encode(password).length,
  label
});

export const BENCH_INPUTS = [
  makeBenchInput("ascii-12", "ascii", "edge-pass-12", "ASCII / 12 bytes"),
  makeBenchInput("ascii-32", "ascii", "a".repeat(32), "ASCII / 32 bytes"),
  makeBenchInput("ascii-96", "ascii", "a".repeat(96), "ASCII / 96 bytes"),
  makeBenchInput("utf8-12", "utf8", "가".repeat(4), "UTF-8 multibyte / 12 bytes"),
  makeBenchInput("utf8-32", "utf8", `${"가".repeat(10)}ab`, "UTF-8 multibyte / 32 bytes"),
  makeBenchInput("utf8-96", "utf8", "가".repeat(32), "UTF-8 multibyte / 96 bytes")
] as const satisfies readonly BenchInputDefinition[];

export type BenchInputId = (typeof BENCH_INPUTS)[number]["id"];

for (const input of BENCH_INPUTS) {
  const suffix = input.id.split("-").at(-1);
  if (Number(suffix) !== input.byteLength) {
    throw new Error(`Bench input ${input.id} is expected to be ${suffix} bytes but is ${input.byteLength} bytes.`);
  }
}

export interface BenchScenarioContext {
  scenarioId: string;
  candidate: BenchmarkCandidate;
  path: BenchmarkPath;
  track: BenchmarkTrack;
  preset: BenchmarkPreset;
  inputId: BenchInputId;
  concurrency: number;
}

export interface HashBenchRequest extends BenchScenarioContext {
  password: string;
}

export interface VerifyBenchRequest extends BenchScenarioContext {
  password: string;
  hash: string;
}

export type NoopBenchRequest = BenchScenarioContext;

export interface HashBenchResult {
  hash: string;
}

export interface VerifyBenchResult {
  verified: boolean;
}

export interface NoopBenchResult {
  candidate: BenchmarkCandidate;
  path: BenchmarkPath;
  noop: true;
}

export interface BenchResponse<T> {
  scenarioId: string;
  ok: boolean;
  result: T | null;
  error: string | null;
}

export interface AuthHasherRpc {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, password: string): Promise<boolean>;
}

export interface AuthHasherBinding extends AuthHasherRpc {
  fetch(request: Request): Promise<Response>;
}

export interface QuantileMetrics {
  p50: number | null;
  p95: number | null;
  p99: number | null;
}

export interface BenchmarkRecord {
  candidate: BenchmarkCandidate;
  path: BenchmarkPath;
  track: BenchmarkTrack;
  algorithm: "argon2id";
  preset: BenchmarkPreset;
  operation: BenchmarkOperation;
  input: BenchInputId;
  concurrency: number;
  successRate: number;
  cpuTimeMs: QuantileMetrics;
  wallTimeMs: QuantileMetrics;
  startupMs: number | null;
  bundleBytes: {
    raw: number | null;
    gzip: number | null;
  };
  errors: string[];
  scenarioId: string;
  samples: number;
}

export const BINDING_NAMES: Record<BaselineCandidate, string> = {
  "ts-direct": "TS_DIRECT",
  "ts-rust-wasm": "TS_RUST_WASM",
  "rust-full": "RUST_FULL"
};

export const getBenchInput = (inputId: BenchInputId): BenchInputDefinition => {
  const input = BENCH_INPUTS.find((candidate) => candidate.id === inputId);
  if (!input) {
    throw new Error(`Unknown bench input: ${inputId}`);
  }

  return input;
};

export interface ScenarioIdParts {
  candidate: BenchmarkCandidate;
  path: BenchmarkPath;
  operation: BenchmarkOperation;
  track: BenchmarkTrack;
  preset: BenchmarkPreset;
  inputId: BenchInputId;
  concurrency: number;
}

export const buildScenarioId = (context: ScenarioIdParts): string => {
  return [
    context.candidate,
    context.path,
    context.operation,
    context.track,
    context.preset,
    context.inputId,
    `c${context.concurrency}`
  ].join(".");
};

export const createBenchOk = <T>(scenarioId: string, result: T): BenchResponse<T> => ({
  scenarioId,
  ok: true,
  result,
  error: null
});

export const createBenchError = <T>(scenarioId: string, error: unknown): BenchResponse<T> => ({
  scenarioId,
  ok: false,
  result: null,
  error: error instanceof Error ? error.message : String(error)
});
