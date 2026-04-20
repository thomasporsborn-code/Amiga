#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT_DIR = __dirname;
const DEFAULT_INPUT = path.join(ROOT_DIR, "value-research-template.json");
const DEFAULT_OUTPUT = path.join(ROOT_DIR, "value-research-ebay.json");
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_BATCH_DELAY_MS = 2500;
const DEFAULT_COOLDOWN_MS = 180000;
const DEFAULT_MAX_ROUNDS = 6;
const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_MAX_CHALLENGE_STREAK = 2;
const DEFAULT_LIMIT = 8;
const SUCCESS_STATES = new Set(["success", "no-comps"]);

function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();
  let roundsCompleted = 0;
  let idleRounds = 0;

  process.stdout.write(`Starting eBay value runner at ${new Date(startedAt).toISOString()}\n`);
  process.stdout.write(`Batch size: ${options.batchSize}, cooldown: ${Math.round(options.cooldownMs / 1000)}s, max rounds: ${options.maxRounds}\n`);

  while (roundsCompleted < options.maxRounds) {
    const beforeEntries = loadMergedEntries(options.inputPath, options.outputPath);
    const pendingBefore = countPending(beforeEntries, options.maxAttempts);

    if (!pendingBefore) {
      process.stdout.write("No pending titles left to research.\n");
      break;
    }

    roundsCompleted += 1;
    process.stdout.write(`\nRound ${roundsCompleted}/${options.maxRounds} - pending before run: ${pendingBefore}\n`);

    runNodeScript("fetch-ebay-comps.js", [
      `--input=${options.inputPath}`,
      `--output=${options.outputPath}`,
      `--count=${options.batchSize}`,
      `--delay-ms=${options.batchDelayMs}`,
      `--max-attempts=${options.maxAttempts}`,
      `--max-challenge-streak=${options.maxChallengeStreak}`,
      `--limit=${options.limit}`,
      "--domain=www.ebay.co.uk",
    ]);

    runNodeScript("import-value-suggestions.js", [options.outputPath]);

    const afterEntries = loadMergedEntries(options.inputPath, options.outputPath);
    const pendingAfter = countPending(afterEntries, options.maxAttempts);
    const progress = summarizeRoundProgress(beforeEntries, afterEntries);

    process.stdout.write(
      `Round summary: +${progress.successes} success, +${progress.noComps} no-comps, +${progress.challenges} challenge, +${progress.errors} error, pending now ${pendingAfter}\n`,
    );

    if (!progress.successes && !progress.noComps && !progress.challenges && !progress.errors) {
      idleRounds += 1;
    } else {
      idleRounds = 0;
    }

    if (idleRounds >= 2) {
      process.stdout.write("Stopping after two idle rounds with no visible entry updates.\n");
      break;
    }

    if (!pendingAfter) {
      process.stdout.write("All pending titles processed for now.\n");
      break;
    }

    if (roundsCompleted < options.maxRounds) {
      process.stdout.write(`Cooling down for ${Math.round(options.cooldownMs / 1000)} seconds before next round...\n`);
      sleep(options.cooldownMs);
    }
  }

  process.stdout.write(`Finished runner after ${roundsCompleted} round(s).\n`);
}

function loadMergedEntries(inputPath, outputPath) {
  const templateEntries = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const existingEntries = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
    : [];
  const existingMap = new Map(
    (Array.isArray(existingEntries) ? existingEntries : [])
      .map((entry) => [normalizeTitle(entry.title), entry])
      .filter(([title]) => title),
  );

  return templateEntries.map((entry) => {
    const previous = existingMap.get(normalizeTitle(entry.title));
    return previous ? { ...entry, ...previous } : { ...entry };
  });
}

function countPending(entries, maxAttempts) {
  return entries.filter((entry) => {
    const attempts = Number.parseInt(String(entry.attempts || 0), 10) || 0;
    const status = cleanText(entry.lastStatus);
    return attempts < maxAttempts && !SUCCESS_STATES.has(status);
  }).length;
}

function summarizeRoundProgress(beforeEntries, afterEntries) {
  const beforeMap = new Map(beforeEntries.map((entry) => [normalizeTitle(entry.title), entry]));
  const summary = {
    successes: 0,
    noComps: 0,
    challenges: 0,
    errors: 0,
  };

  for (const entry of afterEntries) {
    const before = beforeMap.get(normalizeTitle(entry.title)) || {};
    const beforeAttempts = Number.parseInt(String(before.attempts || 0), 10) || 0;
    const afterAttempts = Number.parseInt(String(entry.attempts || 0), 10) || 0;

    if (afterAttempts <= beforeAttempts) {
      continue;
    }

    const status = cleanText(entry.lastStatus);

    if (status === "success") {
      summary.successes += 1;
    } else if (status === "no-comps") {
      summary.noComps += 1;
    } else if (status === "challenge") {
      summary.challenges += 1;
    } else if (status === "error") {
      summary.errors += 1;
    }
  }

  return summary;
}

function runNodeScript(scriptName, args) {
  const scriptPath = path.join(ROOT_DIR, scriptName);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${scriptName} failed with exit code ${result.status || 1}`);
  }
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(1000, end - Date.now()));
  }
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeTitle(value) {
  return cleanText(value).toLowerCase();
}

function parseArgs(args) {
  const options = {
    inputPath: DEFAULT_INPUT,
    outputPath: DEFAULT_OUTPUT,
    batchSize: DEFAULT_BATCH_SIZE,
    batchDelayMs: DEFAULT_BATCH_DELAY_MS,
    cooldownMs: DEFAULT_COOLDOWN_MS,
    maxRounds: DEFAULT_MAX_ROUNDS,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
    maxChallengeStreak: DEFAULT_MAX_CHALLENGE_STREAK,
    limit: DEFAULT_LIMIT,
  };

  for (const arg of args) {
    if (arg.startsWith("--input=")) {
      options.inputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--output=")) {
      options.outputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--batch-size=")) {
      options.batchSize = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_BATCH_SIZE, 1);
    } else if (arg.startsWith("--batch-delay-ms=")) {
      options.batchDelayMs = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_BATCH_DELAY_MS, 500);
    } else if (arg.startsWith("--cooldown-ms=")) {
      options.cooldownMs = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_COOLDOWN_MS, 0);
    } else if (arg.startsWith("--max-rounds=")) {
      options.maxRounds = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_MAX_ROUNDS, 1);
    } else if (arg.startsWith("--max-attempts=")) {
      options.maxAttempts = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_MAX_ATTEMPTS, 1);
    } else if (arg.startsWith("--max-challenge-streak=")) {
      options.maxChallengeStreak = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_MAX_CHALLENGE_STREAK, 1);
    } else if (arg.startsWith("--limit=")) {
      options.limit = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_LIMIT, 1);
    }
  }

  return options;
}

main();
