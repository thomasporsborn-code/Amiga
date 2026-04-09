#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const rootDir = __dirname;
const gamesPath = path.join(rootDir, "games.json");
const outputPath = path.join(rootDir, "value-research-template.json");

function main() {
  const payload = JSON.parse(fs.readFileSync(gamesPath, "utf8"));

  if (!payload || !Array.isArray(payload.collection)) {
    throw new Error("games.json does not contain a valid collection array.");
  }

  const template = payload.collection
    .map((game) => ({
      title: String(game.title || "").trim(),
      publisher: String(game.publisher || "").trim(),
      release: game.release || "",
      currentValue: String(game.value || "").trim(),
      suggestedValue: String(game.suggestedValue || "").trim(),
      valueSamples: Number(game.valueSamples || 0) || 0,
      valueSource: String(game.valueSource || "").trim(),
      valueUpdated: String(game.valueUpdated || "").trim(),
      searchTitle: buildSearchTitle(game),
      comps: [],
      notes: "",
    }))
    .filter((entry) => entry.title)
    .sort((left, right) => left.title.localeCompare(right.title, "sv"));

  fs.writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`);
  console.log(`Wrote ${template.length} value research entries to ${outputPath}`);
}

function buildSearchTitle(game) {
  const title = String(game.title || "").trim();
  const publisher = String(game.publisher || "").trim();
  const release = game.release ? String(game.release) : "";
  return [title, publisher, release].filter(Boolean).join(" ");
}

main();
