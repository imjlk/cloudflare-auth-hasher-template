import { spawn } from "node:child_process";

const configs = [
  "examples/rpc-caller-worker/wrangler.jsonc",
  "examples/better-auth-worker/wrangler.jsonc"
];

const runWranglerCheck = async (configPath) => {
  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["wrangler", "deploy", "--dry-run", "--config", configPath], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`wrangler deploy --dry-run exited via signal ${signal} for ${configPath}.`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`wrangler deploy --dry-run failed for ${configPath} with exit code ${code}.`));
        return;
      }

      resolve(undefined);
    });
  });
};

const main = async () => {
  for (const config of configs) {
    await runWranglerCheck(config);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
