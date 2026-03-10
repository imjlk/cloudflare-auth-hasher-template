import { spawn } from "node:child_process";

const tasks = [
  {
    config: "examples/rpc-caller-worker/wrangler.jsonc",
    output: "examples/rpc-caller-worker/worker-configuration.d.ts"
  },
  {
    config: "examples/better-auth-worker/wrangler.jsonc",
    output: "examples/better-auth-worker/worker-configuration.d.ts"
  }
];

const runTypes = async ({ config, output }) => {
  await new Promise((resolve, reject) => {
    const child = spawn("node", ["./scripts/run-wrangler.mjs", "types", "--config", config, output], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`wrangler types exited via signal ${signal} for ${config}.`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`wrangler types failed for ${config} with exit code ${code}.`));
        return;
      }

      resolve(undefined);
    });
  });
};

const main = async () => {
  for (const task of tasks) {
    await runTypes(task);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
