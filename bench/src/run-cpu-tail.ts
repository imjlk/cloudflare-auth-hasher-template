import { spawn } from "node:child_process";
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

type TailEvent = {
  wallTime?: number;
  cpuTime?: number;
  outcome?: string;
  event?: {
    rpcMethod?: string;
    request?: {
      url?: string;
      method?: string;
    };
    response?: {
      status?: number;
    };
  };
};

const DEFAULT_URLS: Record<BaselineCandidate, string> = {
  "ts-direct": process.env.TS_DIRECT_URL ?? "http://127.0.0.1:8787",
  "ts-rust-wasm": process.env.TS_RUST_WASM_URL ?? "http://127.0.0.1:8788",
  "rust-full": process.env.RUST_FULL_URL ?? "http://127.0.0.1:8789"
};

const TAIL_WORKER_NAMES: Record<BaselineCandidate, string> = {
  "ts-direct": "auth-hasher-ts-direct",
  "ts-rust-wasm": "auth-hasher-ts-rust-wasm",
  "rust-full": "auth-hasher-rust-full"
};

const BINDING_GATEWAY_URL = process.env.BINDING_GATEWAY_URL ?? "http://127.0.0.1:8790";
const OUTPUT_PATH = resolve(process.env.BENCH_OUTPUT ?? "bench/results/cpu-latest.json");
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

const SAMPLES = parseIntegerEnv("BENCH_SAMPLES", process.env.BENCH_SAMPLES, 2, 1);
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

const verifySeedKeyFor = (candidate: BaselineCandidate, input: BenchInputDefinition): string => {
  return [candidate, ACTIVE_PRESET.id, input.id].join(":");
};

class TailSession {
  private readonly workerName: string;
  private readonly events: TailEvent[] = [];
  private readonly waiters = new Set<() => void>();
  private child: ReturnType<typeof spawn> | null = null;
  private buffer = "";

  constructor(workerName: string) {
    this.workerName = workerName;
  }

  async start(): Promise<void> {
    if (this.child) {
      return;
    }

    this.child = spawn("npx", ["wrangler", "tail", this.workerName, "--format", "json"], {
      stdio: ["ignore", "pipe", "inherit"],
      env: process.env
    });

    this.child.stdout?.on("data", (chunk) => {
      this.buffer += chunk.toString("utf8");
      for (const payload of extractJsonObjects(() => this.buffer, (next) => (this.buffer = next))) {
        try {
          const event = JSON.parse(payload) as TailEvent;
          this.events.push(event);
          for (const notify of this.waiters) {
            notify();
          }
        } catch {
          // Ignore malformed tail chunks.
        }
      }
    });

    await sleep(4000);
  }

  async stop(): Promise<void> {
    if (!this.child) {
      return;
    }

    this.child.kill("SIGINT");
    await sleep(500);
    this.child = null;
  }

  async consumeMatching(
    predicate: (event: TailEvent) => boolean,
    count: number,
    timeoutMs = 30000
  ): Promise<TailEvent[]> {
    const startIndex = this.events.length;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const matches = this.events.slice(startIndex).filter(predicate);
      if (matches.length >= count) {
        return matches.slice(0, count);
      }

      await new Promise<void>((resolve) => {
        const waiter = () => {
          this.waiters.delete(waiter);
          resolve();
        };

        this.waiters.add(waiter);
        setTimeout(() => {
          this.waiters.delete(waiter);
          resolve();
        }, 200);
      });
    }

    return this.events.slice(startIndex).filter(predicate);
  }
}

const extractJsonObjects = (getBuffer: () => string, setBuffer: (next: string) => void): string[] => {
  const input = getBuffer();
  const objects: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaping = false;
  let lastConsumed = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
        inString = false;
        escaping = false;
      }
      continue;
    }

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === "\\") {
        escaping = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(input.slice(start, index + 1));
        lastConsumed = index + 1;
        start = -1;
      }
    }
  }

  if (lastConsumed > 0) {
    setBuffer(input.slice(lastConsumed));
  }

  return objects;
};

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

const expectedInvocations = (concurrency: number): number => concurrency * SAMPLES;

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

const rpcMethodFor = (operation: BenchmarkOperation): string => {
  return operation === "hash" ? "hashPassword" : "verifyPassword";
};

const requestPathFor = (operation: BenchmarkOperation): string => {
  return operation === "noop" ? "/_bench/noop" : `/_bench/${operation}`;
};

const eventMatchesScenario = (
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  operation: BenchmarkOperation
): ((event: TailEvent) => boolean) => {
  if (path === "binding" && operation !== "noop") {
    const rpcMethod = rpcMethodFor(operation);
    return (event) => event.event?.rpcMethod === rpcMethod;
  }

  const expectedPath = requestPathFor(operation);
  return (event) => {
    const url = event.event?.request?.url;
    if (!url) {
      return false;
    }

    try {
      return new URL(url).pathname === expectedPath;
    } catch {
      return false;
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
  samples: SampleResult[],
  tailEvents: TailEvent[]
): BenchmarkRecord => {
  const durations = samples.map((sample) => Number(sample.durationMs.toFixed(3)));
  const cpuTimes = tailEvents
    .map((event) => event.cpuTime)
    .filter((value): value is number => typeof value === "number")
    .map((value) => Number(value.toFixed(3)));
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
    cpuTimeMs: summarizeDurations(cpuTimes),
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

const runNoopScenario = async (
  tail: TailSession,
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
): Promise<BenchmarkRecord> => {
  const scenarioId = buildScenarioId({
    candidate,
    path,
    operation: "noop",
    track,
    preset: ACTIVE_PRESET.id,
    inputId: input.id,
    concurrency
  });

  const task = async () => {
    await getNoopBench(baseUrlFor(candidate, path), {
      scenarioId,
      candidate,
      path,
      track,
      preset: ACTIVE_PRESET.id,
      inputId: input.id,
      concurrency
    });
  };

  const waitForTail = tail.consumeMatching(eventMatchesScenario(candidate, path, "noop"), expectedInvocations(concurrency));
  const samples = await runBatches(concurrency, SAMPLES, task);
  const tailEvents = await waitForTail;

  return createRecord(candidate, path, track, "noop", input, concurrency, scenarioId, samples, tailEvents);
};

const runHashScenario = async (
  tail: TailSession,
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
): Promise<BenchmarkRecord> => {
  const scenarioId = buildScenarioId({
    candidate,
    path,
    operation: "hash",
    track,
    preset: ACTIVE_PRESET.id,
    inputId: input.id,
    concurrency
  });

  const task = async () => {
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
  };

  const waitForTail = tail.consumeMatching(eventMatchesScenario(candidate, path, "hash"), expectedInvocations(concurrency));
  const samples = await runBatches(concurrency, SAMPLES, task);
  const tailEvents = await waitForTail;

  return createRecord(candidate, path, track, "hash", input, concurrency, scenarioId, samples, tailEvents);
};

const runVerifyScenario = async (
  tail: TailSession,
  candidate: BaselineCandidate,
  path: BenchmarkPath,
  track: BenchmarkTrack,
  input: BenchInputDefinition,
  concurrency: number
): Promise<BenchmarkRecord> => {
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

    const task = async () => {
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
    };

    const waitForTail = tail.consumeMatching(
      eventMatchesScenario(candidate, path, "verify"),
      expectedInvocations(concurrency)
    );
    const samples = await runBatches(concurrency, SAMPLES, task);
    const tailEvents = await waitForTail;

    return createRecord(candidate, path, track, "verify", input, concurrency, scenarioId, samples, tailEvents);
  } catch (error) {
    const message = error instanceof Error ? `Verify seed failed: ${error.message}` : String(error);
    return createRecord(
      candidate,
      path,
      track,
      "verify",
      input,
      concurrency,
      scenarioId,
      Array.from({ length: expectedInvocations(concurrency) }, () => ({
        ok: false,
        durationMs: 0,
        error: message
      })),
      []
    );
  }
};

const main = async (): Promise<void> => {
  const records: BenchmarkRecord[] = [];
  const tails = new Map<BaselineCandidate, TailSession>();

  try {
    for (const candidate of selectedCandidates) {
      const tail = new TailSession(TAIL_WORKER_NAMES[candidate]);
      tails.set(candidate, tail);
      await tail.start();

      for (const track of selectedTracks) {
        for (const input of selectedInputs) {
          for (const concurrency of selectedConcurrency) {
            for (const path of selectedPaths) {
              const noopRecord = await runNoopScenario(tail, candidate, path, track, input, concurrency);
              records.push(noopRecord);
              console.log(
                `${noopRecord.scenarioId} -> success=${noopRecord.successRate} cpuP50=${noopRecord.cpuTimeMs.p50 ?? "n/a"}ms`
              );
              if (SCENARIO_COOLDOWN_MS > 0) {
                await sleep(SCENARIO_COOLDOWN_MS);
              }

              const hashRecord = await runHashScenario(tail, candidate, path, track, input, concurrency);
              records.push(hashRecord);
              console.log(
                `${hashRecord.scenarioId} -> success=${hashRecord.successRate} cpuP50=${hashRecord.cpuTimeMs.p50 ?? "n/a"}ms`
              );
              if (SCENARIO_COOLDOWN_MS > 0) {
                await sleep(SCENARIO_COOLDOWN_MS);
              }

              const verifyRecord = await runVerifyScenario(tail, candidate, path, track, input, concurrency);
              records.push(verifyRecord);
              console.log(
                `${verifyRecord.scenarioId} -> success=${verifyRecord.successRate} cpuP50=${verifyRecord.cpuTimeMs.p50 ?? "n/a"}ms`
              );
              if (SCENARIO_COOLDOWN_MS > 0) {
                await sleep(SCENARIO_COOLDOWN_MS);
              }
            }
          }
        }
      }

      await tail.stop();
      tails.delete(candidate);
    }
  } finally {
    await Promise.all([...tails.values()].map((tail) => tail.stop()));
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log(`Wrote ${records.length} records to ${OUTPUT_PATH}`);
};

await main();
