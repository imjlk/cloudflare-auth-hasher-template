# Deployment

This workspace ships with a root deployment helper so you can deploy against a different Cloudflare account without rewriting each Worker command by hand.

## Supported credential sources

The helper uses Wrangler's standard authentication environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

For local developer setup, this repository also includes a [`mise.local.toml`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/mise.local.toml) example with the same variables.
For a safe template without secrets, start from [`mise.local.example.toml`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/mise.local.example.toml).

You can provide them in two ways:

### 1. Environment variables

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
npm run deploy:workers
```

### 1a. `mise.local.toml`

Set the values in `mise.local.toml`, then let `mise` load them in your shell:

```bash
mise env -s zsh | source /dev/stdin
npm run deploy:workers
```

### 2. Interactive prompts

If the terminal is interactive and either value is missing, the script prompts for it:

```bash
npm run deploy:workers
```

The API token input is hidden while you type.

## Hash preset env vars

The deployment path also forwards optional hash-tuning vars:

- `AUTH_HASHER_PRESET_ID`
- `AUTH_HASHER_ARGON2_MEMORY_KIB`
- `AUTH_HASHER_ARGON2_TIME_COST`
- `AUTH_HASHER_ARGON2_PARALLELISM`
- `AUTH_HASHER_ARGON2_OUTPUT_LENGTH`

The workspace handles them in both places that matter:

- the TypeScript Workers receive them as Wrangler `vars`
- the Rust Worker and Rust Wasm kernel receive them through the build environment

Because of that, one env change can retune all three baseline candidates together.

Example lower-cost probe for Cloudflare `1102` / CPU-limit investigations:

```bash
export AUTH_HASHER_PRESET_ID=free-safe-probe
export AUTH_HASHER_ARGON2_MEMORY_KIB=4096
export AUTH_HASHER_ARGON2_TIME_COST=1
export AUTH_HASHER_ARGON2_PARALLELISM=1
export AUTH_HASHER_ARGON2_OUTPUT_LENGTH=32

npm run deploy:workers -- --yes
```

If you change the numeric values, also change `AUTH_HASHER_PRESET_ID` so benchmark scenario IDs and worker metadata stay honest.

For higher-cost presets on Workers Paid, Cloudflare also allows a higher per-request CPU budget through `limits.cpu_ms`. See the official [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) page for the current plan defaults and caps. Keep that as a deploy-time tuning step, not a substitute for benchmark validation. The committed `standard-recommended` finalist profiles in this repo showed both CPU-limit failures and non-CPU runtime failures.

## Commands

### Deploy all baseline workers plus the gateway

```bash
npm run deploy:workers
```

### Validate the same flow without publishing

```bash
npm run deploy:workers:dry-run
```

### Deploy only a subset

```bash
npm run deploy:workers -- --workers=ts-direct,rust-full
```

### Non-interactive CI usage

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id \
CLOUDFLARE_API_TOKEN=your-api-token \
npm run deploy:workers -- --yes
```

## Worker order

The script deploys Workers in this order:

1. `ts-direct`
2. `ts-rust-wasm`
3. `rust-full`
4. `binding-gateway`

That order keeps the service-binding gateway last, after the baseline Worker names already exist in the target account.

## Notes

- `--dry-run` runs each workspace's validation command instead of a live deploy.
- `binding-gateway` still expects its service-binding target Worker names to match the names in its [`wrangler.jsonc`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/workers/binding-gateway/wrangler.jsonc).
- The deployment helper does not write credentials to disk.
- The checked-in `wrangler.jsonc` files stay neutral. Runtime tuning is injected at command time by [`scripts/run-wrangler.mjs`](/Users/imjlk/repos/imjlk/cloudflare-auth-hasher-template/scripts/run-wrangler.mjs).
