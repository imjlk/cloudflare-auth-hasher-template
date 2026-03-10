import { access, copyFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const BUILT_WASM_PATH = path.join(
  ROOT,
  "target",
  "wasm32-unknown-unknown",
  "release",
  "rust_wasm_kernel.wasm"
);
const COMMITTED_WASM_PATH = path.join(ROOT, "src", "rust-wasm-kernel.wasm");

const fileExists = async (filePath) => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const runCommand = async (command, args) => {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env
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
  if (await cargoAvailable()) {
    await runCommand("cargo", [
      "build",
      "-p",
      "rust-wasm-kernel",
      "--target",
      "wasm32-unknown-unknown",
      "--release"
    ]);
    await copyFile(BUILT_WASM_PATH, COMMITTED_WASM_PATH);
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
