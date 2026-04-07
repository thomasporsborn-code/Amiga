const fs = require("fs");
const path = require("path");

const outputFile = path.join(process.cwd(), "abime-reviews.json");

if (process.argv.includes("--help")) {
  console.log("Usage: node import-abime-reviews.js <reviews.json>");
  process.exit(0);
}

const sourceFile = process.argv[2];

if (!sourceFile) {
  console.error("Missing source JSON file.");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const normalized = {};

for (const [title, entry] of Object.entries(source)) {
  if (!entry || !Array.isArray(entry.reviews) || entry.reviews.length === 0) {
    continue;
  }

  const reviews = entry.reviews
    .map((review) => ({
      magazine: cleanText(review.magazine),
      issue: cleanText(review.issue),
      year: cleanText(review.year),
      score: cleanScore(review.score),
    }))
    .filter((review) => review.magazine && review.score !== "");

  if (!reviews.length) {
    continue;
  }

  normalized[title] = {
    averagePercent:
      entry.averagePercent !== undefined && entry.averagePercent !== null && entry.averagePercent !== ""
        ? Number.parseFloat(entry.averagePercent)
        : calculateAverage(reviews),
    reviews,
  };
}

fs.writeFileSync(outputFile, `${JSON.stringify(sortObject(normalized), null, 2)}\n`);
console.log(`Wrote ${Object.keys(normalized).length} review mappings to ${outputFile}`);

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanScore(value) {
  const match = String(value || "").match(/[0-9]+(?:\.[0-9]+)?/);
  return match ? match[0] : "";
}

function calculateAverage(reviews) {
  const scores = reviews
    .map((review) => Number.parseFloat(review.score))
    .filter((score) => !Number.isNaN(score));

  if (!scores.length) {
    return null;
  }

  return Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1));
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort((left, right) => left[0].localeCompare(right[0], "sv")));
}
