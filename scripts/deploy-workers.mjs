import { spawn } from "node:child_process";
import { stdin as input, stdout as output, stderr } from "node:process";
import readline from "node:readline/promises";

const WORKERS = [
  {
    id: "ts-direct",
    workspace: "@cloudflare-auth-hasher/ts-direct"
  },
  {
    id: "ts-rust-wasm",
    workspace: "@cloudflare-auth-hasher/ts-rust-wasm"
  },
  {
    id: "rust-full",
    workspace: "@cloudflare-auth-hasher/rust-full"
  },
  {
    id: "binding-gateway",
    workspace: "@cloudflare-auth-hasher/binding-gateway"
  }
];

const HELP_TEXT = `Deploy Cloudflare Workers for this workspace.

Usage:
  npm run deploy:workers -- [options]
  npm run deploy:workers:dry-run -- [options]

Options:
  --dry-run                 Run each workspace validation script instead of deploy.
  --workers=a,b             Deploy only a subset of workers.
  --account-id=<id>         Cloudflare account ID override.
  --api-token=<token>       Cloudflare API token override.
  --yes                     Do not prompt for confirmation.
  --help                    Show this help text.

Authentication:
  The script uses official Wrangler env vars:
  - CLOUDFLARE_ACCOUNT_ID
  - CLOUDFLARE_API_TOKEN

Runtime tuning:
  Any AUTH_HASHER_* variables already present in the shell are forwarded automatically.
  That means the same env values reach:
  - Wrangler "vars" for TypeScript Workers
  - Rust builds for rust-full and the Rust Wasm kernel

  If either variable is missing and the terminal is interactive, the script will prompt for it.
  In non-interactive mode, both values must be provided via flags or environment variables.
`;

const parseArgs = (argv) => {
  const options = {
    dryRun: false,
    yes: false,
    workers: null,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    apiToken: process.env.CLOUDFLARE_API_TOKEN ?? "",
    help: false
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--yes") {
      options.yes = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg.startsWith("--workers=")) {
      options.workers = arg
        .slice("--workers=".length)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith("--account-id=")) {
      options.accountId = arg.slice("--account-id=".length).trim();
      continue;
    }

    if (arg.startsWith("--api-token=")) {
      options.apiToken = arg.slice("--api-token=".length).trim();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
};

const isInteractive = Boolean(input.isTTY && output.isTTY);

const promptVisible = async (question) => {
  const rl = readline.createInterface({ input, output });

  try {
    const value = await rl.question(question);
    return value.trim();
  } finally {
    rl.close();
  }
};

const promptSecret = async (question) => {
  if (!input.isTTY || !output.isTTY) {
    throw new Error("Cannot prompt for a secret without an interactive terminal.");
  }

  output.write(question);

  const previousRawMode = input.isRaw;
  input.setRawMode(true);
  input.resume();

  let value = "";

  return new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const char = chunk.toString("utf8");

      if (char === "\u0003") {
        cleanup();
        reject(new Error("Interrupted."));
        return;
      }

      if (char === "\r" || char === "\n") {
        output.write("\n");
        cleanup();
        resolve(value.trim());
        return;
      }

      if (char === "\u007f") {
        if (value.length > 0) {
          value = value.slice(0, -1);
        }
        return;
      }

      value += char;
    };

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(Boolean(previousRawMode));
    };

    input.on("data", onData);
  });
};

const resolveCredentials = async (options) => {
  let accountId = options.accountId;
  let apiToken = options.apiToken;

  if (!accountId) {
    if (!isInteractive) {
      throw new Error("Missing CLOUDFLARE_ACCOUNT_ID. Set it in the environment or pass --account-id.");
    }

    accountId = await promptVisible("Cloudflare account ID: ");
  }

  if (!apiToken) {
    if (!isInteractive) {
      throw new Error("Missing CLOUDFLARE_API_TOKEN. Set it in the environment or pass --api-token.");
    }

    apiToken = await promptSecret("Cloudflare API token: ");
  }

  if (!accountId) {
    throw new Error("Cloudflare account ID cannot be empty.");
  }

  if (!apiToken) {
    throw new Error("Cloudflare API token cannot be empty.");
  }

  return { accountId, apiToken };
};

const resolveWorkers = (requested) => {
  if (!requested || requested.length === 0) {
    return WORKERS;
  }

  const selected = requested.map((id) => {
    const worker = WORKERS.find((candidate) => candidate.id === id);
    if (!worker) {
      throw new Error(`Unknown worker '${id}'. Valid values: ${WORKERS.map((candidate) => candidate.id).join(", ")}`);
    }

    return worker;
  });

  return selected;
};

const confirmPlan = async (workers, dryRun, accountId) => {
  if (!isInteractive) {
    return;
  }

  output.write(
    `\nAbout to ${dryRun ? "dry-run validate" : "deploy"} ${workers.length} worker(s) to Cloudflare account ${accountId}:\n`
  );
  for (const worker of workers) {
    output.write(`- ${worker.id}\n`);
  }
  output.write("\n");

  const answer = (await promptVisible("Continue? [y/N] ")).toLowerCase();
  if (answer !== "y" && answer !== "yes") {
    throw new Error("Deployment cancelled.");
  }
};

const runWorkspaceScript = (workspace, script, env) => {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["--workspace", workspace, "run", script], {
      stdio: "inherit",
      env: {
        ...process.env,
        ...env
      }
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Workspace ${workspace} exited via signal ${signal}.`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`Workspace ${workspace} failed with exit code ${code}.`));
        return;
      }

      resolve();
    });
  });
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    output.write(`${HELP_TEXT}\n`);
    return;
  }

  const workers = resolveWorkers(options.workers);
  const credentials = await resolveCredentials(options);

  if (!options.yes) {
    await confirmPlan(workers, options.dryRun, credentials.accountId);
  }

  const scriptName = options.dryRun ? "check" : "deploy";
  const startedAt = Date.now();

  for (const worker of workers) {
    output.write(`\n==> ${scriptName} ${worker.id}\n`);
    await runWorkspaceScript(worker.workspace, scriptName, {
      CLOUDFLARE_ACCOUNT_ID: credentials.accountId,
      CLOUDFLARE_API_TOKEN: credentials.apiToken
    });
  }

  const durationMs = Date.now() - startedAt;
  output.write(`\nCompleted ${scriptName} for ${workers.length} worker(s) in ${(durationMs / 1000).toFixed(1)}s.\n`);
};

main().catch((error) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
