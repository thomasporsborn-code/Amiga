const fs = require("fs");
const path = require("path");

const CSV_FILE = path.join(process.cwd(), "games.csv");
const RATINGS_FILE = path.join(process.cwd(), "lemon-ratings.json");
const REPORT_FILE = path.join(process.cwd(), "lemon-ratings-report.json");
const BASE_URL = "https://www.lemonamiga.com";
const DEFAULT_DELAY_MS = 600;
const DEFAULT_RETRIES = 3;
const USER_AGENT =
  "Mozilla/5.0 (compatible; DaddyCoolsAmigaGames/1.0; +https://github.com/)";
const TITLE_ALIASES = {
  "4-D Boxing": ["4D Sports Boxing", "4D Boxing"],
  "A320 Airbus: Edition USA": ["A320 Airbus"],
  "Afrika Korps": ["Africa Korps"],
  "After Burner (Activision)": ["After Burner"],
  "Alien Breed II: The Horror Continues AGA": [
    "Alien Breed 2 The Horror Continues AGA",
    "Alien Breed II: The Horror Continues",
  ],
  "Alien Breed: Special Edition 92": ["Alien Breed Special Edition 92", "Alien Breed Special Edition '92"],
  "APB": ["All Points Bulletin"],
  "Bard's Tale Construction Set, The": ["The Bard's Tale Construction Set", "Bard's Tale Construction Set"],
  "Battle Isle '93 - The Moon of Chromos": ["Battle Isle 93 The Moon of Chromos", "Battle Isle '93: The Moon of Chromos"],
  "Battle Squadron: The Destruction Of The Barrax Empire": ["Battle Squadron"],
  "Brian the Lion Starring In: Rumble in the Jungle": ["Brian the Lion"],
  "Captian fizz": ["Captain Fizz", "Captain Fizz Meets the Blaster-Trons"],
  "The Colonel's Bequest": ["Colonel's Bequest", "Colonel's Bequest, The"],
  "Cribbage King & Gin King": ["Cribbage King and Gin King"],
  "Disney's Aladdin": ["Aladdin"],
  "Dogfight: 80 Years Of Aerial Warfare": ["Dogfight"],
  "Dune II: The Building of a Dynasty": ["Dune 2", "Dune II", "Dune II: The Battle for Arrakis"],
  "Dungeon Master & Chaos Strikes Back": ["Dungeon Master and Chaos Strikes Back"],
  "Dungeon Master II: Skullkeep": ["Dungeon Master 2", "Dungeon Master II: The Legend of Skullkeep"],
  "Emerald Mine 3 Professional": ["Emerald Mine III Professional", "Emerald Mine 3"],
  "The Faery Tale Adventure: Book I": ["Faery Tale Adventure", "The Faery Tale Adventure"],
  "The Fantastic Adventures of Dizzy": ["Fantastic Adventures of Dizzy"],
  "The Fool's Errand": ["Fool's Errand", "Fools Errand"],
  "Hero Quest II: Legacy of Sorasil": ["HeroQuest II: Legacy of Sorasil", "Hero Quest 2"],
  "Indiana Jones And The Last Crusade: The Action Game": ["Indiana Jones and the Last Crusade", "Indiana Jones Last Crusade Action Game"],
  "Indiana Jones And The Last Crusade: The Graphic Adventure": [
    "Indiana Jones and the Last Crusade Graphic Adventure",
    "Indiana Jones and the Last Crusade",
  ],
  "James Pond 2: Codename: RoboCod AGA": [
    "James Pond 2: Codename RoboCod",
    "James Pond 2 Codename RoboCod",
  ],
  "J.R.R. Tolkien's The Lord of the Rings, Vol. I": ["Lord of the Rings Volume 1", "The Lord of the Rings"],
  "Jurassic Park AGA": ["Jurassic Park"],
  "Leisure Suit Larry Goes Looking for Love (In Several Wrong Places)": [
    "Leisure Suit Larry 2",
    "Leisure Suit Larry 2: Larry Goes Looking for Love (In Several Wrong Places)",
  ],
  "Leisure Suit Larry III: Passionate Patti in Pursuit of the Pulsating Pectorals": [
    "Leisure Suit Larry 3",
    "Leisure Suit Larry III",
  ],
  "Little Computer People: House-On-A-Disk": ["Little Computer People", "House on a Disk"],
  "Lotus: The Ultimate Challenge": ["Lotus Turbo Challenge"],
  "Might and Magic II: Gates to Another World": ["Might and Magic 2", "Might and Magic II"],
  "Pinball Fantasies AGA": ["Pinball Fantasies"],
  "Quest for Glory II: Trial by Fire": ["Quest for Glory 2", "Quest for Glory II"],
  "Rick Dangerous II": ["Rick Dangerous 2"],
  "S.T.U.N. Runner": ["STUN Runner"],
  "Sabre Team AGA": ["Sabre Team"],
  "S.D.I. (Cinemaware)": ["SDI"],
  "SDI (Activision)": ["SDI"],
  "Second Samurai AGA": ["Second Samurai"],
  "Sid Meier's Civilization": ["Civilization"],
  SimCity: ["Sim City"],
  "SimEarth: The Living Planet": ["Sim Earth", "SimEarth"],
  "Sid Meier's Colonization": ["Colonization"],
  "Sid Meier's Pirates!": ["Pirates!"],
  "Sid Meier's Railroad Tycoon": ["Railroad Tycoon"],
  "Sid Meier's Civilization AGA": ["Sid Meier's Civilization", "Civilization"],
  "Smash T.V.": ["Smash TV"],
  "S.W.I.V.": ["SWIV"],
  "Space Quest II: Chapter II - Vohaul's Revenge": ["Space Quest 2", "Space Quest II: Vohaul's Revenge"],
  "Space Quest: Chapter I - The Sarien Encounter": ["Space Quest 1", "Space Quest: The Sarien Encounter"],
  "Spy Vs Spy 3: Arctic Antics": ["Spy vs Spy 3"],
  "Strider 2": ["Strider II"],
  "Tales of the Unknown: Volume I - The Bard's Tale": ["The Bard's Tale", "Bard's Tale"],
  "The Bard's Tale III: Thief of Fate": ["The Bard's Tale 3", "Bard's Tale III: Thief of Fate"],
  "The blue & the Grey": ["The Blue and the Gray", "Blue and the Grey, The"],
  "The Chaos Engine AGA": ["Chaos Engine AGA", "The Chaos Engine"],
  "The Computer Edition of Risk: The World Conquest Game": ["Risk"],
  "Wierd Dreams": ["Weird Dreams"],
  "Xmas Lemmings 93": ["Xmas Lemmings 1993"],
  "Xmas Lemmings 94": ["Xmas Lemmings 1994"],
};

const options = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_FILE, "utf8"));
  const games = dedupeGames(rows);
  const existingRatings = readJson(RATINGS_FILE, {});
  const existingReport = readJson(REPORT_FILE, {});
  const unmatchedOnlyTitles = options.onlyUnmatched
    ? new Set(
        Object.entries(existingReport)
          .filter(([, value]) => !value.rating)
          .map(([title]) => title),
      )
    : null;

  let processed = 0;
  let imported = 0;
  let skipped = 0;
  let unmatched = 0;

  for (const game of games) {
    if (unmatchedOnlyTitles && !unmatchedOnlyTitles.has(game.title)) {
      continue;
    }

    if (!options.refresh && existingRatings[game.title]) {
      skipped += 1;
      continue;
    }

    if (options.limit !== null && processed >= options.limit) {
      break;
    }

    processed += 1;
    console.log(`[${processed}] ${game.title}`);

    const result = await findRating(game);

    if (result) {
      existingRatings[game.title] = result.rating;
      existingReport[game.title] = {
        title: game.title,
        rating: result.rating,
        votes: result.votes || "",
        matchTitle: result.matchTitle || "",
        year: result.year || "",
        publisher: result.publisher || "",
        url: result.url,
        method: result.method,
        confidence: Number(result.confidence.toFixed(3)),
        importedAt: new Date().toISOString(),
      };
      imported += 1;
      console.log(
        `  -> ${result.rating} via ${result.method} (${result.matchTitle || game.title}, ${result.confidence.toFixed(3)})`,
      );
    } else {
      existingReport[game.title] = {
        title: game.title,
        rating: "",
        votes: "",
        matchTitle: "",
        year: "",
        publisher: "",
        url: "",
        method: "unmatched",
        confidence: 0,
        importedAt: new Date().toISOString(),
      };
      unmatched += 1;
      console.log("  -> no confident Lemon match");
    }

    writeJson(RATINGS_FILE, sortObject(existingRatings));
    writeJson(REPORT_FILE, sortObject(existingReport));

    if (options.delayMs > 0) {
      await wait(options.delayMs);
    }
  }

  console.log("");
  console.log(`Imported ratings : ${imported}`);
  console.log(`Skipped existing : ${skipped}`);
  console.log(`Unmatched titles : ${unmatched}`);
  console.log(`Ratings file     : ${RATINGS_FILE}`);
  console.log(`Report file      : ${REPORT_FILE}`);
}

async function findRating(game) {
  for (const query of buildQueries(game.title)) {
    let searchHtml = "";

    try {
      searchHtml = await fetchText(
        `${BASE_URL}/games/list.php?list_title=${encodeURIComponent(query)}`,
      );
    } catch (error) {
      console.warn(`  search failed for "${query}": ${error.message}`);
      continue;
    }

    const candidates = extractSearchCandidates(searchHtml);
    const bestSearchMatch = pickBestCandidate(game, candidates);

    if (bestSearchMatch && isConfidentMatch(bestSearchMatch)) {
      return {
        ...bestSearchMatch,
        method: "search",
      };
    }
  }

  for (const directUrl of buildDirectUrls(game.title)) {
    let pageHtml = "";

    try {
      pageHtml = await fetchText(directUrl);
    } catch (error) {
      continue;
    }

    const pageResult = extractGamePageRating(pageHtml, directUrl, game);

    if (pageResult && isConfidentMatch(pageResult, true)) {
      return {
        ...pageResult,
        method: "direct",
      };
    }
  }

  return null;
}

function buildQueries(title) {
  const queries = new Set([title]);
  const withoutLeadingArticle = title.replace(/^The\s+/i, "").trim();
  const withoutTrailingParen = title.replace(/\s+\([^)]*\)\s*$/g, "").trim();
  const compactPunctuation = title.replace(/([A-Za-z0-9])[-:]+([A-Za-z0-9])/g, "$1$2").trim();
  const withoutAga = title.replace(/\s+\bAGA\b\s*$/i, "").trim();
  const withoutCd32 = title.replace(/\s+\bCD32\b\s*$/i, "").trim();
  const noDots = title.replace(/\./g, "").trim();
  const withSpacesInCamel = title.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  const ampToAnd = title.replace(/\s*&\s*/g, " and ").trim();
  const andToAmp = title.replace(/\s+and\s+/gi, " & ").trim();
  const beforeColon = title.split(":")[0].trim();
  const beforeDash = title.split(" - ")[0].trim();
  const aliasQueries = TITLE_ALIASES[title] || [];

  for (const alias of aliasQueries) {
    if (alias) {
      queries.add(alias);
    }
  }

  if (withoutLeadingArticle && withoutLeadingArticle !== title) {
    queries.add(withoutLeadingArticle);
  }

  if (withoutTrailingParen && withoutTrailingParen !== title) {
    queries.add(withoutTrailingParen);
  }

  const simplified = withoutTrailingParen.replace(/^The\s+/i, "").trim();
  if (simplified && simplified !== title) {
    queries.add(simplified);
  }

  if (compactPunctuation && compactPunctuation !== title) {
    queries.add(compactPunctuation);
  }

  for (const variant of [
    withoutAga,
    withoutCd32,
    noDots,
    withSpacesInCamel,
    ampToAnd,
    andToAmp,
    beforeColon,
    beforeDash,
  ]) {
    if (variant && variant !== title) {
      queries.add(variant);
    }
  }

  return [...queries];
}

function buildDirectUrls(title) {
  const urls = new Set();
  const variants = buildQueries(title);

  for (const variant of variants) {
    const slug = slugify(variant);
    if (slug) {
      urls.add(`${BASE_URL}/game/${slug}`);
    }
  }

  return [...urls];
}

function extractSearchCandidates(html) {
  const candidates = [];
  const pattern =
    /<span class="grid-vote-score[^"]*">[\s\S]*?([0-9]+\.[0-9]+)<\/span>[\s\S]*?<div class="game-grid-title">\s*<a href="([^"]+)">([^<]+)<\/a>[\s\S]*?<div class="grid-info">([\s\S]*?)<\/div>/g;
  let match;

  while ((match = pattern.exec(html))) {
    const [, rating, relativeUrl, title, gridInfo] = match;
    const infoText = stripTags(gridInfo);
    const infoParts = infoText
      .split(",")
      .map((part) => cleanText(part))
      .filter(Boolean);
    const year = infoParts[0] || "";
    const publisher = infoParts.slice(1).join(", ");

    candidates.push({
      rating,
      url: toAbsoluteUrl(relativeUrl),
      matchTitle: decodeHtml(title),
      year,
      publisher,
      votes: "",
    });
  }

  return candidates;
}

function extractGamePageRating(html, url, game) {
  const titleMatch = html.match(/<h1>([^<]+)<\/h1>/i);
  const ratingMatch = html.match(/"ratingValue"\s*:\s*"([0-9.]+)"/);

  if (!titleMatch || !ratingMatch) {
    return null;
  }

  const votesMatch = html.match(/"reviewCount"\s*:\s*"([0-9]+)"/);
  const publisherMatch = html.match(/<td class="align-top text-nowrap">Publisher:<\/td>\s*<td>([\s\S]*?)<\/td>/i);
  const releasedMatch = html.match(/<td class="align-top text-nowrap">Released:<\/td>\s*<td>([\s\S]*?)<\/td>/i);
  const matchTitle = decodeHtml(cleanText(titleMatch[1]));
  const publisher = publisherMatch ? stripTags(publisherMatch[1]) : "";
  const yearMatch = releasedMatch ? stripTags(releasedMatch[1]).match(/\b(19|20)\d{2}\b/) : null;

  return {
    rating: ratingMatch[1],
    votes: votesMatch ? votesMatch[1] : "",
    url,
    matchTitle,
    year: yearMatch ? yearMatch[0] : "",
    publisher,
    confidence: scoreCandidate(game, {
      matchTitle,
      publisher,
      year: yearMatch ? yearMatch[0] : "",
    }),
  };
}

function pickBestCandidate(game, candidates) {
  let best = null;

  for (const candidate of candidates) {
    const confidence = scoreCandidate(game, candidate);
    const scored = {
      ...candidate,
      confidence,
    };

    if (!best || scored.confidence > best.confidence) {
      best = scored;
    }
  }

  return best;
}

function isConfidentMatch(candidate, isDirect = false) {
  if (!candidate) {
    return false;
  }

  if (candidate.confidence >= 0.995) {
    return true;
  }

  if (candidate.confidence >= 0.93) {
    return true;
  }

  if (isDirect && candidate.confidence >= 0.9) {
    return true;
  }

  return false;
}

function scoreCandidate(game, candidate) {
  const foundTitle = normalizeForComparison(candidate.matchTitle);
  const foundTitleNoArticle = stripLeadingArticle(foundTitle);
  const comparisonTitles = getComparisonTitles(game);
  let titleSimilarity = 0;

  for (const rawTitle of comparisonTitles) {
    const wantedTitle = normalizeForComparison(rawTitle);
    const wantedTitleNoArticle = stripLeadingArticle(wantedTitle);
    titleSimilarity = Math.max(
      titleSimilarity,
      similarity(wantedTitle, foundTitle),
      similarity(wantedTitleNoArticle, foundTitleNoArticle),
    );
  }

  let score = titleSimilarity;
  const wantsAga = /\baga\b/i.test(game.title);
  const wantsCd32 = /\bcd32\b/i.test(game.title);
  const candidateUrl = String(candidate.url || "").toLowerCase();
  const isAgaCandidate = candidateUrl.includes("-aga");
  const isCd32Candidate = candidateUrl.includes("-cd32");

  if (game.release && candidate.year && String(game.release) === String(candidate.year)) {
    score += 0.05;
  }

  if (game.publisher && candidate.publisher) {
    const wantedPublisher = normalizeForComparison(game.publisher);
    const foundPublisher = normalizeForComparison(candidate.publisher);

    if (wantedPublisher && foundPublisher) {
      if (wantedPublisher === foundPublisher) {
        score += 0.08;
      } else if (
        wantedPublisher.includes(foundPublisher) ||
        foundPublisher.includes(wantedPublisher) ||
        similarity(wantedPublisher, foundPublisher) >= 0.82
      ) {
        score += 0.04;
      }
    }
  }

  if (wantsAga) {
    score += isAgaCandidate ? 0.12 : -0.12;
  } else if (isAgaCandidate) {
    score -= 0.04;
  }

  if (wantsCd32) {
    score += isCd32Candidate ? 0.12 : -0.12;
  } else if (isCd32Candidate) {
    score -= 0.04;
  }

  return Math.min(score, 1);
}

function getComparisonTitles(game) {
  return [game.title, ...(TITLE_ALIASES[game.title] || [])];
}

function similarity(left, right) {
  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftCore = simplifyTitle(left);
  const rightCore = simplifyTitle(right);

  if (leftCore === rightCore) {
    return 0.99;
  }

  if (leftCore.includes(rightCore) || rightCore.includes(leftCore)) {
    return 0.95;
  }

  const dice = diceCoefficient(leftCore, rightCore);
  const edit = editSimilarity(leftCore, rightCore);

  return Math.max(dice, edit);
}

function simplifyTitle(value) {
  return value
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(edition|special|classic|enhanced)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingArticle(value) {
  return value.replace(/^the\s+/i, "").trim();
}

function normalizeForComparison(value) {
  return cleanText(value)
    .replace(/,\s*(the|a|an)$/i, " $1")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\biii\b/g, "3")
    .replace(/\bii\b/g, "2")
    .replace(/\biv\b/g, "4")
    .replace(/&/g, " and ")
    .replace(/['`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diceCoefficient(left, right) {
  if (left.length < 2 || right.length < 2) {
    return left === right ? 1 : 0;
  }

  const leftBigrams = new Map();

  for (let index = 0; index < left.length - 1; index += 1) {
    const bigram = left.slice(index, index + 2);
    leftBigrams.set(bigram, (leftBigrams.get(bigram) || 0) + 1);
  }

  let intersection = 0;

  for (let index = 0; index < right.length - 1; index += 1) {
    const bigram = right.slice(index, index + 2);
    const count = leftBigrams.get(bigram) || 0;

    if (count > 0) {
      leftBigrams.set(bigram, count - 1);
      intersection += 1;
    }
  }

  return (2 * intersection) / (left.length + right.length - 2);
}

function editSimilarity(left, right) {
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length, 1);
}

function levenshtein(left, right) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function dedupeGames(rows) {
  const seen = new Set();
  const games = [];

  for (const row of rows) {
    const title = cleanText(row.Title);

    if (!title || seen.has(title)) {
      continue;
    }

    seen.add(title);
    const releaseYear = Number.parseInt(row.Release, 10);

    games.push({
      title,
      publisher: cleanText(row.Publisher),
      release: Number.isNaN(releaseYear) ? "" : String(releaseYear),
    });
  }

  return games;
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

async function fetchText(url) {
  let lastError;

  for (let attempt = 0; attempt < options.retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        const error = new Error(`Request failed for ${url} (${response.status})`);
        error.status = response.status;
        throw error;
      }

      return await response.text();
    } catch (error) {
      lastError = error;

      if (attempt < options.retries - 1) {
        const multiplier = error.status === 429 ? 10 : 1;
        await wait(options.delayMs * (attempt + 1) * multiplier);
      }
    }
  }

  throw lastError;
}

function slugify(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " "));
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value) {
  return decodeHtml(String(value || "").replace(/\s+/g, " ")).trim();
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort((left, right) => left[0].localeCompare(right[0])));
}

function toAbsoluteUrl(url) {
  if (!url) {
    return "";
  }

  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(args) {
  const parsed = {
    limit: null,
    delayMs: DEFAULT_DELAY_MS,
    retries: DEFAULT_RETRIES,
    refresh: false,
    onlyUnmatched: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--limit") {
      parsed.limit = Number.parseInt(args[index + 1], 10);
      index += 1;
    } else if (arg === "--delay-ms") {
      parsed.delayMs = Number.parseInt(args[index + 1], 10);
      index += 1;
    } else if (arg === "--retries") {
      parsed.retries = Number.parseInt(args[index + 1], 10);
      index += 1;
    } else if (arg === "--refresh") {
      parsed.refresh = true;
    } else if (arg === "--only-unmatched") {
      parsed.onlyUnmatched = true;
    } else if (arg === "--help") {
      console.log(
        "Usage: node import-lemon-ratings.js [--limit N] [--delay-ms N] [--retries N] [--refresh] [--only-unmatched]",
      );
      process.exit(0);
    }
  }

  if (Number.isNaN(parsed.limit)) {
    parsed.limit = null;
  }

  if (Number.isNaN(parsed.delayMs) || parsed.delayMs < 0) {
    parsed.delayMs = DEFAULT_DELAY_MS;
  }

  if (Number.isNaN(parsed.retries) || parsed.retries < 1) {
    parsed.retries = DEFAULT_RETRIES;
  }

  return parsed;
}
