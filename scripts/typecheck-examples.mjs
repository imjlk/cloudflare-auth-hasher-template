import { spawn } from "node:child_process";

const projects = [
  "examples/rpc-caller-worker/tsconfig.json",
  "examples/better-auth-worker/tsconfig.json"
];

const runTypecheck = async (project) => {
  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsc", "--noEmit", "-p", project], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`tsc exited via signal ${signal} for ${project}.`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`tsc failed for ${project} with exit code ${code}.`));
        return;
      }

      resolve(undefined);
    });
  });
};

const main = async () => {
  for (const project of projects) {
    await runTypecheck(project);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
