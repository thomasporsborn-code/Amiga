# My Amiga Games

Static GitHub Pages site for an Amiga game collection.

## Publish

1. Make sure `admin-data.json` contains the admin changes you want to publish.
2. Push this folder to a GitHub repository.
3. Enable GitHub Pages from the repository root branch.

## Important

`admin-data.json` is the file-based admin layer for custom games, overrides, and accepted data-quality findings.

## Local Secrets

Never commit API keys to this repository.

For local eBay valuation research:

1. Copy `.env.example` to `.env`
2. Put your private key in `EBAY_APP_ID`
3. Keep `.env` local only

The repository ignores `.env`, so it will not be published to GitHub Pages.

## Value Research Flow

1. Build the research template:
   ```bash
   node build-value-research-template.js
   ```
2. Add your local eBay key in `.env`
3. Fetch sold-item comps:
   ```bash
   node fetch-ebay-comps.js
   ```
4. Import suggested values back into `games.json`:
   ```bash
   node import-value-suggestions.js value-research-ebay.json
   ```

`fetch-ebay-comps.js` reads `EBAY_APP_ID` from either:
- a local `.env` file
- or your shell environment
