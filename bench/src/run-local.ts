import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  BASELINE_CANDIDATES,
  BENCH_CONCURRENCY,
  BENCH_INPUTS,
  BENCH_PATHS,
  BENCH_TRACKS,
  buildScenarioId,
  type BaselineCandidate,
  type BenchmarkOperation,
  type BenchmarkPath,
  type BenchmarkRecord,
  type BenchmarkTrack,
  type BenchInputDefinition,
  resolveHasherPreset
} from "@cloudflare-auth-hasher/contracts";
import { getNoopBench, postHashBench, postVerifyBench } from "@cloudflare-auth-hasher/client";

type SampleResult = {
  durationMs: number;
  ok: boolean;
  error?: string;
};

const DEFAULT_URLS: Record<BaselineCandidate, string> = {
  "ts-direct": process.env.TS_DIRECT_URL ?? "http://127.0.0.1:8787",
  "ts-rust-wasm": process.env.TS_RUST_WASM_URL ?? "http://127.0.0.1:8788",
  "rust-full": process.env.RUST_FULL_URL ?? "http://127.0.0.1:8789"
};

const BINDING_GATEWAY_URL = process.env.BINDING_GATEWAY_URL ?? "http://127.0.0.1:8790";
const OUTPUT_PATH = resolve(process.env.BENCH_OUTPUT ?? "bench/results/local-latest.json");
const parseIntegerEnv = (name: string, rawValue: string | undefined, fallback: number, minimum = 0): number => {
  if (rawValue === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}.`);
  }

  return parsed;
};

const SAMPLES = parseIntegerEnv("BENCH_SAMPLES", process.env.BENCH_SAMPLES, 3, 1);
const VERIFY_SEED_RETRIES = parseIntegerEnv(
  "BENCH_VERIFY_SEED_RETRIES",
  process.env.BENCH_VERIFY_SEED_RETRIES,
  3,
  1
);
const SCENARIO_COOLDOWN_MS = parseIntegerEnv(
  "BENCH_SCENARIO_COOLDOWN_MS",
  process.env.BENCH_SCENARIO_COOLDOWN_MS,
  250,
  0
);
const ACTIVE_PRESET = resolveHasherPreset(process.env);
const verifySeedCache = new Map<string, string>();

const filterValues = <T extends string>(all: readonly T[], envValue: string | undefined): T[] => {
  if (!envValue) {
    return [...all];
  }

  const wanted = new Set(envValue.split(",").map((part) => part.trim()).filter(Boolean));
  return all.filter((entry) => wanted.has(entry));
};

const selectedCandidates = filterValues(BASELINE_CANDIDATES, process.env.BENCH_CANDIDATES);
const selectedPaths = filterValues(BENCH_PATHS, process.env.BENCH_PATHS);
const selectedTracks = filterValues(BENCH_TRACKS, process.env.BENCH_TRACKS);
const selectedInputs = filterValues(
  BENCH_INPUTS.map((input) => input.id),
  process.env.BENCH_INPUTS
)
  .map((id) => BENCH_INPUTS.find((candidate) => candidate.id === id))
  .filter((value): value is BenchInputDefinition => Boolean(value));

const selectedConcurrency = BENCH_CONCURRENCY.filter((value) => {
  if (!process.env.BENCH_CONCURRENCY) {
    return true;
  }

  return process.env.BENCH_CONCURRENCY.split(",").map(Number).includes(value);
});

const quantile = (values: number[], ratio: number): number | null => {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio));
  return Number(sorted[index].toFixed(3));
};

const summarizeDurations = (durations: number[]) => ({
  p50: quantile(durations, 0.5),
  p95: quantile(durations, 0.95),
  p99: quantile(durations, 0.99)
});

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const measure = async (task: () => Promise<void>): Promise<SampleResult> => {
  const startedAt = performance.now();

  try {
    await task();
    return {
      ok: true,
      durationMs: performance.now() - startedAt
    };
  } catch (error) {
    return {
      ok: false,
      durationMs: performance.now() - startedAt,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

const runBatches = async (concurrency: number, samples: number, task: () => Promise<void>): Promise<SampleResult[]> => {
  const results: SampleResult[] = [];

  for (let batch = 0; batch < samples; batch += 1) {
    const tasks = Array.from({ length: concurrency }, () => measure(task));
    results.push(...(await Promise.all(tasks)));
  }

  return results;
};

const baseUrlFor = (candidate: BaselineCandidate, path: BenchmarkPath): string => {
  return path === "direct" ? DEFAULT_URLS[candidate] : BINDING_GATEWAY_URL;
};

const verifySeedKeyFor = (candidate: BaselineCandidate, input: BenchInputDefinition): string => {
  return [candidate, ACTIVE_PRESET.id, input.id].join(":");
};

const seedVerifyHash = async (
  candidate: BaselineCandidate,
  track: BenchmarkTrack,
  input: BenchInputDefinition
): Promise<string> => {
  const cacheKey = verifySeedKeyFor(candidate, input);
  const cached = verifySeedCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let lastError = "unknown seed failure";

  for (let attempt = 1; attempt <= VERIFY_SEED_RETRIES; attempt += 1) {
    try {
      const seed = await postHashBench(baseUrlFor(candidate, "direct"), {
        scenarioId: `${candidate}.verify-seed.${ACTIVE_PRESET.id}.${input.id}.attempt-${attempt}`,
        candidate,
        path: "direct",
        track,
        preset: ACTIVE_PRESET.id,
        inputId: input.id,
        concurrency: 1,
        password: input.password
      });

      const seededHash = seed.result?.hash;
      if (!seededHash) {
        throw new Error(`Empty seed hash for ${candidate}/${input.id}.`);
      }

      verifySeedCache.set(cacheKey, seededHash);
      return seededHash;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < VERIFY_SEED_RETRIES && SCENARIO_COOLDOWN_MS > 0) {
        await sleep(SCENARIO_COOLDOWN_MS);
      }
    }
  }

  throw new Error(`Verify seed failed after ${VERIFY_SEED_RETRIES} attempts: ${lastError}`);
};

const createHashTask = (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
) => {
  const scenarioId = buildScenarioId({
    candidate,
    path,
    operation: "hash",
    track,
    preset: ACTIVE_PRESET.id,
    inputId: input.id,
    concurrency
  });

  return {
    scenarioId,
    task: async () => {
      await postHashBench(baseUrlFor(candidate, path), {
        scenarioId,
        candidate,
        path,
        track,
        preset: ACTIVE_PRESET.id,
        inputId: input.id,
        concurrency,
        password: input.password
      });
    }
  };
};

const createVerifyTask = async (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
) => {
  const scenarioId = buildScenarioId({
    candidate,
    path,
    operation: "verify",
    track,
    preset: ACTIVE_PRESET.id,
    inputId: input.id,
    concurrency
  });

  try {
    const seededHash = await seedVerifyHash(candidate, track, input);

    return {
      scenarioId,
      task: async () => {
        await postVerifyBench(baseUrlFor(candidate, path), {
          scenarioId,
          candidate,
          path,
          track,
          preset: ACTIVE_PRESET.id,
          inputId: input.id,
          concurrency,
          password: input.password,
          hash: seededHash
        });
      }
    };
  } catch (error) {
    const failure =
      error instanceof Error ? new Error(`Verify seed failed: ${error.message}`) : new Error(String(error));
    return {
      scenarioId,
      task: async () => {
        throw failure;
      }
    };
  }
};

const createNoopTask = (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
) => {
  const scenarioId = buildScenarioId({
    candidate,
    path,
    operation: "noop",
    track,
    preset: ACTIVE_PRESET.id,
    inputId: input.id,
    concurrency
  });

  return {
    scenarioId,
    task: async () => {
      await getNoopBench(baseUrlFor(candidate, path), {
        scenarioId,
        candidate,
        path,
        track,
        preset: ACTIVE_PRESET.id,
        inputId: input.id,
        concurrency
      });
    }
  };
};

const createRecord = (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  operation: BenchmarkOperation,
  input: BenchInputDefinition,
  concurrency: number,
  scenarioId: string,
  samples: SampleResult[]
): BenchmarkRecord => {
  const durations = samples.map((sample) => Number(sample.durationMs.toFixed(3)));
  const errors = [...new Set(samples.flatMap((sample) => (sample.error ? [sample.error] : [])))];
  const successes = samples.filter((sample) => sample.ok).length;

  return {
    candidate,
    path,
    track,
    algorithm: "argon2id",
    preset: ACTIVE_PRESET.id,
    operation,
    input: input.id,
    concurrency,
    successRate: Number((successes / samples.length).toFixed(4)),
    cpuTimeMs: {
      p50: null,
      p95: null,
      p99: null
    },
    wallTimeMs: summarizeDurations(durations),
    startupMs: durations[0] ?? null,
    bundleBytes: {
      raw: null,
      gzip: null
    },
    errors,
    scenarioId,
    samples: samples.length
  };
};

const runOperation = async (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number,
  operation: BenchmarkOperation
): Promise<BenchmarkRecord> => {
  const prepared =
    operation === "noop"
      ? createNoopTask(candidate, path, track, input, concurrency)
      : operation === "hash"
        ? createHashTask(candidate, path, track, input, concurrency)
        : await createVerifyTask(candidate, path, track, input, concurrency);

  const samples = await runBatches(concurrency, SAMPLES, prepared.task);
  return createRecord(candidate, path, track, operation, input, concurrency, prepared.scenarioId, samples);
};

const main = async (): Promise<void> => {
  const records: BenchmarkRecord[] = [];

  for (const candidate of selectedCandidates) {
    for (const track of selectedTracks) {
      for (const input of selectedInputs) {
        for (const concurrency of selectedConcurrency) {
          for (const path of selectedPaths) {
            for (const operation of ["noop", "hash", "verify"] as const) {
              const record = await runOperation(candidate, path, track, input, concurrency, operation);
              records.push(record);
              console.log(
                `${record.scenarioId} -> success=${record.successRate} p50=${record.wallTimeMs.p50 ?? "n/a"}ms`
              );
              if (SCENARIO_COOLDOWN_MS > 0) {
                await sleep(SCENARIO_COOLDOWN_MS);
              }
            }
          }
        }
      }
    }
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log(`Wrote ${records.length} records to ${OUTPUT_PATH}`);
};

await main();
