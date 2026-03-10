import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BenchmarkRecord } from "@cloudflare-auth-hasher/contracts";

const INPUT_PATH = resolve(process.argv[2] ?? process.env.BENCH_INPUT ?? "bench/results/local-latest.json");
const OUTPUT_PATH = process.argv[3] ? resolve(process.argv[3]) : undefined;

const formatMetric = (value: number | null): string => (value === null ? "n/a" : `${value.toFixed(2)}ms`);

const toMarkdown = (records: BenchmarkRecord[]): string => {
  const lines = [
    "# Benchmark Summary",
    "",
    `Source: \`${INPUT_PATH}\``,
    "",
    "| Scenario | Success | CPU p50 | CPU p95 | Wall p50 | Wall p95 | Startup | Errors |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const record of records) {
    lines.push(
      `| ${record.scenarioId} | ${record.successRate} | ${formatMetric(record.cpuTimeMs.p50)} | ${formatMetric(
        record.cpuTimeMs.p95
      )} | ${formatMetric(record.wallTimeMs.p50)} | ${formatMetric(record.wallTimeMs.p95)} | ${formatMetric(
        record.startupMs
      )} | ${record.errors.length === 0 ? "none" : record.errors.join("<br>")} |`
    );
  }

  return `${lines.join("\n")}\n`;
};

const main = async (): Promise<void> => {
  const raw = await readFile(INPUT_PATH, "utf8");
  const records = JSON.parse(raw) as BenchmarkRecord[];
  const markdown = toMarkdown(records);

  if (OUTPUT_PATH) {
    await writeFile(OUTPUT_PATH, markdown, "utf8");
    console.log(`Wrote Markdown summary to ${OUTPUT_PATH}`);
    return;
  }

  process.stdout.write(markdown);
};

await main();
