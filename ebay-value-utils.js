const DEFAULT_LIMIT = 8;
const DEFAULT_DOMAIN = "www.ebay.co.uk";
const EXCLUDED_PLATFORM_TOKENS = [
  "atari",
  "spectrum",
  "zx",
  "c64",
  "amstrad",
  "dos",
  "ibm",
  "pc",
  "pcdos",
  "dosbox",
  "megadrive",
  "mega",
  "drive",
  "master",
  "system",
  "nes",
  "snes",
  "nintendo",
  "playstation",
  "ps1",
  "ps2",
  "ps3",
  "ps4",
  "ps5",
  "vita",
  "xbox",
  "switch",
];

function buildSoldSearchUrl({ domain = DEFAULT_DOMAIN, query, limit = DEFAULT_LIMIT }) {
  const url = new URL(`https://${domain}/sch/i.html`);
  url.searchParams.set("_nkw", query);
  url.searchParams.set("LH_Sold", "1");
  url.searchParams.set("LH_Complete", "1");
  url.searchParams.set("_ipg", String(Math.max(limit * 2, 20)));
  url.searchParams.set("rt", "nc");
  return url.toString();
}

function extractSoldListingsFromHtml(html, domain = DEFAULT_DOMAIN) {
  const items = [];
  const itemPattern = /<li[^>]+class="[^"]*s-card[^"]*"[\s\S]*?<\/li>/g;
  const matches = html.match(itemPattern) || [];

  for (const chunk of matches) {
    if (!chunk.includes("Sold")) {
      continue;
    }

    const title = decodeHtml(cleanText(matchFirst(chunk, /<div role=heading[^>]*class=s-card__title><span[^>]*>([\s\S]*?)<\/span>/)));
    const price = cleanText(matchFirst(chunk, /class="[^"]*s-card__price[^"]*">([^<]+)</));
    const href = normalizeItemUrl(matchFirst(chunk, /<a[^>]+class="[^"]*s-card__link[^"]*"[^>]+href=([^ >]+)/), domain);
    const soldDate = decodeHtml(cleanText(matchFirst(chunk, /aria-label="Sold item">Sold\s+([^<]+)/)));

    if (!title || !price || !href) {
      continue;
    }

    items.push({
      title,
      price: normalizePrice(price),
      currency: getCurrencyFromPrice(price),
      endTime: soldDate,
      itemUrl: href,
      marketplace: domain,
    });
  }

  return dedupeBy(items, (item) => item.itemUrl || `${item.title}:${item.price}`);
}

function isChallengePage(html) {
  const normalized = String(html || "").toLowerCase();
  return (
    normalized.includes("checking your browser before you access ebay") ||
    normalized.includes("pardon our interruption") ||
    normalized.includes("challengeget")
  );
}

function isLikelyMatch({ baseTitle, publisher, release, resultTitle }) {
  const resultTokens = tokenize(resultTitle);

  if (containsExcludedPlatform(resultTokens)) {
    return false;
  }

  const baseNormalized = normalizeForMatch(baseTitle);
  const resultNormalized = normalizeForMatch(resultTitle);
  const baseTokens = tokenize(baseTitle).filter((token) => !isPlatformToken(token));
  const titleOverlap = baseTokens.length
    ? baseTokens.filter((token) => resultTokens.includes(token)).length / baseTokens.length
    : 0;
  const hasAmigaContext = resultTokens.includes("amiga") || resultTokens.includes("commodore");
  const publisherTokens = tokenize(publisher).filter((token) => !isGenericToken(token));
  const publisherOverlap = publisherTokens.length
    ? publisherTokens.filter((token) => resultTokens.includes(token)).length / publisherTokens.length
    : 0;
  const releaseMatch = release && resultTokens.includes(String(release));
  const hasSupportingContext = hasAmigaContext || publisherOverlap >= 0.5 || releaseMatch;

  if (baseNormalized && baseNormalized.length >= 5 && resultNormalized.includes(baseNormalized)) {
    return hasSupportingContext;
  }

  if (titleOverlap < 0.75) {
    return false;
  }

  if (hasAmigaContext) {
    return true;
  }

  if (publisherOverlap >= 0.5) {
    return true;
  }

  return Boolean(releaseMatch && titleOverlap >= 1);
}

function containsExcludedPlatform(tokens) {
  return EXCLUDED_PLATFORM_TOKENS.some((token) => tokens.includes(token));
}

function tokenize(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 1);
}

function normalizeForMatch(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(amiga|commodore|cd32|aga)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value) {
  return cleanText(value).toLowerCase();
}

function createCaptureSlug(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeItemUrl(value, domain) {
  const href = decodeHtml(cleanText(value).replace(/^['"]|['"]$/g, ""));

  if (!href) {
    return "";
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  if (href.startsWith("/")) {
    return `https://${domain}${href}`;
  }

  return `https://${domain}/${href.replace(/^\/+/, "")}`;
}

function normalizePrice(value) {
  return cleanText(value).replace(/[^\d.,-]/g, "");
}

function getCurrencyFromPrice(value) {
  if (value.includes("£")) {
    return "GBP";
  }
  if (value.includes("€")) {
    return "EUR";
  }
  if (value.includes("$")) {
    return "USD";
  }
  return "";
}

function isPlatformToken(token) {
  return ["amiga", "commodore", "cd32", "aga"].includes(token);
}

function isGenericToken(token) {
  return ["the", "software", "games", "game", "edition", "interactive"].includes(token);
}

function matchFirst(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function decodeHtml(value) {
  return cleanText(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'");
}

function dedupeBy(items, getKey) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = getKey(item);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

module.exports = {
  DEFAULT_DOMAIN,
  DEFAULT_LIMIT,
  buildSoldSearchUrl,
  cleanText,
  createCaptureSlug,
  extractSoldListingsFromHtml,
  isChallengePage,
  isLikelyMatch,
  normalizeTitle,
};
