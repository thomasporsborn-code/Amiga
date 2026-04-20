#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_DOMAIN,
  DEFAULT_LIMIT,
  cleanText,
  extractSoldListingsFromHtml,
  isChallengePage,
  isLikelyMatch,
  normalizeTitle,
} = require("./ebay-value-utils.js");

function main() {
  const options = parseArgs(process.argv.slice(2));
  const templateEntries = JSON.parse(fs.readFileSync(options.inputPath, "utf8"));
  const existingEntries = fs.existsSync(options.outputPath)
    ? JSON.parse(fs.readFileSync(options.outputPath, "utf8"))
    : [];

  if (!Array.isArray(templateEntries)) {
    throw new Error("Input file must be an array of research entries.");
  }

  const existingMap = new Map(
    (Array.isArray(existingEntries) ? existingEntries : [])
      .map((entry) => [normalizeTitle(entry.title), entry])
      .filter(([title]) => title),
  );

  const planEntries = options.planPath && fs.existsSync(options.planPath)
    ? JSON.parse(fs.readFileSync(options.planPath, "utf8"))
    : [];
  const planMap = new Map(
    (Array.isArray(planEntries) ? planEntries : [])
      .map((entry) => [normalizeTitle(entry.title), entry])
      .filter(([title]) => title),
  );

  const mergedEntries = templateEntries.map((entry) => {
    const previous = existingMap.get(normalizeTitle(entry.title));
    return previous ? { ...entry, ...previous } : { ...entry };
  });

  let imported = 0;
  let challenged = 0;
  let missing = 0;

  for (const entry of mergedEntries) {
    const plan = planMap.get(normalizeTitle(entry.title)) || {};
    const capturePath = plan.capturePath || path.join(options.htmlDir, `${createFallbackSlug(entry.title)}.html`);

    if (!fs.existsSync(capturePath)) {
      missing += 1;
      continue;
    }

    const html = fs.readFileSync(capturePath, "utf8");

    if (isChallengePage(html)) {
      entry.lastStatus = "challenge";
      entry.fetchError = "Saved HTML contains eBay browser challenge";
      entry.attemptedAt = new Date().toISOString();
      challenged += 1;
      continue;
    }

    const items = extractSoldListingsFromHtml(html, options.domain)
      .filter((item) =>
        isLikelyMatch({
          baseTitle: cleanText(entry.title),
          publisher: cleanText(entry.publisher),
          release: cleanText(entry.release),
          resultTitle: item.title,
        }),
      )
      .slice(0, options.limit);

    entry.comps = items;
    entry.valueSource = items.length ? "eBay UK sold listings (browser capture)" : cleanText(entry.valueSource);
    entry.valueUpdated = items.length ? new Date().toISOString().slice(0, 10) : cleanText(entry.valueUpdated);
    entry.lastStatus = items.length ? "success" : "no-comps";
    entry.fetchError = "";
    entry.attemptedAt = new Date().toISOString();
    entry.attempts = (Number.parseInt(String(entry.attempts || 0), 10) || 0) + 1;
    imported += 1;
  }

  fs.writeFileSync(options.outputPath, `${JSON.stringify(mergedEntries, null, 2)}\n`);
  console.log(`Imported browser captures for ${imported} entries (${challenged} challenge pages, ${missing} missing HTML files).`);
}

function createFallbackSlug(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseArgs(args) {
  const rootDir = __dirname;
  const options = {
    inputPath: path.join(rootDir, "value-research-template.json"),
    outputPath: path.join(rootDir, "value-research-ebay.json"),
    planPath: path.join(rootDir, "ebay-browser-capture-plan.json"),
    htmlDir: path.join(rootDir, "ebay-browser-captures"),
    domain: DEFAULT_DOMAIN,
    limit: DEFAULT_LIMIT,
  };

  for (const arg of args) {
    if (arg.startsWith("--input=")) {
      options.inputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--output=")) {
      options.outputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--plan=")) {
      options.planPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--html-dir=")) {
      options.htmlDir = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--domain=")) {
      options.domain = arg.split("=").slice(1).join("=") || DEFAULT_DOMAIN;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_LIMIT, 1);
    }
  }

  return options;
}

main();
