const fs = require("fs");
const path = require("path");

const sourceDir = "/Users/Thomas/Downloads/Amigaspel";
const outputFile = path.join(process.cwd(), "boxart-map.json");

const files = fs
  .readdirSync(sourceDir)
  .filter((file) => /^page\d+\.html$|^index\.html$/.test(file))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

const map = {};
const entryPattern =
  /<td width="130"><img src="([^"]+)"[^>]*><\/td>\s*<td valign="top"[^>]*>\s*<strong>([\s\S]*?)<\/strong>/g;

for (const file of files) {
  const html = fs.readFileSync(path.join(sourceDir, file), "utf8");
  let match;

  while ((match = entryPattern.exec(html))) {
    const relativeImage = match[1].replace(/^Images\//i, "");
    const title = decodeHtml(match[2]).trim();

    if (!map[title]) {
      map[title] = `./boxart-source/${relativeImage}`;
    }
  }
}

fs.writeFileSync(outputFile, `${JSON.stringify(map, null, 2)}\n`);
console.log(`Wrote ${Object.keys(map).length} image mappings to ${outputFile}`);

function decodeHtml(value) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&");
}
