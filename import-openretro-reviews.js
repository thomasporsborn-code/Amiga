const fs = require("fs");
const path = require("path");

const OPENRETRO_BASE_URL = "https://openretro.org";
const CSV_FILE = path.join(process.cwd(), "games.csv");
const OUTPUT_FILE = path.join(process.cwd(), "openretro-reviews.json");
const REPORT_FILE = path.join(process.cwd(), "openretro-reviews-report.json");

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const delayArg = process.argv.find((arg) => arg.startsWith("--delay-ms="));
const titleArg = process.argv.find((arg) => arg.startsWith("--title="));
const refresh = args.has("--refresh");
const onlyMissing = args.has("--only-missing");

const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : Infinity;
const delayMs = delayArg ? Number.parseInt(delayArg.split("=")[1], 10) : 350;
const singleTitle = titleArg ? cleanText(titleArg.split("=").slice(1).join("=")) : "";

const TITLE_ALIASES = {
  "'Nam 1965-1975": ["nam-1965-1975", "nam"],
  "Alien Breed II: The Horror Continues AGA": ["alien-breed-ii-the-horror-continues-aga"],
  "Alien Breed: Special Edition 92": ["alien-breed-special-edition-92"],
  "James Pond 2: Codename Robocod": ["james-pond-2-codename-robocod"],
  "Pinball Fantasies AGA": ["pinball-fantasies-aga"],
  "Second Samurai AGA": ["second-samurai-aga"],
  "The Chaos Engine AGA": ["the-chaos-engine-aga", "chaos-engine-aga"],
  "Xmas Lemmings 93": ["xmas-lemmings-93"],
  "Xmas Lemmings 94": ["xmas-lemmings-94"],
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_FILE, "utf8"));
  const titles = singleTitle
    ? [singleTitle]
    : rows.map((row) => cleanText(row.Title)).filter(Boolean);
  const output = refresh ? {} : readJson(OUTPUT_FILE);
  const report = refresh ? {} : readJson(REPORT_FILE);

  let processed = 0;

  for (const title of titles) {
    if (processed >= limit) {
      break;
    }

    if (!refresh && !onlyMissing && output[title]) {
      continue;
    }

    if (onlyMissing && output[title]) {
      continue;
    }

    processed += 1;
    console.log(`[${processed}] ${title}`);

    const result = await importTitle(title);

    if (result && result.reviews.length) {
      output[title] = {
        averagePercent: result.averagePercent,
        openRetroScore: result.openRetroScore,
        sourceUrl: result.sourceUrl,
        reviews: result.reviews,
      };
      report[title] = {
        status: "matched",
        sourceUrl: result.sourceUrl,
        openRetroTitle: result.openRetroTitle,
        method: result.method,
        reviewsFound: result.reviews.length,
      };
      console.log(`  -> matched ${result.reviews.length} reviews at ${result.sourceUrl}`);
    } else {
      delete output[title];
      report[title] = {
        status: "unmatched",
        sourceUrl: result ? result.sourceUrl : "",
        openRetroTitle: result ? result.openRetroTitle : "",
        method: result ? result.method : "not-found",
        reviewsFound: 0,
      };
      console.log("  -> no reviews found");
    }

    writeJson(OUTPUT_FILE, sortObject(output));
    writeJson(REPORT_FILE, sortObject(report));
    await wait(delayMs);
  }

  console.log(`Done. ${Object.keys(output).length} titles with OpenRetro reviews.`);
}

async function importTitle(title) {
  const slugResult = await trySlugCandidates(title);

  if (slugResult && slugResult.reviews.length) {
    return slugResult;
  }

  const searchResult = await trySearch(title);
  return searchResult && searchResult.reviews.length ? searchResult : slugResult;
}

async function trySlugCandidates(title) {
  const candidates = buildSlugCandidates(title);

  for (const slug of candidates) {
    const sourceUrl = `${OPENRETRO_BASE_URL}/amiga/${slug}`;
    const html = await fetchPage(sourceUrl);

    if (!html) {
      continue;
    }

    const parsed = parseGamePage(html, sourceUrl);

    if (!parsed) {
      continue;
    }

    if (!isLikelyTitleMatch(title, parsed.openRetroTitle)) {
      continue;
    }

    return {
      ...parsed,
      method: "slug",
    };
  }

  return null;
}

async function trySearch(title) {
  const searchUrl = `${OPENRETRO_BASE_URL}/browse/amiga?q=${encodeURIComponent(title)}`;
  const html = await fetchPage(searchUrl);

  if (!html) {
    return null;
  }

  const candidates = parseSearchResults(html)
    .map((entry) => ({
      ...entry,
      score: getTitleMatchScore(title, entry.title),
    }))
    .filter((entry) => entry.score > 0.35)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  for (const entry of candidates) {
    const htmlPage = await fetchPage(entry.url);

    if (!htmlPage) {
      continue;
    }

    const parsed = parseGamePage(htmlPage, entry.url);

    if (!parsed) {
      continue;
    }

    if (!isLikelyTitleMatch(title, parsed.openRetroTitle)) {
      continue;
    }

    return {
      ...parsed,
      method: "search",
    };
  }

  return null;
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; Codex OpenRetro Importer/1.0)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn(`Request failed for ${url}: ${error.message}`);
    return null;
  }
}

function parseGamePage(html, sourceUrl) {
  const openRetroTitleMatch = html.match(
    /<h1[^>]*id=['"]fs-title['"][^>]*>\s*([^<]+?)\s*<span[^>]*class=['"]subtitle['"][^>]*>\s*Amiga\s*<\/span>\s*<\/h1>/i,
  );
  const openRetroTitle = openRetroTitleMatch ? decodeHtml(openRetroTitleMatch[1]) : "";
  const reviews = parseReviewRows(html);
  const openRetroScore = parseOpenRetroScore(html);
  const averagePercent = reviews.length ? calculateAverage(reviews) : openRetroScore !== null ? openRetroScore * 10 : null;

  if (!openRetroTitle) {
    return null;
  }

  return {
    sourceUrl,
    openRetroTitle,
    openRetroScore,
    averagePercent,
    reviews,
  };
}

function parseReviewRows(html) {
  const regex =
    /<a[^>]+href=['"][^'"]*amr\.abime\.net[^'"]*['"][^>]*>\s*<span[^>]*class=['"]score['"][^>]*>\s*([0-9]+)%\s*<\/span>\s*<span[^>]*class=['"]publication['"][^>]*>\s*([^<]+?)\s*<\/span>\s*<\/a>/gi;
  const rows = [];
  const seen = new Set();
  let match;

  while ((match = regex.exec(html))) {
    const score = Number.parseFloat(match[1]);
    const magazine = cleanText(decodeHtml(match[2]));
    const key = `${magazine}::${score}`;

    if (!magazine || Number.isNaN(score) || seen.has(key)) {
      continue;
    }

    seen.add(key);
    rows.push({
      magazine,
      issue: "",
      year: "",
      score: Number.isInteger(score) ? String(score) : String(score.toFixed(1)),
    });
  }

  return rows;
}

function parseOpenRetroScore(html) {
  const match = html.match(/Score:\s*([0-9]+(?:\.[0-9]+)?)/i);

  if (!match) {
    return null;
  }

  const score = Number.parseFloat(match[1]);
  return Number.isNaN(score) ? null : score;
}

function parseSearchResults(html) {
  const regex = /<a[^>]+href=['"]([^'"]*\/amiga\/[^'"]+)['"][^>]*>\s*([^<]+?)\s+Amiga\s*<\/a>/gi;
  const results = [];
  const seen = new Set();
  let match;

  while ((match = regex.exec(html))) {
    const href = decodeHtml(match[1]);
    const title = cleanText(decodeHtml(match[2]));
    const url = href.startsWith("http") ? href : `${OPENRETRO_BASE_URL}${href}`;
    const key = `${title}::${url}`;

    if (!title || seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push({ title, url });
  }

  return results;
}

function buildSlugCandidates(title) {
  const aliases = TITLE_ALIASES[title] || [];
  const variants = new Set();
  const normalizedTitle = cleanText(title);

  variants.add(slugify(normalizedTitle));
  variants.add(slugify(normalizedTitle.replace(/[:+]/g, " ")));
  variants.add(slugify(normalizedTitle.replace(/\bAGA\b/gi, "[AGA]")));
  variants.add(slugify(normalizedTitle.replace(/\bII\b/g, "2")));
  variants.add(slugify(normalizedTitle.replace(/\bIII\b/g, "3")));
  variants.add(slugify(normalizedTitle.replace(/\bIV\b/g, "4")));

  for (const alias of aliases) {
    variants.add(slugify(alias));
  }

  return [...variants].filter(Boolean);
}

function slugify(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['".,!?]/g, "")
    .replace(/\(([^)]+)\)/g, " $1 ")
    .replace(/\[([^\]]+)\]/g, " $1 ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeTitle(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\bii\b/gi, "2")
    .replace(/\biii\b/gi, "3")
    .replace(/\biv\b/gi, "4")
    .replace(/\bthe\s+/i, "")
    .replace(/,\s*the$/i, "")
    .replace(/\[(.*?)\]/g, " $1 ")
    .replace(/\((.*?)\)/g, " $1 ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isLikelyTitleMatch(left, right) {
  return getTitleMatchScore(left, right) >= 0.72;
}

function getTitleMatchScore(left, right) {
  const a = normalizeTitle(left);
  const b = normalizeTitle(right);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  if (a.includes(b) || b.includes(a)) {
    return 0.84;
  }

  const leftTokens = new Set(a.split(" "));
  const rightTokens = new Set(b.split(" "));
  const intersectionSize = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const unionSize = new Set([...leftTokens, ...rightTokens]).size;

  return unionSize ? intersectionSize / unionSize : 0;
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

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(current);
      current = "";

      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }

      row = [];
    } else {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [headers, ...values] = rows;

  return values.map((entry) =>
    headers.reduce((result, header, index) => {
      result[header] = entry[index] ?? "";
      return result;
    }, {}),
  );
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return {};
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort((left, right) => left[0].localeCompare(right[0], "sv")));
}
