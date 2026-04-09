#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const FINDING_API_URL = "https://svcs.ebay.com/services/search/FindingService/v1";
const DEFAULT_DELAY_MS = 450;
const DEFAULT_LIMIT = 8;
const DEFAULT_MARKETPLACE = "EBAY-GB";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const appId = options.appId || process.env.EBAY_APP_ID;

  if (!appId) {
    throw new Error("Missing eBay app ID. Pass --app-id=... or set EBAY_APP_ID.");
  }

  const rootDir = __dirname;
  const inputPath = path.resolve(options.input || path.join(rootDir, "value-research-template.json"));
  const outputPath = path.resolve(options.output || path.join(rootDir, "value-research-ebay.json"));

  const entries = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  if (!Array.isArray(entries)) {
    throw new Error("Input file must be an array of research entries.");
  }

  const updated = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const searchTitle = cleanText(entry.searchTitle || entry.title);

    if (!searchTitle) {
      updated.push(entry);
      continue;
    }

    const items = await fetchCompletedItems({
      appId,
      marketplace: options.marketplace,
      query: searchTitle,
      limit: options.limit,
    });

    const filteredItems = items
      .filter((item) => isLikelyMatch(searchTitle, item.title))
      .map((item) => ({
        title: item.title,
        price: item.price,
        currency: item.currency,
        endTime: item.endTime,
        itemUrl: item.itemUrl,
        marketplace: options.marketplace,
      }));

    updated.push({
      ...entry,
      comps: filteredItems,
      valueSource: filteredItems.length ? "eBay sold listings" : cleanText(entry.valueSource),
      valueUpdated: filteredItems.length ? new Date().toISOString().slice(0, 10) : cleanText(entry.valueUpdated),
    });

    process.stdout.write(`Processed ${index + 1}/${entries.length}: ${entry.title}\n`);

    if (index < entries.length - 1) {
      await delay(options.delayMs);
    }
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(updated, null, 2)}\n`);
  process.stdout.write(`Wrote ${updated.length} entries to ${outputPath}\n`);
}

async function fetchCompletedItems({ appId, marketplace, query, limit }) {
  const url = new URL(FINDING_API_URL);
  url.searchParams.set("OPERATION-NAME", "findCompletedItems");
  url.searchParams.set("SERVICE-VERSION", "1.13.0");
  url.searchParams.set("SECURITY-APPNAME", appId);
  url.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
  url.searchParams.set("REST-PAYLOAD", "true");
  url.searchParams.set("GLOBAL-ID", marketplace);
  url.searchParams.set("keywords", query);
  url.searchParams.set("paginationInput.entriesPerPage", String(limit));
  url.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
  url.searchParams.set("itemFilter(0).value", "true");
  url.searchParams.set("sortOrder", "EndTimeSoonest");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MyAmigaGamesValueResearch/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`eBay request failed with ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const items =
    payload?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item ||
    [];

  return items.map((item) => ({
    title: cleanText(item?.title?.[0]),
    price: cleanText(item?.sellingStatus?.[0]?.currentPrice?.[0]?.__value__),
    currency: cleanText(item?.sellingStatus?.[0]?.currentPrice?.[0]?.["@currencyId"]),
    endTime: cleanText(item?.listingInfo?.[0]?.endTime?.[0]),
    itemUrl: cleanText(item?.viewItemURL?.[0]),
  }));
}

function isLikelyMatch(searchTitle, resultTitle) {
  const searchTokens = tokenize(searchTitle);
  const resultTokens = tokenize(resultTitle);

  if (!searchTokens.length || !resultTokens.length) {
    return false;
  }

  const overlap = searchTokens.filter((token) => resultTokens.includes(token)).length;
  return overlap / searchTokens.length >= 0.6;
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

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(args) {
  const options = {
    appId: "",
    input: "",
    output: "",
    marketplace: DEFAULT_MARKETPLACE,
    limit: DEFAULT_LIMIT,
    delayMs: DEFAULT_DELAY_MS,
  };

  for (const arg of args) {
    if (arg.startsWith("--app-id=")) {
      options.appId = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--input=")) {
      options.input = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--output=")) {
      options.output = arg.split("=").slice(1).join("=");
    } else if (arg.startsWith("--marketplace=")) {
      options.marketplace = arg.split("=").slice(1).join("=") || DEFAULT_MARKETPLACE;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_LIMIT;
    } else if (arg.startsWith("--delay-ms=")) {
      options.delayMs = Number.parseInt(arg.split("=").slice(1).join("="), 10) || DEFAULT_DELAY_MS;
    }
  }

  return options;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
