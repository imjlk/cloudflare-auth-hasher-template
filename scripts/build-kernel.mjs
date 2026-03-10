import { access, copyFile, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = process.cwd();
const AUTH_HASHER_ENV_KEYS = [
  "AUTH_HASHER_PRESET_ID",
  "AUTH_HASHER_ARGON2_MEMORY_KIB",
  "AUTH_HASHER_ARGON2_TIME_COST",
  "AUTH_HASHER_ARGON2_PARALLELISM",
  "AUTH_HASHER_ARGON2_OUTPUT_LENGTH",
  "AUTH_HASHER_ENABLE_METADATA_ROUTE",
  "AUTH_HASHER_WORKER_CPU_MS"
];
const BUILT_WASM_PATH = path.join(
  ROOT,
  "target",
  "wasm32-unknown-unknown",
  "release",
  "rust_wasm_kernel.wasm"
);
const COMMITTED_WASM_PATH = path.join(ROOT, "src", "rust-wasm-kernel.wasm");
const BUILD_MANIFEST_PATH = path.join(ROOT, "src", "rust-wasm-kernel.build.json");
const BUILD_MANIFEST_INPUTS = [
  "Cargo.lock",
  "Cargo.toml",
  "crates/hash-core/Cargo.toml",
  "crates/hash-core/src/lib.rs",
  "crates/rust-wasm-kernel/Cargo.toml",
  "crates/rust-wasm-kernel/src/lib.rs",
  "scripts/build-kernel.mjs"
];
const ignoreAuthHasherEnv = process.argv.includes("--ignore-auth-hasher-env");

const fileExists = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const createBuildEnv = () => {
  if (!ignoreAuthHasherEnv) {
    return process.env;
  }

  const nextEnv = { ...process.env };
  for (const key of AUTH_HASHER_ENV_KEYS) {
    delete nextEnv[key];
  }

  return nextEnv;
};

const createSourceChecksum = async () => {
  const hash = createHash("sha256");

  for (const relativePath of BUILD_MANIFEST_INPUTS) {
    const absolutePath = path.join(ROOT, relativePath);
    const contents = await readFile(absolutePath);
    hash.update(`${relativePath}\n`);
    hash.update(contents);
    hash.update("\n");
  }

  return hash.digest("hex");
};

const writeBuildManifest = async () => {
  const sourceChecksum = await createSourceChecksum();
  const payload = {
    artifactPreset: "standard-2026q1",
    artifactSourceChecksum: sourceChecksum,
    generatedBy: "npm run build:artifact",
    inputs: BUILD_MANIFEST_INPUTS
  };

  await writeFile(BUILD_MANIFEST_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

const runCommand = async (command, args, env) => {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      env
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited via signal ${signal}.`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}.`));
        return;
      }

      resolve(undefined);
    });
  });
};

const cargoAvailable = async () => {
  return new Promise((resolve) => {
    const child = spawn("cargo", ["--version"], {
      cwd: ROOT,
      stdio: "ignore",
      env: process.env
    });

    child.on("error", () => resolve(false));
    child.on("exit", (code, signal) => {
      resolve(!signal && code === 0);
    });
  });
};

const main = async () => {
  const buildEnv = createBuildEnv();

  if (await cargoAvailable()) {
    await runCommand("cargo", [
      "build",
      "-p",
      "rust-wasm-kernel",
      "--target",
      "wasm32-unknown-unknown",
      "--release"
    ], buildEnv);
    await copyFile(BUILT_WASM_PATH, COMMITTED_WASM_PATH);
    if (ignoreAuthHasherEnv) {
      await writeBuildManifest();
    }
    return;
  }

  if (await fileExists(COMMITTED_WASM_PATH)) {
    console.warn("cargo was not found; using committed src/rust-wasm-kernel.wasm.");
    return;
  }

  throw new Error("cargo was not found and src/rust-wasm-kernel.wasm is missing.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
