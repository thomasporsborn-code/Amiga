#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_DOMAIN,
  DEFAULT_LIMIT,
  buildSoldSearchUrl,
  cleanText,
  createCaptureSlug,
} = require("./ebay-value-utils.js");

function main() {
  const options = parseArgs(process.argv.slice(2));
  const entries = JSON.parse(fs.readFileSync(options.inputPath, "utf8"));

  if (!Array.isArray(entries)) {
    throw new Error("Input file must be an array of research entries.");
  }

  const selected = entries.slice(options.start, options.start + options.count).map((entry, index) => {
    const searchTitle = cleanText(entry.searchTitle || entry.title);
    const slug = `${String(index + options.start + 1).padStart(4, "0")}-${createCaptureSlug(entry.title)}`;

    return {
      title: entry.title,
      publisher: cleanText(entry.publisher),
      release: cleanText(entry.release),
      searchTitle,
      captureFile: `${slug}.html`,
      capturePath: path.join(options.htmlDir, `${slug}.html`),
      captureUrl: buildSoldSearchUrl({
        domain: options.domain,
        query: searchTitle,
        limit: options.limit,
      }),
    };
  });

  fs.writeFileSync(options.outputPath, `${JSON.stringify(selected, null, 2)}\n`);
  console.log(`Wrote ${selected.length} browser capture entries to ${options.outputPath}`);
}

function parseArgs(args) {
  const rootDir = __dirname;
  const options = {
    inputPath: path.join(rootDir, "value-research-template.json"),
    outputPath: path.join(rootDir, "ebay-browser-capture-plan.json"),
    htmlDir: path.join(rootDir, "ebay-browser-captures"),
    domain: DEFAULT_DOMAIN,
    start: 0,
    count: 5,
    limit: DEFAULT_LIMIT,
  };

  for (const arg of args) {
    if (arg.startsWith("--input=")) {
      options.inputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--output=")) {
      options.outputPath = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--html-dir=")) {
      options.htmlDir = path.resolve(arg.split("=").slice(1).join("="));
    } else if (arg.startsWith("--domain=")) {
      options.domain = arg.split("=").slice(1).join("=") || DEFAULT_DOMAIN;
    } else if (arg.startsWith("--start=")) {
      options.start = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || 0, 0);
    } else if (arg.startsWith("--count=")) {
      options.count = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || 5, 1);
    } else if (arg.startsWith("--limit=")) {
      options.limit = Math.max(Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_LIMIT, 1);
    }
  }

  return options;
}

main();
