const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OPENRETRO_REPORT = path.join(ROOT, "openretro-reviews-report.json");
const LEMON_REPORT = path.join(ROOT, "lemon-ratings-report.json");
const OUTPUT_FILE = path.join(ROOT, "external-links.json");

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const openretroReport = readJson(OPENRETRO_REPORT, {});
  const lemonReport = readJson(LEMON_REPORT, {});
  const titles = [...new Set([...Object.keys(openretroReport), ...Object.keys(lemonReport)])].sort((a, b) =>
    a.localeCompare(b, "sv"),
  );
  const output = {};

  let processed = 0;

  for (const title of titles) {
    const lemonUrl = cleanText(lemonReport[title]?.url);
    const openretroUrl = cleanText(openretroReport[title]?.sourceUrl);
    let holUrl = "";

    if (openretroUrl) {
      processed += 1;
      console.log(`[${processed}] ${title}`);
      const html = await fetchPage(openretroUrl);

      if (html) {
        holUrl = extractExternalLink(html, /https?:\/\/hol\.abime\.net\/[^"' <]+/i);
      }
    }

    if (lemonUrl || holUrl || openretroUrl) {
      output[title] = {
        lemonUrl,
        holUrl,
        openretroUrl,
      };
    }
  }

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Saved ${Object.keys(output).length} title links to ${OUTPUT_FILE}`);
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; Codex External Link Builder/1.0)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return "";
    }

    return await response.text();
  } catch (error) {
    console.warn(`Request failed for ${url}: ${error.message}`);
    return "";
  }
}

function extractExternalLink(html, pattern) {
  const match = html.match(pattern);
  return match ? cleanText(match[0]) : "";
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
