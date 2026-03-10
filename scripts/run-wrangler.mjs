import { readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const RUNTIME_VAR_KEYS = [
  "AUTH_HASHER_PRESET_ID",
  "AUTH_HASHER_ARGON2_MEMORY_KIB",
  "AUTH_HASHER_ARGON2_TIME_COST",
  "AUTH_HASHER_ARGON2_PARALLELISM",
  "AUTH_HASHER_ARGON2_OUTPUT_LENGTH"
];
const WORKER_CPU_LIMIT_KEY = "AUTH_HASHER_WORKER_CPU_MS";

const POSITIVE_INTEGER_KEYS = new Set([
  "AUTH_HASHER_ARGON2_MEMORY_KIB",
  "AUTH_HASHER_ARGON2_TIME_COST",
  "AUTH_HASHER_ARGON2_PARALLELISM",
  "AUTH_HASHER_ARGON2_OUTPUT_LENGTH",
  WORKER_CPU_LIMIT_KEY
]);

const parseArgs = (argv) => {
  const configIndex = argv.findIndex((arg) => arg === "--config");
  if (configIndex === -1 || !argv[configIndex + 1]) {
    throw new Error("run-wrangler.mjs requires '--config <path>'.");
  }

  const configPath = argv[configIndex + 1];
  return { configIndex, configPath };
};

const readRuntimeVars = () => {
  const vars = {};

  for (const key of RUNTIME_VAR_KEYS) {
    const value = process.env[key]?.trim();
    if (!value) {
      continue;
    }

    if (POSITIVE_INTEGER_KEYS.has(key)) {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${key} must be a positive integer. Received '${value}'.`);
      }
    }

    vars[key] = value;
  }

  return vars;
};

const readWorkerCpuLimit = () => {
  const value = process.env[WORKER_CPU_LIMIT_KEY]?.trim();
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${WORKER_CPU_LIMIT_KEY} must be a positive integer. Received '${value}'.`);
  }

  return parsed;
};

const createConfigOverride = async (configPath, runtimeVars, workerCpuLimit) => {
  const resolvedConfigPath = path.resolve(process.cwd(), configPath);
  const configText = await readFile(resolvedConfigPath, "utf8");
  const config = JSON.parse(configText);
  const tempConfigPath = path.join(
    path.dirname(resolvedConfigPath),
    `.wrangler.runtime.${process.pid}.${path.basename(resolvedConfigPath)}`
  );

  config.vars = {
    ...(config.vars ?? {}),
    ...runtimeVars
  };

  if (workerCpuLimit !== null) {
    config.limits = {
      ...(config.limits ?? {}),
      cpu_ms: workerCpuLimit
    };
  }

  await writeFile(tempConfigPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return { tempConfigPath };
};

const main = async () => {
  const args = process.argv.slice(2);
  const { configIndex, configPath } = parseArgs(args);
  const runtimeVars = readRuntimeVars();
  const workerCpuLimit = readWorkerCpuLimit();

  let cleanup = async () => {};
  if (Object.keys(runtimeVars).length > 0 || workerCpuLimit !== null) {
    const { tempConfigPath } = await createConfigOverride(configPath, runtimeVars, workerCpuLimit);
    args[configIndex + 1] = tempConfigPath;
    cleanup = async () => {
      await rm(tempConfigPath, { force: true });
    };
  }

  try {
    await new Promise((resolve, reject) => {
      const child = spawn("npx", ["wrangler", ...args], {
        stdio: "inherit",
        env: process.env
      });

      child.on("error", reject);
      child.on("exit", (code, signal) => {
        if (signal) {
          reject(new Error(`Wrangler exited via signal ${signal}.`));
          return;
        }

        if (code !== 0) {
          reject(new Error(`Wrangler failed with exit code ${code}.`));
          return;
        }

        resolve(undefined);
      });
    });
  } finally {
    await cleanup();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
