#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const rootDir = __dirname;
const gamesPath = path.join(rootDir, "games.json");
const defaultInputPath = path.join(rootDir, "value-research-template.json");

function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultInputPath;
  const gamesPayload = JSON.parse(fs.readFileSync(gamesPath, "utf8"));
  const researchEntries = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  if (!gamesPayload || !Array.isArray(gamesPayload.collection)) {
    throw new Error("games.json does not contain a valid collection array.");
  }

  if (!Array.isArray(researchEntries)) {
    throw new Error("Research input must be an array.");
  }

  const researchMap = new Map(
    researchEntries
      .map((entry) => [normalizeTitle(entry.title), entry])
      .filter(([title]) => title),
  );

  let updated = 0;

  gamesPayload.collection = gamesPayload.collection.map((game) => {
    const research = researchMap.get(normalizeTitle(game.title));

    if (!research) {
      return game;
    }

    const importedComps = Array.isArray(research.comps) ? research.comps.slice(0, 10) : [];

    if (!importedComps.length) {
      return game;
    }

    const analysis = analyzeComps(importedComps);
    const nextGame = { ...game };
    nextGame.valueComps = importedComps;
    nextGame.valueSamples = analysis.keptCount;
    nextGame.valueSource = String(research.valueSource || "eBay sold listings").trim();
    nextGame.valueUpdated = String(research.valueUpdated || new Date().toISOString().slice(0, 10)).trim();

    if (analysis.suggestedValue) {
      nextGame.suggestedValue = analysis.suggestedValue;
      updated += 1;
    }

    return nextGame;
  });

  fs.writeFileSync(gamesPath, `${JSON.stringify(gamesPayload, null, 2)}\n`);
  console.log(`Updated ${updated} games with suggested values in ${gamesPath}`);
}

function analyzeComps(comps) {
  const prices = Array.isArray(comps)
    ? comps
        .map((comp) => Number.parseFloat(comp && comp.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((left, right) => left - right)
    : [];

  if (!prices.length) {
    return {
      suggestedValue: "",
      keptCount: 0,
    };
  }

  const median = getMedian(prices);
  const trimmed = prices.filter((price, index) => {
    if (prices.length >= 5 && index === 0) {
      return false;
    }

    if (prices.length >= 8 && index < 2) {
      return false;
    }

    return price >= median * 0.55;
  });

  const kept = trimmed.length ? trimmed : prices;
  const suggestedValue = roundCurrency(getMedian(kept));

  return {
    suggestedValue: String(suggestedValue),
    keptCount: kept.length,
  };
}

function getMedian(prices) {
  const sorted = [...prices].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function roundCurrency(value) {
  return Math.round(value);
}

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase();
}

main();
