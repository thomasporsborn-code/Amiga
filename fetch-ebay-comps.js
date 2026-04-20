#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_DOMAIN,
  DEFAULT_LIMIT,
  buildSoldSearchUrl,
  cleanText,
  extractSoldListingsFromHtml,
  isChallengePage,
  isLikelyMatch,
  normalizeTitle,
} = require("./ebay-value-utils.js");

const DEFAULT_DELAY_MS = 1500;
const DEFAULT_COUNT = 5;
const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_MAX_CHALLENGE_STREAK = 2;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rootDir = __dirname;
  const inputPath = path.resolve(options.input || path.join(rootDir, "value-research-template.json"));
  const outputPath = path.resolve(options.output || path.join(rootDir, "value-research-ebay.json"));

  const templateEntries = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  if (!Array.isArray(templateEntries)) {
    throw new Error("Input file must be an array of research entries.");
  }

  const existingEntries = options.resume && fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
    : [];
  const existingMap = new Map(
    (Array.isArray(existingEntries) ? existingEntries : [])
      .map((entry) => [normalizeTitle(entry.title), entry])
      .filter(([title]) => title),
  );

  const mergedEntries = templateEntries.map((entry) => {
    const previous = existingMap.get(normalizeTitle(entry.title));
    return previous ? { ...entry, ...previous } : { ...entry };
  });

  const pendingEntries = mergedEntries.filter((entry) => shouldProcessEntry(entry, options));
  const targets = pendingEntries.slice(options.start, options.start + options.count);

  let processedThisRun = 0;
  let challengeStreak = 0;

  for (const entry of targets) {
    const baseTitle = cleanText(entry.title);
    const searchTitle = cleanText(entry.searchTitle || entry.title);

    if (!searchTitle) {
      markEntryAttempt(entry, "error", "Missing search title");
      persistEntries(outputPath, mergedEntries);
      continue;
    }

    try {
      const html = await fetchSoldListingsPage({
        domain: options.domain,
        query: searchTitle,
        limit: options.limit,
      });

      const items = extractSoldListingsFromHtml(html, options.domain)
        .filter((item) =>
          isLikelyMatch({
            baseTitle,
            publisher: cleanText(entry.publisher),
            release: cleanText(entry.release),
            resultTitle: item.title,
          }),
        )
        .slice(0, options.limit);

      entry.comps = items;
      entry.valueSource = items.length ? "eBay sold listings (scraped)" : cleanText(entry.valueSource);
      entry.valueUpdated = items.length ? new Date().toISOString().slice(0, 10) : cleanText(entry.valueUpdated);
      entry.fetchError = "";
      markEntryAttempt(entry, items.length ? "success" : "no-comps", "");
      challengeStreak = 0;
      processedThisRun += 1;
      process.stdout.write(`Processed ${processedThisRun}/${targets.length}: ${entry.title} (${items.length} comps)\n`);
    } catch (error) {
      const message = cleanText(error.message);
      const status = message.includes("challenge") ? "challenge" : "error";
      markEntryAttempt(entry, status, message);
      entry.fetchError = message;
      process.stdout.write(`Processed ${processedThisRun + 1}/${targets.length}: ${entry.title} (error: ${message})\n`);

      if (status === "challenge") {
        challengeStreak += 1;
      } else {
        challengeStreak = 0;
      }
    }

    persistEntries(outputPath, mergedEntries);

    if (challengeStreak >= options.maxChallengeStreak) {
      process.stdout.write(`Stopped early after ${challengeStreak} consecutive eBay challenge pages.\n`);
      break;
    }

    if (processedThisRun < targets.length) {
      await delay(options.delayMs);
    }
  }

  process.stdout.write(`Wrote ${mergedEntries.length} entries to ${outputPath}\n`);
}

function shouldProcessEntry(entry, options) {
  const attempts = Number.parseInt(String(entry.attempts || 0), 10) || 0;

  if (attempts >= options.maxAttempts) {
    return false;
  }

  if (options.refresh) {
    return true;
  }

  if (!options.resume) {
    return true;
  }

  const status = cleanText(entry.lastStatus);

  return status !== "success" && status !== "no-comps";
}

function markEntryAttempt(entry, status, errorMessage) {
  entry.lastStatus = status;
  entry.attempts = (Number.parseInt(String(entry.attempts || 0), 10) || 0) + 1;
  entry.attemptedAt = new Date().toISOString();
  entry.fetchError = cleanText(errorMessage);
}

function persistEntries(outputPath, entries) {
  fs.writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
}

async function fetchSoldListingsPage({ domain, query, limit }) {
  const url = buildSoldSearchUrl({ domain, query, limit });

  const response = await fetch(url, {
    headers: {
      "accept-language": "en-GB,en;q=0.9",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`eBay page request failed with ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  if (isChallengePage(html)) {
    throw new Error("eBay returned a browser challenge page");
  }

  return html;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(args) {
  const options = {
    input: "",
    output: "",
    domain: DEFAULT_DOMAIN,
    limit: DEFAULT_LIMIT,
    delayMs: DEFAULT_DELAY_MS,
    start: 0,
    count: DEFAULT_COUNT,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
    maxChallengeStreak: DEFAULT_MAX_CHALLENGE_STREAK,
    resume: true,
    refresh: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--input=")) {
      options.input = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--output=")) {
      options.output = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--domain=")) {
      options.domain = arg.split("=").slice(1).join("=") || DEFAULT_DOMAIN;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_LIMIT;
    } else if (arg.startsWith("--delay-ms=")) {
      options.delayMs = Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_DELAY_MS;
    } else if (arg.startsWith("--start=")) {
      options.start = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || 0, 0);
    } else if (arg.startsWith("--count=")) {
      options.count = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_COUNT, 1);
    } else if (arg.startsWith("--max-attempts=")) {
      options.maxAttempts = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_MAX_ATTEMPTS, 1);
    } else if (arg.startsWith("--max-challenge-streak=")) {
      options.maxChallengeStreak = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_MAX_CHALLENGE_STREAK, 1);
    } else if (arg === "--no-resume") {
      options.resume = false;
    } else if (arg === "--refresh") {
      options.refresh = true;
    }
  }

  return options;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
