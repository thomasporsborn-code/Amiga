const ADMIN_PASSWORD = "amiga";
const CHART_COLORS = ["#0058ac", "#2d82d4", "#67a9e4", "#90c2ef", "#f29f3f", "#e55c57", "#7fb069"];
const APP_STORAGE_KEY = "amiga-data-store";
const APP_STORAGE_BACKUP_KEY = "amiga-data-store-backup";
const APP_STORAGE_VERSION = 1;
const COLLECTION_DATA_URL = "./games.json";

const persistedData = loadAppDataStore();

const state = {
  baseGames: [],
  rawGames: [],
  games: [],
  filteredGames: [],
  boxartMap: {},
  lemonRatingsMap: {},
  externalLinksMap: {},
  reviewsMap: {},
  acceptedQualityFindings: persistedData.acceptedQualityFindings,
  wishlist: Array.isArray(persistedData.wishlist) ? persistedData.wishlist : [],
  isAdmin: window.localStorage.getItem("amiga-admin-session") === "true",
  editingTitle: "",
  editingSourceTitle: "",
  editingCustom: false,
  creatingGame: false,
  detailsTitle: "",
  quickGenre: "",
  currentPage: "catalog",
  viewMode: "grid",
  filters: {
    search: "",
    genre: "all",
    publisher: "all",
    developer: "all",
    year: "all",
    ratingMin: 0,
    ratingMax: 10,
    whdloadOnly: false,
    completeOnly: false,
    originalOnly: false,
    extremelyRareOnly: false,
    incompleteOnly: false,
    testedOnly: false,
    untestedOnly: false,
    showSold: false,
    sortOrder: "title-asc",
  },
};

const elements = {
  authToggle: document.querySelector("#auth-toggle"),
  authToggleLabel: document.querySelector("#auth-toggle-label"),
  catalogNav: document.querySelector("#catalog-nav"),
  statsNav: document.querySelector("#stats-nav"),
  top50Nav: document.querySelector("#top50-nav"),
  galleryNav: document.querySelector("#gallery-nav"),
  qualityNav: document.querySelector("#quality-nav"),
  catalogPage: document.querySelector("#catalog-page"),
  statsPage: document.querySelector("#stats-page"),
  top50Page: document.querySelector("#top50-page"),
  galleryPage: document.querySelector("#gallery-page"),
  gamePage: document.querySelector("#game-page"),
  qualityPage: document.querySelector("#quality-page"),
  authModal: document.querySelector("#auth-modal"),
  authForm: document.querySelector("#auth-form"),
  authPassword: document.querySelector("#auth-password"),
  authError: document.querySelector("#auth-error"),
  authCancel: document.querySelector("#auth-cancel"),
  editorModal: document.querySelector("#editor-modal"),
  editorForm: document.querySelector("#editor-form"),
  editorCancel: document.querySelector("#editor-cancel"),
  editorTitle: document.querySelector("#editor-title"),
  editorTitleInput: document.querySelector("#editor-title-input"),
  editorBoxartImage: document.querySelector("#editor-boxart-image"),
  editorBoxartPlaceholder: document.querySelector("#editor-boxart-placeholder"),
  editorBoxartTitle: document.querySelector("#editor-boxart-title"),
  editorBoxartPath: document.querySelector("#editor-boxart-path"),
  editorBoxartDropzone: document.querySelector("#editor-boxart-dropzone"),
  editorBoxartUpload: document.querySelector("#editor-boxart-upload"),
  editorBoxartClear: document.querySelector("#editor-boxart-clear"),
  editorBoxartFile: document.querySelector("#editor-boxart-file"),
  editorGenre: document.querySelector("#editor-genre"),
  editorPublisher: document.querySelector("#editor-publisher"),
  editorDeveloper: document.querySelector("#editor-developer"),
  editorRelease: document.querySelector("#editor-release"),
  editorBoxSize: document.querySelector("#editor-box-size"),
  editorChipset: document.querySelector("#editor-chipset"),
  editorLemonRating: document.querySelector("#editor-lemon-rating"),
  editorWhdloadInstalled: document.querySelector("#editor-whdload-installed"),
  editorComplete: document.querySelector("#editor-complete"),
  editorEdition: document.querySelector("#editor-edition"),
  editorHolRarity: document.querySelector("#editor-hol-rarity"),
  editorTop50Rank: document.querySelector("#editor-top50-rank"),
  editorSold: document.querySelector("#editor-sold"),
  editorTop50Comment: document.querySelector("#editor-top50-comment"),
  detailsModal: document.querySelector("#details-modal"),
  detailsClose: document.querySelector("#details-close"),
  detailsTitle: document.querySelector("#details-title"),
  detailsBoxartImage: document.querySelector("#details-boxart-image"),
  detailsBoxartPlaceholder: document.querySelector("#details-boxart-placeholder"),
  detailsBoxartTitle: document.querySelector("#details-boxart-title"),
  detailsGenre: document.querySelector("#details-genre"),
  detailsPublisher: document.querySelector("#details-publisher"),
  detailsDeveloper: document.querySelector("#details-developer"),
  detailsYear: document.querySelector("#details-year"),
  detailsBoxSize: document.querySelector("#details-box-size"),
  detailsChipset: document.querySelector("#details-chipset"),
  detailsCopyProtection: document.querySelector("#details-copy-protection"),
  detailsHolRarity: document.querySelector("#details-hol-rarity"),
  detailsLemonRating: document.querySelector("#details-lemon-rating"),
  detailsGameLink: document.querySelector("#details-game-link"),
  detailsLemonLink: document.querySelector("#details-lemon-link"),
  detailsHolLink: document.querySelector("#details-hol-link"),
  detailsWhdload: document.querySelector("#details-whdload"),
  detailsInstalled: document.querySelector("#details-installed"),
  detailsComplete: document.querySelector("#details-complete"),
  detailsOriginal: document.querySelector("#details-original"),
  detailsTested: document.querySelector("#details-tested"),
  detailsPaid: document.querySelector("#details-paid"),
  detailsSold: document.querySelector("#details-sold"),
  detailsReviewAverage: document.querySelector("#details-review-average"),
  detailsReviewList: document.querySelector("#details-review-list"),
  heroStats: document.querySelector("#hero-stats"),
  heroLatest: document.querySelector("#hero-latest"),
  wishlistPanel: document.querySelector("#wishlist-panel"),
  collectionSummary: document.querySelector("#collection-summary"),
  statsBoard: document.querySelector("#stats-board"),
  top50Summary: document.querySelector("#top50-summary"),
  top50List: document.querySelector("#top50-list"),
  gallerySummary: document.querySelector("#gallery-summary"),
  galleryGrid: document.querySelector("#gallery-grid"),
  gamePageContent: document.querySelector("#game-page-content"),
  qualitySummary: document.querySelector("#quality-summary"),
  qualityGrid: document.querySelector("#quality-grid"),
  listHeader: document.querySelector("#list-header"),
  grid: document.querySelector("#game-grid"),
  emptyState: document.querySelector("#empty-state"),
  genreFilter: document.querySelector("#genre-filter"),
  publisherFilter: document.querySelector("#publisher-filter"),
  developerFilter: document.querySelector("#developer-filter"),
  yearFilter: document.querySelector("#year-filter"),
  ratingRange: document.querySelector("#rating-range"),
  ratingMin: document.querySelector("#rating-min"),
  ratingMax: document.querySelector("#rating-max"),
  ratingRangeValue: document.querySelector("#rating-range-value"),
  searchInput: document.querySelector("#search-input"),
  whdloadOnly: document.querySelector("#whdload-only"),
  completeOnly: document.querySelector("#complete-only"),
  originalOnly: document.querySelector("#original-only"),
  extremelyRareOnly: document.querySelector("#extremely-rare-only"),
  incompleteOnly: document.querySelector("#incomplete-only"),
  testedOnly: document.querySelector("#tested-only"),
  untestedOnly: document.querySelector("#untested-only"),
  showSold: document.querySelector("#show-sold"),
  adminFilterGroup: document.querySelector("#admin-filter-group"),
  detailsAdminPanel: document.querySelector("#details-admin-panel"),
  sortOrder: document.querySelector("#sort-order"),
  resetFilters: document.querySelector("#reset-filters"),
  addGameButton: document.querySelector("#add-game-button"),
  exportCsvButton: document.querySelector("#export-csv-button"),
  exportBackupButton: document.querySelector("#export-backup-button"),
  importBackupButton: document.querySelector("#import-backup-button"),
  importBackupInput: document.querySelector("#import-backup-input"),
  gridView: document.querySelector("#grid-view"),
  listView: document.querySelector("#list-view"),
  template: document.querySelector("#game-card-template"),
};

init();

async function init() {
  bindEvents();
  syncAdminUi();

  try {
    const loadedCanonicalCollection = await loadCollectionData();

    if (!loadedCanonicalCollection) {
      if (persistedData.collection.length) {
        state.baseGames = persistedData.collection.map(normalizeStoredGame);
        state.rawGames = state.baseGames.map(cloneGame);
      } else {
        const csvText = await fetchTextWithRetry("./games.csv");
        state.baseGames = parseCsv(csvText).map(normalizeGame);
        state.rawGames = state.baseGames.map(cloneGame);
      }
    }

    state.games = state.rawGames.map(cloneGame);
    loadBoxartMap();
    loadLemonRatingsMap();
    loadExternalLinksMap();
    loadReviewsMap();
    hydrateFilters();
    applyRouteFromLocation();
    render();
  } catch (error) {
    elements.collectionSummary.innerHTML = `
      <strong>The collection data could not be loaded automatically.</strong>
      <span>Open the page through a simple local web server so the collection files can be read properly, for example with <code>python3 -m http.server</code> in the project folder.</span>
    `;
    console.error(error);
  }
}

async function loadCollectionData() {
  try {
    const response = await fetchTextWithRetry(COLLECTION_DATA_URL, 1);
    const filePayload = JSON.parse(response);

    if (!isValidCollectionData(filePayload)) {
      return false;
    }

    const selectedPayload = selectPreferredCollectionPayload(filePayload, persistedData);
    state.baseGames = filePayload.collection.map(normalizeStoredGame);
    state.rawGames = selectedPayload.collection.map(normalizeStoredGame);
    state.acceptedQualityFindings = mergeAcceptedQualityFindings(
      filePayload.acceptedQualityFindings,
      persistedData.acceptedQualityFindings,
    );
    state.wishlist = mergeWishlist(filePayload.wishlist, persistedData.wishlist);
    return true;
  } catch (error) {
    console.warn("games.json could not be loaded on startup.", error);
    return false;
  }
}

async function loadBoxartMap() {
  try {
    const response = await fetchTextWithRetry("./boxart-map.json");
    state.boxartMap = JSON.parse(response);
    state.rawGames = state.rawGames.map((game) => ({
      ...game,
      boxartPath: cleanText(game.boxartPath) || getBoxartPath(game.title),
    }));
    state.games = state.rawGames.map(cloneGame);
    render();
  } catch (error) {
    console.warn("Boxart map could not be loaded on startup.", error);
  }
}

async function loadLemonRatingsMap() {
  try {
    const response = await fetchTextWithRetry("./lemon-ratings.json");
    state.lemonRatingsMap = JSON.parse(response);
    state.rawGames = state.rawGames.map((game) => ({
      ...game,
      lemonRating: cleanText(game.lemonRating) || getLemonRating(game.title),
    }));
    state.games = state.rawGames.map(cloneGame);
    render();
  } catch (error) {
    console.warn("Lemon ratings map could not be loaded on startup.", error);
  }
}

async function loadReviewsMap() {
  const reviewFiles = ["./openretro-reviews.json", "./abime-reviews.json"];

  for (const file of reviewFiles) {
    try {
      const response = await fetchTextWithRetry(file);
      state.reviewsMap = JSON.parse(response);
      return;
    } catch (error) {
      console.warn(`Review map ${file} could not be loaded on startup.`, error);
    }
  }
}

async function loadExternalLinksMap() {
  try {
    const response = await fetchTextWithRetry("./external-links.json");
    state.externalLinksMap = JSON.parse(response);
  } catch (error) {
    console.warn("External links map could not be loaded on startup.", error);
  }
}

function bindEvents() {
  window.addEventListener("popstate", () => {
    applyRouteFromLocation();
    render();
  });

  elements.catalogNav.addEventListener("click", () => {
    state.currentPage = "catalog";
    clearGameRoute();
    syncPageView();
  });

  elements.statsNav.addEventListener("click", () => {
    state.currentPage = "stats";
    clearGameRoute();
    syncPageView();
  });

  elements.top50Nav.addEventListener("click", () => {
    state.currentPage = "top50";
    clearGameRoute();
    syncPageView();
  });

  elements.galleryNav.addEventListener("click", () => {
    state.currentPage = "gallery";
    clearGameRoute();
    syncPageView();
  });

  elements.qualityNav.addEventListener("click", () => {
    state.currentPage = "quality";
    clearGameRoute();
    syncPageView();
  });

  elements.authToggle.addEventListener("click", () => {
    if (state.isAdmin) {
      logoutAdmin();
      return;
    }

    openAuthModal();
  });

  elements.authForm.addEventListener("submit", handleLoginSubmit);
  elements.authCancel.addEventListener("click", closeAuthModal);
  elements.authModal.addEventListener("click", (event) => {
    if (event.target === elements.authModal) {
      closeAuthModal();
    }
  });

  elements.editorForm.addEventListener("submit", handleEditorSubmit);
  elements.editorCancel.addEventListener("click", closeEditorModal);
  elements.addGameButton.addEventListener("click", openCreateGameModal);
  elements.exportCsvButton.addEventListener("click", exportCollectionCsv);
  elements.exportBackupButton.addEventListener("click", exportBackupJson);
  elements.importBackupButton.addEventListener("click", () => {
    elements.importBackupInput.click();
  });
  elements.importBackupInput.addEventListener("change", handleImportBackupFile);
  elements.wishlistPanel.addEventListener("submit", handleWishlistSubmit);
  elements.wishlistPanel.addEventListener("click", handleWishlistClick);
  elements.editorBoxartPath.addEventListener("input", () => {
    updateEditorBoxartPreview(elements.editorTitleInput.value, elements.editorBoxartPath.value);
  });
  elements.editorTitleInput.addEventListener("input", () => {
    updateEditorBoxartPreview(elements.editorTitleInput.value, elements.editorBoxartPath.value);
  });
  elements.editorBoxartUpload.addEventListener("click", () => {
    elements.editorBoxartFile.click();
  });
  elements.editorBoxartClear.addEventListener("click", () => {
    elements.editorBoxartPath.value = "";
    elements.editorBoxartFile.value = "";
    updateEditorBoxartPreview(elements.editorTitleInput.value, "");
  });
  elements.editorBoxartFile.addEventListener("change", handleEditorBoxartFileSelect);
  elements.editorBoxartDropzone.addEventListener("click", () => {
    elements.editorBoxartFile.click();
  });
  elements.editorBoxartDropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.editorBoxartFile.click();
    }
  });
  elements.editorBoxartDropzone.addEventListener("dragover", handleEditorBoxartDragOver);
  elements.editorBoxartDropzone.addEventListener("dragleave", handleEditorBoxartDragLeave);
  elements.editorBoxartDropzone.addEventListener("drop", handleEditorBoxartDrop);
  elements.qualityGrid.addEventListener("click", handleQualityGridClick);
  elements.editorModal.addEventListener("click", (event) => {
    if (event.target === elements.editorModal) {
      closeEditorModal();
    }
  });

  elements.detailsClose.addEventListener("click", closeDetailsModal);
  elements.detailsModal.addEventListener("click", (event) => {
    if (event.target === elements.detailsModal) {
      closeDetailsModal();
    }
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.genreFilter.addEventListener("change", (event) => {
    state.filters.genre = event.target.value;
    render();
  });

  elements.publisherFilter.addEventListener("change", (event) => {
    state.filters.publisher = event.target.value;
    render();
  });

  elements.developerFilter.addEventListener("change", (event) => {
    state.filters.developer = event.target.value;
    render();
  });

  elements.yearFilter.addEventListener("change", (event) => {
    state.filters.year = event.target.value;
    render();
  });

  elements.ratingMin.addEventListener("input", (event) => {
    const nextMin = Number.parseFloat(event.target.value);
    state.filters.ratingMin = Number.isNaN(nextMin) ? 0 : nextMin;

    if (state.filters.ratingMin > state.filters.ratingMax) {
      state.filters.ratingMax = state.filters.ratingMin;
      elements.ratingMax.value = String(state.filters.ratingMax);
    }

    updateRatingRangeValue();
    render();
  });

  elements.ratingMax.addEventListener("input", (event) => {
    const nextMax = Number.parseFloat(event.target.value);
    state.filters.ratingMax = Number.isNaN(nextMax) ? 10 : nextMax;

    if (state.filters.ratingMax < state.filters.ratingMin) {
      state.filters.ratingMin = state.filters.ratingMax;
      elements.ratingMin.value = String(state.filters.ratingMin);
    }

    updateRatingRangeValue();
    render();
  });

  elements.whdloadOnly.addEventListener("change", (event) => {
    state.filters.whdloadOnly = event.target.checked;
    render();
  });

  elements.completeOnly.addEventListener("change", (event) => {
    state.filters.completeOnly = event.target.checked;
    render();
  });

  elements.originalOnly.addEventListener("change", (event) => {
    state.filters.originalOnly = event.target.checked;
    render();
  });

  elements.extremelyRareOnly.addEventListener("change", (event) => {
    state.filters.extremelyRareOnly = event.target.checked;
    render();
  });

  elements.incompleteOnly.addEventListener("change", (event) => {
    state.filters.incompleteOnly = event.target.checked;
    render();
  });

  elements.testedOnly.addEventListener("change", (event) => {
    state.filters.testedOnly = event.target.checked;
    render();
  });

  elements.untestedOnly.addEventListener("change", (event) => {
    state.filters.untestedOnly = event.target.checked;
    render();
  });

  elements.showSold.addEventListener("change", (event) => {
    state.filters.showSold = event.target.checked;
    render();
  });

  elements.sortOrder.addEventListener("change", (event) => {
    state.filters.sortOrder = event.target.value;
    render();
  });

  elements.resetFilters.addEventListener("click", resetFilters);

  elements.gridView.addEventListener("click", () => {
    state.viewMode = "grid";
    syncViewToggle();
    render();
  });

  elements.listView.addEventListener("click", () => {
    state.viewMode = "list";
    syncViewToggle();
    render();
  });
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

async function fetchTextWithRetry(url, attempts = 3, delayMs = 250) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed for ${url} (${response.status})`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await delay(delayMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeGame(entry) {
  const genres = splitMultiValue(entry.Genre);
  const title = cleanText(entry.Title);
  const publisher = cleanText(entry.Publisher) || "Unknown publisher";
  const developer = cleanText(entry.Developer) || publisher;
  const rating = Number.parseInt(entry["My Rating"], 10);
  const platform = cleanText(entry.Platform) || "Amiga";
  const releaseYear = Number.parseInt(entry.Release, 10);
  const complete = cleanText(entry.Complete);
  const completeState = getCompleteState(complete);
  const tested = cleanText(entry.Tested);
  const testedState = getTestedState(tested);
  const boxartPath = getBoxartPath(title);
  const edition = cleanText(entry.Edition) || "Unknown";
  const whdloadInstalled = cleanText(entry["WHDload Installed"]);
  const whdloadDoesNotExist = cleanText(entry["WHDload does not exist"]);
  const chipset = cleanText(entry.Chipset) || "Unknown";
  const boxSize = normalizeBoxSize(entry["Box Size"]);
  const copyProtection = cleanText(entry["Copy Protection"]) || "Unknown";
  const paid = cleanText(entry.Paid);
  const sold = cleanText(entry.Sold);
  const holRarity = cleanText(entry["Hall of Light Rarity"]) || "Unknown";
  const top50Rank = Number.parseInt(entry["Top 50 Rank"], 10);
  const top50Comment = cleanText(entry["Top 50 Comment"]);
  const isCustom = entry.__custom === true;

  const baseGame = {
    title,
    publisher,
    developer,
    platform,
    release: Number.isNaN(releaseYear) ? null : releaseYear,
    genres,
    primaryGenre: genres[0] || "Other",
    rating: Number.isNaN(rating) ? 0 : rating,
    complete,
    completeState,
    completeStateLabel:
      completeState === "complete"
        ? "Complete"
        : completeState === "incomplete"
          ? "Incomplete"
          : "Unknown status",
    edition,
    whdloadInstalled,
    whdloadDoesNotExist,
    tested,
    testedState,
    chipset,
    boxSize,
    copyProtection,
    paid,
    sold,
    holRarity,
    top50Rank: Number.isNaN(top50Rank) ? null : top50Rank,
    top50Comment,
    isCustom,
    lemonRating: getLemonRating(title),
    boxartPath,
  };

  return baseGame;
}

function normalizeStoredGame(entry) {
  const title = cleanText(entry.title || entry.Title);
  const publisher = cleanText(entry.publisher || entry.Publisher) || "Unknown publisher";
  const developer = cleanText(entry.developer || entry.Developer) || publisher;
  const platform = cleanText(entry.platform || entry.Platform) || "Amiga";
  const releaseValue = entry.release ?? entry.Release;
  const releaseYear = Number.parseInt(String(releaseValue || ""), 10);
  const genres = Array.isArray(entry.genre)
    ? entry.genre.map((value) => cleanText(value)).filter(Boolean)
    : splitMultiValue(entry.genre || entry.Genre);
  const complete = cleanText(entry.complete || entry.Complete);
  const tested = cleanText(entry.tested || entry.Tested);
  const top50RankValue = entry.top50Rank ?? entry["Top 50 Rank"];
  const top50Rank = Number.parseInt(String(top50RankValue || ""), 10);
  const lemonRating = cleanText(entry.lemonRating || entry["Lemon Rating"]);
  const boxartPath = cleanText(entry.boxartPath) || getBoxartPath(title);

  return {
    title,
    publisher,
    developer,
    platform,
    release: Number.isNaN(releaseYear) ? null : releaseYear,
    genres: genres.length ? genres : ["Other"],
    primaryGenre: genres[0] || "Other",
    rating: Number.parseInt(String(entry.rating || entry["My Rating"] || 0), 10) || 0,
    complete,
    completeState: getCompleteState(complete),
    completeStateLabel:
      getCompleteState(complete) === "complete"
        ? "Complete"
        : getCompleteState(complete) === "incomplete"
          ? "Incomplete"
          : "Unknown status",
    edition: cleanText(entry.edition || entry.Edition) || "Unknown",
    whdloadInstalled: cleanText(entry.whdloadInstalled || entry["WHDload Installed"]),
    whdloadDoesNotExist: cleanText(entry.whdloadDoesNotExist || entry["WHDload does not exist"]),
    tested,
    testedState: getTestedState(tested),
    chipset: cleanText(entry.chipset || entry.Chipset) || "Unknown",
    boxSize: normalizeBoxSize(entry.boxSize || entry["Box Size"]),
    copyProtection: cleanText(entry.copyProtection || entry["Copy Protection"]) || "Unknown",
    paid: cleanText(entry.paid || entry.Paid),
    sold: cleanText(entry.sold || entry.Sold),
    holRarity: cleanText(entry.holRarity || entry["Hall of Light Rarity"]) || "Unknown",
    top50Rank: Number.isNaN(top50Rank) ? null : top50Rank,
    top50Comment: cleanText(entry.top50Comment || entry["Top 50 Comment"]),
    isCustom: entry.isCustom === true || entry.__custom === true,
    lemonRating,
    boxartPath,
  };
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeBoxSize(value) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return "Unknown";
  }

  if (cleaned.toLowerCase() === "mid size") {
    return "Mid Size";
  }

  return cleaned;
}

function formatPaidValue(value) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return "No data";
  }

  const match = cleaned.match(/[0-9]+(?:[.,][0-9]+)?/);

  if (!match) {
    return "No data";
  }

  const amount = match[0].replace(",", ".");
  return `${amount} SEK`;
}

function splitMultiValue(value) {
  return cleanText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hydrateFilters() {
  populateSelect(elements.genreFilter, getTopValues("primaryGenre", 18), "All genres");
  populateSelect(elements.publisherFilter, getTopValues("publisher", 24), "All publishers");
  populateSelect(elements.developerFilter, getTopValues("developer", 24), "All developers");
  populateSelect(elements.yearFilter, getReleaseYears(), "All years");
  elements.genreFilter.value = state.filters.genre;
  elements.publisherFilter.value = state.filters.publisher;
  elements.developerFilter.value = state.filters.developer;
  elements.yearFilter.value = state.filters.year;
  updateRatingRangeValue();
}

function getTopValues(field, limit) {
  const counts = new Map();

  for (const game of state.games) {
    const key = game[field];
    if (!key) {
      continue;
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "sv"))
    .slice(0, limit)
    .map(([value]) => String(value));
}

function getReleaseYears() {
  return [...new Set(state.games.map((game) => game.release).filter(Boolean))]
    .sort((left, right) => right - left)
    .map((year) => String(year));
}

function populateSelect(select, values, allLabel) {
  select.innerHTML = `<option value="all">${allLabel}</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
}

function resetFilters() {
  state.filters = {
    ...state.filters,
    search: "",
    genre: "all",
    publisher: "all",
    developer: "all",
    year: "all",
    ratingMin: 0,
    ratingMax: 10,
    whdloadOnly: false,
    completeOnly: false,
    originalOnly: false,
    extremelyRareOnly: false,
    incompleteOnly: false,
    testedOnly: false,
    untestedOnly: false,
    showSold: false,
    sortOrder: "title-asc",
  };

  elements.searchInput.value = "";
  elements.genreFilter.value = "all";
  elements.publisherFilter.value = "all";
  elements.developerFilter.value = "all";
  elements.yearFilter.value = "all";
  elements.ratingMin.value = "0";
  elements.ratingMax.value = "10";
  elements.whdloadOnly.checked = false;
  elements.completeOnly.checked = false;
  elements.originalOnly.checked = false;
  elements.extremelyRareOnly.checked = false;
  elements.incompleteOnly.checked = false;
  elements.testedOnly.checked = false;
  elements.untestedOnly.checked = false;
  elements.showSold.checked = false;
  elements.sortOrder.value = "title-asc";
  updateRatingRangeValue();
  render();
}

function render() {
  const filtered = state.games
    .filter((game) => matchesFilters(game))
    .sort(sortGames);
  const top50Games = getTop50Games();
  const qualityReport = buildQualityReport(state.games);
  const routeGameTitle = getRouteGameTitle();

  state.filteredGames = filtered;

  renderHeroStats(state.games);
  renderWishlistPanel();
  renderCollectionSummary(filtered);
  renderStatsBoard(state.games);
  renderGrid(filtered);
  renderTop50(top50Games);
  renderGallery(filtered);
  renderGamePage(routeGameTitle);
  renderQualityTools(qualityReport);
  syncPageView();
}

function syncViewToggle() {
  const isGrid = state.viewMode === "grid";
  elements.gridView.classList.toggle("is-active", isGrid);
  elements.listView.classList.toggle("is-active", !isGrid);
  elements.grid.classList.toggle("list-view", !isGrid);
  elements.listHeader.classList.toggle("hidden", isGrid);
}

function matchesFilters(game) {
  const searchMatches =
    !state.filters.search ||
    [game.title, game.publisher, game.developer, game.primaryGenre]
      .join(" ")
      .toLowerCase()
      .includes(state.filters.search);

  const genreMatches = state.filters.genre === "all" || game.primaryGenre === state.filters.genre;
  const publisherMatches =
    state.filters.publisher === "all" || game.publisher === state.filters.publisher;
  const developerMatches =
    state.filters.developer === "all" || game.developer === state.filters.developer;
  const yearMatches =
    state.filters.year === "all" || String(game.release || "") === state.filters.year;
  const hasActiveRatingFilter = state.filters.ratingMin > 0 || state.filters.ratingMax < 10;
  const lemonRating = Number.parseFloat(game.lemonRating);
  const ratingMatches =
    !hasActiveRatingFilter ||
    (!Number.isNaN(lemonRating) &&
      lemonRating >= state.filters.ratingMin &&
      lemonRating <= state.filters.ratingMax);
  const whdloadMatches =
    !state.filters.whdloadOnly || game.whdloadInstalled.toLowerCase() === "yes";
  const completeMatches =
    !state.filters.completeOnly || game.completeState === "complete";
  const originalMatches =
    !state.filters.originalOnly || game.edition.toLowerCase() === "original";
  const extremelyRareMatches =
    !state.filters.extremelyRareOnly || cleanText(game.holRarity).toLowerCase() === "extremely rare";
  const incompleteMatches =
    !state.filters.incompleteOnly || game.completeState === "incomplete";
  const testedStates = new Set();

  if (state.filters.testedOnly) {
    testedStates.add("tested-working");
    testedStates.add("tested-not-working");
  }

  if (state.filters.untestedOnly) {
    testedStates.add("untested");
  }

  const testedMatches =
    testedStates.size === 0 || testedStates.has(game.testedState);
  const isSold = getSoldState(game.sold);
  const soldMatches = state.isAdmin && state.filters.showSold ? true : !isSold;

  return (
    searchMatches &&
    genreMatches &&
    publisherMatches &&
    developerMatches &&
    yearMatches &&
    ratingMatches &&
    whdloadMatches &&
    completeMatches &&
    originalMatches &&
    extremelyRareMatches &&
    incompleteMatches &&
    testedMatches &&
    soldMatches
  );
}

function sortGames(a, b) {
  switch (state.filters.sortOrder) {
    case "year-desc":
      return (b.release || 0) - (a.release || 0) || a.title.localeCompare(b.title, "sv");
    case "year-asc":
      return (a.release || 9999) - (b.release || 9999) || a.title.localeCompare(b.title, "sv");
    case "publisher-asc":
      return a.publisher.localeCompare(b.publisher, "sv") || a.title.localeCompare(b.title, "sv");
    case "title-asc":
    default:
      return a.title.localeCompare(b.title, "sv");
  }
}

function renderHeroStats(games) {
  const publisherCount = new Set(games.map((game) => game.publisher).filter(Boolean)).size;
  const developerCount = new Set(games.map((game) => game.developer).filter(Boolean)).size;
  const originalEditionCount = games.filter((game) => game.edition.toLowerCase() === "original").length;
  const latestAddedGame = getLatestAddedGame();

  elements.heroStats.innerHTML = `
    <div class="stat-chip">
      <span class="stat-chip__window">
        <span class="stat-chip__window-icon" aria-hidden="true"></span>
        <span class="stat-chip__window-label">Titles</span>
        <span class="stat-chip__window-lines" aria-hidden="true"></span>
      </span>
      <span class="stat-chip__text"><strong>${games.length}</strong><span>Collection entries</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__window">
        <span class="stat-chip__window-icon" aria-hidden="true"></span>
        <span class="stat-chip__window-label">Publishers</span>
        <span class="stat-chip__window-lines" aria-hidden="true"></span>
      </span>
      <span class="stat-chip__text"><strong>${publisherCount}</strong><span>Studios listed</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__window">
        <span class="stat-chip__window-icon" aria-hidden="true"></span>
        <span class="stat-chip__window-label">Developers</span>
        <span class="stat-chip__window-lines" aria-hidden="true"></span>
      </span>
      <span class="stat-chip__text"><strong>${developerCount}</strong><span>Developer names</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__window">
        <span class="stat-chip__window-icon" aria-hidden="true"></span>
        <span class="stat-chip__window-label">Original</span>
        <span class="stat-chip__window-lines" aria-hidden="true"></span>
      </span>
      <span class="stat-chip__text"><strong>${originalEditionCount}</strong><span>Original editions</span></span>
    </div>
  `;

  elements.heroLatest.innerHTML = latestAddedGame
    ? `
      <div class="hero-latest__panel">
        <div class="hero-latest__chrome">
          <span class="hero-latest__icon" aria-hidden="true"></span>
          <span class="hero-latest__title">Latest Added</span>
          <span class="hero-latest__lines" aria-hidden="true"></span>
        </div>
        <div class="hero-latest__content">
          <div class="hero-latest__media">
            ${
              latestAddedGame.boxartPath
                ? `<img class="hero-latest__image" src="${escapeHtml(latestAddedGame.boxartPath)}" alt="${escapeHtml(latestAddedGame.title)} boxart" />`
                : `<div class="hero-latest__placeholder"><span>BOX ART</span></div>`
            }
          </div>
          <div class="hero-latest__body">
            <strong>${escapeHtml(latestAddedGame.title)}</strong>
            <span>${escapeHtml(latestAddedGame.publisher || "Unknown publisher")}</span>
            <span>${escapeHtml(latestAddedGame.primaryGenre || "Other")} · ${escapeHtml(String(latestAddedGame.release || "Unknown"))}</span>
          </div>
        </div>
      </div>
    `
    : "";
}

function renderWishlistPanel() {
  const wishlistItems = [...new Set((state.wishlist || []).map((item) => cleanText(item)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "sv"),
  );

  elements.wishlistPanel.innerHTML = `
    <div class="wishlist-panel__panel">
      <div class="wishlist-panel__chrome">
        <span class="wishlist-panel__icon" aria-hidden="true"></span>
        <span class="wishlist-panel__title">Wishlist</span>
        <span class="wishlist-panel__lines" aria-hidden="true"></span>
      </div>
      <div class="wishlist-panel__body">
        <p class="wishlist-panel__summary"><strong>${wishlistItems.length}</strong> games on your wanted list.</p>
        ${
          state.isAdmin
            ? `
              <form class="wishlist-panel__form" id="wishlist-form">
                <label class="field field--compact">
                  <span>Add Wishlist Game</span>
                  <input id="wishlist-input" type="text" placeholder="For example Monkey Island 2" />
                </label>
                <button class="button button--ghost" type="submit">Add to Wishlist</button>
              </form>
            `
            : ""
        }
        <div class="wishlist-panel__list">
          ${
            wishlistItems.length
              ? wishlistItems
                  .map(
                    (title) => `
                      <div class="wishlist-panel__item">
                        <span>${escapeHtml(title)}</span>
                        ${
                          state.isAdmin
                            ? `<button class="wishlist-panel__remove" type="button" data-remove-wishlist="${escapeHtml(title)}">Remove</button>`
                            : ""
                        }
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="wishlist-panel__empty">No wishlist titles added yet.</p>`
          }
        </div>
      </div>
    </div>
  `;
}

function handleWishlistSubmit(event) {
  if (!state.isAdmin) {
    return;
  }

  const form = event.target.closest("#wishlist-form");

  if (!form) {
    return;
  }

  event.preventDefault();
  const input = form.querySelector("#wishlist-input");
  const title = cleanText(input?.value);

  if (!title) {
    input?.focus();
    return;
  }

  if (!state.wishlist.includes(title)) {
    state.wishlist.push(title);
    persistAppData();
    render();
  }

  if (input) {
    input.value = "";
  }
}

function handleWishlistClick(event) {
  if (!state.isAdmin) {
    return;
  }

  const removeButton = event.target.closest("[data-remove-wishlist]");

  if (!removeButton) {
    return;
  }

  const title = cleanText(removeButton.dataset.removeWishlist);
  state.wishlist = state.wishlist.filter((item) => item !== title);
  persistAppData();
  render();
}

function getLatestAddedGame() {
  if (!state.rawGames.length) {
    return null;
  }

  const latestRaw = state.rawGames[state.rawGames.length - 1];
  return state.games.find((game) => game.title === latestRaw.title) || state.games[state.games.length - 1] || null;
}

function renderCollectionSummary(filtered) {
  const genres = countBy(filtered, "primaryGenre").slice(0, 3);
  const publishers = countBy(filtered, "publisher").slice(0, 3);

  elements.collectionSummary.innerHTML = `
    <div><strong>${filtered.length}</strong> games match the active filters.</div>
    <div>Leading genres: ${genres.map(([value, count]) => `<strong>${escapeHtml(value)}</strong> (${count})`).join(", ")}.</div>
    <div>Top publishers: ${publishers.map(([value, count]) => `<strong>${escapeHtml(value)}</strong> (${count})`).join(", ")}.</div>
  `;
}

function renderStatsBoard(filtered) {
  const charts = [
    {
      title: "Genre Distribution",
      type: "bar",
      items: summarizeDistribution(filtered, (game) => game.primaryGenre, { limit: 10 }),
    },
    {
      title: "Top Publishers",
      type: "bar",
      items: summarizeDistribution(filtered, (game) => game.publisher || "Unknown publisher", { limit: 10 }),
    },
    {
      title: "Top Developers",
      type: "bar",
      items: summarizeDistribution(filtered, (game) => game.developer || "Unknown developer", { limit: 10 }),
    },
    {
      title: "Release Year",
      type: "bar",
      items: summarizeReleaseYears(filtered, Infinity),
    },
    {
      title: "Box Size",
      type: "pie",
      items: summarizeDistribution(filtered, (game) => game.boxSize || "Unknown", { limit: 6, unknownLast: true }),
    },
    {
      title: "Copy Protection",
      type: "pie",
      items: summarizeDistribution(filtered, (game) => game.copyProtection || "Unknown", { limit: 6, unknownLast: true }),
    },
    {
      title: "Complete Status",
      type: "pie",
      items: summarizeDistribution(filtered, (game) => game.completeStateLabel || "Unknown status", { limit: 3, unknownLast: true }),
    },
    {
      title: "Tested Status",
      type: "pie",
      items: summarizeDistribution(filtered, (game) => getTestedLabel(game.testedState), { limit: 3, unknownLast: true }),
    },
    {
      title: "WHDLoad Installed",
      type: "pie",
      items: summarizeDistribution(filtered, (game) => getWhdloadInstalledLabel(game.whdloadInstalled), { limit: 3, unknownLast: true }),
    },
  ];

  elements.statsBoard.innerHTML = charts
    .map((chart) => renderChartPanel(chart))
    .join("");
}

function summarizeReleaseYears(items, limit = 12) {
  const counts = new Map();

  for (const item of items) {
    const key = item.release ? String(item.release) : "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (left[0] === "Unknown") {
        return 1;
      }

      if (right[0] === "Unknown") {
        return -1;
      }

      return Number(left[0]) - Number(right[0]);
    })
    .slice(0, limit === Infinity ? undefined : limit);
}

function summarizeDistribution(items, getValue, options = {}) {
  const counts = new Map();
  const limit = options.limit || 5;
  const unknownLast = options.unknownLast || false;

  for (const item of items) {
    const key = cleanText(getValue(item)) || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => {
    if (unknownLast) {
      const aUnknown = isUnknownLabel(a[0]);
      const bUnknown = isUnknownLabel(b[0]);

      if (aUnknown && !bUnknown) {
        return 1;
      }

      if (!aUnknown && bUnknown) {
        return -1;
      }
    }

    return b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "sv");
  });

  if (!unknownLast) {
    return sorted.slice(0, limit);
  }

  const unknownEntries = sorted.filter(([label]) => isUnknownLabel(label));
  const knownEntries = sorted.filter(([label]) => !isUnknownLabel(label));

  if (!unknownEntries.length) {
    return knownEntries.slice(0, limit);
  }

  const visibleKnown = knownEntries.slice(0, Math.max(limit - 1, 0));
  return [...visibleKnown, unknownEntries[0]];
}

function renderChartPanel(chart) {
  const { title, items, type } = chart;
  const total = items.reduce((sum, [, count]) => sum + count, 0);

  if (!items.length || total === 0) {
    return `
      <article class="chart-panel">
        <h3>${escapeHtml(title)}</h3>
        <p class="chart-panel__empty">Not enough data in the current selection.</p>
      </article>
    `;
  }

  if (type === "bar") {
    return renderBarChartPanel(title, items, total);
  }

  return renderPieChartPanel(title, items, total);
}

function renderPieChartPanel(title, items, total) {
  let running = 0;
  const segments = items
    .map(([, count], index) => {
      const start = running;
      const slice = (count / total) * 100;
      running += slice;
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start.toFixed(2)}% ${running.toFixed(2)}%`;
    })
    .join(", ");

  return `
    <article class="chart-panel">
      <h3>${escapeHtml(title)}</h3>
      <div class="pie-chart">
        <div class="pie-chart__disc" style="--pie-fill: conic-gradient(${segments})"></div>
        <div class="chart-list">
        ${items
          .map(([label, count], index) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
              <div class="chart-row">
                <div class="chart-row__labels">
                  <span class="chart-row__label">
                    <span class="chart-row__swatch" style="background: ${CHART_COLORS[index % CHART_COLORS.length]}"></span>
                    ${escapeHtml(label)}
                  </span>
                  <span class="chart-row__value">${count} · ${percentage}%</span>
                </div>
              </div>
            `;
          })
          .join("")}
        </div>
      </div>
    </article>
  `;
}

function renderBarChartPanel(title, items, total) {
  const maxCount = Math.max(...items.map(([, count]) => count), 1);

  return `
    <article class="chart-panel">
      <h3>${escapeHtml(title)}</h3>
      <div class="bar-chart">
        ${items
          .map(([label, count], index) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const widthPercent = (count / maxCount) * 100;
            return `
              <div class="bar-chart__row">
                <div class="bar-chart__labels">
                  <span class="bar-chart__label">${escapeHtml(label)}</span>
                  <span class="bar-chart__value">${count} · ${percentage}%</span>
                </div>
                <div class="bar-chart__track">
                  <div class="bar-chart__fill" style="width: ${widthPercent}%; background: ${CHART_COLORS[index % CHART_COLORS.length]}"></div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function getTop50Games() {
  return state.games
    .filter((game) => Number.isInteger(game.top50Rank) && game.top50Rank >= 1 && game.top50Rank <= 50)
    .sort((left, right) => left.top50Rank - right.top50Rank || left.title.localeCompare(right.title, "sv"))
    .slice(0, 50);
}

function renderTop50(top50Games) {
  elements.top50Summary.innerHTML = `
    <div><strong>${top50Games.length}</strong> games are currently ranked in your Top 50 list.</div>
    <div>Use the admin editor on each game to assign positions from <strong>1</strong> to <strong>50</strong>.</div>
  `;

  if (!top50Games.length) {
    elements.top50List.innerHTML = `
      <article class="empty-state">
        <h3>No Top 50 games assigned yet</h3>
        <p>Log in as admin and add a ranking number to your favorite titles.</p>
      </article>
    `;
    return;
  }

  elements.top50List.innerHTML = top50Games
    .map((game) => `
      <article class="top50-entry">
        <div class="window-chrome">
          <span class="window-dot"></span>
          <span class="window-title">#${game.top50Rank}</span>
          <span class="window-lines" aria-hidden="true"></span>
          <span class="window-gadget window-gadget--filled"></span>
          <span class="window-gadget"></span>
        </div>
        <div class="top50-entry__body">
          <div class="top50-entry__media">
            <div class="boxart-frame top50-entry__boxart" role="button" tabindex="0" data-title="${escapeHtml(game.title)}">
              ${
                game.boxartPath
                  ? `<img class="top50-entry__image" src="${escapeHtml(game.boxartPath)}" alt="${escapeHtml(game.title)} boxart" />`
                  : `<div class="boxart-placeholder"><span class="boxart-placeholder__label">BOX ART</span><strong class="boxart-placeholder__title">${escapeHtml(game.title)}</strong></div>`
              }
            </div>
          </div>
          <div class="top50-entry__content">
            <h3>${escapeHtml(game.title)}</h3>
            <p>${escapeHtml(game.primaryGenre)} · ${escapeHtml(game.publisher)} · ${escapeHtml(String(game.release || "Unknown"))}</p>
            ${
              game.top50Comment
                ? `<blockquote class="top50-entry__comment">${escapeHtml(game.top50Comment)}</blockquote>`
                : ""
            }
            <dl class="top50-entry__meta">
              <div>
                <dt>Complete</dt>
                <dd>${escapeHtml(game.complete || "No data")}</dd>
              </div>
              <div>
                <dt>Original Edition</dt>
                <dd>${escapeHtml(game.edition.toLowerCase() === "original" ? "Yes" : "No")}</dd>
              </div>
              <div>
                <dt>Installed</dt>
                <dd>${escapeHtml(game.whdloadInstalled || "Unknown")}</dd>
              </div>
              <div>
                <dt>WHDLoad</dt>
                <dd>${escapeHtml(game.whdloadDoesNotExist.toLowerCase() === "yes" ? "No" : "Yes")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </article>
    `)
    .join("");

  elements.top50List.querySelectorAll(".top50-entry__boxart").forEach((node) => {
    node.addEventListener("click", () => {
      openDetailsModal(node.dataset.title);
    });

    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetailsModal(node.dataset.title);
      }
    });
  });
}

function renderGallery(games) {
  const galleryGames = games.filter((game) => Boolean(cleanText(game.boxartPath)));

  elements.gallerySummary.innerHTML = `
    <div><strong>${galleryGames.length}</strong> covers are visible with the active filters.</div>
    <div>Open any cover to view the full game details in the Workbench info window.</div>
  `;

  if (!galleryGames.length) {
    elements.galleryGrid.innerHTML = `
      <article class="empty-state">
        <h3>No covers matched the filters</h3>
        <p>Try broadening the filters to show more boxart in the gallery.</p>
      </article>
    `;
    return;
  }

  elements.galleryGrid.innerHTML = galleryGames
    .map(
      (game) => `
        <article class="gallery-card">
          <button class="gallery-card__button" type="button" data-gallery-title="${escapeHtml(game.title)}" aria-label="Open ${escapeHtml(game.title)} details">
            <div class="gallery-card__frame">
              ${
                game.boxartPath
                  ? `<img class="gallery-card__image" src="${escapeHtml(game.boxartPath)}" alt="${escapeHtml(game.title)} boxart" />`
                  : `<div class="gallery-card__placeholder"><span>BOX ART</span></div>`
              }
            </div>
            <span class="gallery-card__title">${escapeHtml(game.title)}</span>
            <span class="gallery-card__meta">${escapeHtml(game.publisher)} · ${escapeHtml(String(game.release || "Unknown"))}</span>
          </button>
        </article>
      `,
    )
    .join("");

  elements.galleryGrid.querySelectorAll("[data-gallery-title]").forEach((node) => {
    node.addEventListener("click", () => {
      openDetailsModal(node.dataset.galleryTitle);
    });
  });
}

function renderGamePage(title) {
  const game = state.games.find((entry) => entry.title === title);

  if (!game) {
    elements.gamePageContent.innerHTML = `
      <div class="panel-chrome panel-chrome--compact">
        <span class="window-dot"></span>
        <span class="window-title">Game Page</span>
        <span class="window-lines" aria-hidden="true"></span>
        <span class="window-gadget window-gadget--filled"></span>
        <span class="window-gadget"></span>
      </div>
      <article class="empty-state">
        <h3>Game not found</h3>
        <p>The requested game page could not be opened from this collection.</p>
      </article>
    `;
    return;
  }

  const lemonUrl = getLemonAmigaUrl(game.title);
  const holUrl = getHallOfLightUrl(game.title);

  elements.gamePageContent.innerHTML = `
    <div class="panel-chrome panel-chrome--compact">
      <span class="window-dot"></span>
      <span class="window-title">${escapeHtml(game.title)}</span>
      <span class="window-lines" aria-hidden="true"></span>
      <span class="window-gadget window-gadget--filled"></span>
      <span class="window-gadget"></span>
    </div>
    <div class="details-panel details-panel--standalone">
      <div class="details-panel__header">
        <h3 class="details-panel__title">${escapeHtml(game.title)}</h3>
        <a class="details-link" href="./">Back to collection</a>
      </div>

      <div class="details-panel__body">
        <div class="details-panel__media">
          <div class="boxart-frame boxart-frame--details">
            ${
              game.boxartPath
                ? `<img class="details-boxart-image" src="${escapeHtml(game.boxartPath)}" alt="${escapeHtml(game.title)} boxart" />`
                : `<div class="boxart-placeholder"><span class="boxart-placeholder__label">BOX ART</span><strong class="boxart-placeholder__title">${escapeHtml(game.title)}</strong></div>`
            }
          </div>
        </div>

        <div class="details-panel__content">
          <div class="details-specs">
            <p>Genre: ${escapeHtml(game.primaryGenre)}</p>
            <p>Publisher: ${escapeHtml(game.publisher)}</p>
            <p>Developer: ${escapeHtml(game.developer)}</p>
            <p>Release year: ${escapeHtml(String(game.release || "Unknown"))}</p>
            <p>Box size: ${escapeHtml(game.boxSize)}</p>
            <p>Chipset: ${escapeHtml(game.chipset)}</p>
            <p>Copy protection: ${escapeHtml(game.copyProtection)}</p>
            <p>Hall of Light Rarity: ${escapeHtml(game.holRarity)}</p>
            <p>Lemon Amiga Rating: ${escapeHtml(game.lemonRating || "Not imported")}</p>
          </div>

          <div class="details-links">
            ${
              lemonUrl
                ? `<a class="details-link" href="${escapeHtml(lemonUrl)}" target="_blank" rel="noreferrer noopener">Lemon Amiga</a>`
                : ""
            }
            ${
              holUrl
                ? `<a class="details-link" href="${escapeHtml(holUrl)}" target="_blank" rel="noreferrer noopener">Hall of Light</a>`
                : ""
            }
          </div>

          <dl class="meta-grid meta-grid--details">
            <div>
              <dt>WHDLoad</dt>
              <dd>${escapeHtml(game.whdloadDoesNotExist.toLowerCase() === "yes" ? "No" : "Yes")}</dd>
            </div>
            <div>
              <dt>Installed</dt>
              <dd>${escapeHtml(game.whdloadInstalled || "Unknown")}</dd>
            </div>
            <div>
              <dt>Complete</dt>
              <dd>${escapeHtml(game.complete || "No data")}</dd>
            </div>
            <div>
              <dt>Original Edition</dt>
              <dd>${escapeHtml(game.edition.toLowerCase() === "original" ? "Yes" : "No")}</dd>
            </div>
          </dl>

          ${buildReviewPanelMarkup(game)}

          ${
            state.isAdmin
              ? `
                <section class="review-panel">
                  <div class="review-panel__header">
                    <h4>Admin Notes</h4>
                  </div>
                  <div class="review-panel__list">
                    <div class="review-row">
                      <div class="review-row__source">Tested</div>
                      <div class="review-row__score">${escapeHtml(game.tested || "No data")}</div>
                    </div>
                    <div class="review-row">
                      <div class="review-row__source">Paid</div>
                      <div class="review-row__score">${escapeHtml(formatPaidValue(game.paid))}</div>
                    </div>
                    <div class="review-row">
                      <div class="review-row__source">Sold</div>
                      <div class="review-row__score">${escapeHtml(getSoldState(game.sold) ? "Yes" : "No")}</div>
                    </div>
                  </div>
                </section>
              `
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

function buildQualityReport(games) {
  return {
    duplicateEntries: findDuplicateEntries(games),
    missingCoreFields: findMissingCoreFields(games),
    publisherVariants: findSimilarNamePairs(games, "publisher"),
    developerVariants: findSimilarNamePairs(games, "developer"),
  };
}

function renderQualityTools(report) {
  const sections = [
    {
      title: "Duplicate Entries",
      items: report.duplicateEntries.map((entry) => ({
        text: `${entry.title} · ${entry.publisher} · ${entry.edition} · ${entry.release} · ${entry.boxSize} (${entry.count})`,
        titles: entry.titles,
        fingerprint: `duplicate:${entry.key}`,
      })),
      empty: "No likely duplicate entries found.",
    },
    {
      title: "Missing Core Fields",
      items: report.missingCoreFields.map((entry) => ({
        text: `${entry.title} · Missing: ${entry.fields.join(", ")}`,
        titles: [entry.title],
        fingerprint: `missing:${normalizeQualityName(entry.title)}:${entry.fields.join("|")}`,
      })),
      empty: "No major missing-field issues found.",
    },
    {
      title: "Publisher Variants",
      items: report.publisherVariants.map((entry) => ({
        text: `${entry.left} ↔ ${entry.right}`,
        titles: entry.titles,
        fingerprint: `publisher-variant:${normalizeQualityName(entry.left)}:${normalizeQualityName(entry.right)}`,
      })),
      empty: "No suspicious publisher spelling variants found.",
    },
    {
      title: "Developer Variants",
      items: report.developerVariants.map((entry) => ({
        text: `${entry.left} ↔ ${entry.right}`,
        titles: entry.titles,
        fingerprint: `developer-variant:${normalizeQualityName(entry.left)}:${normalizeQualityName(entry.right)}`,
      })),
      empty: "No suspicious developer spelling variants found.",
    },
  ].map((section) => ({
    ...section,
    items: section.items.filter((item) => !state.acceptedQualityFindings.includes(item.fingerprint)),
  }));

  const totalIssues = sections.reduce((sum, section) => sum + section.items.length, 0);

  elements.qualitySummary.innerHTML = `
    <div><strong>${totalIssues}</strong> data quality findings across <strong>${sections.length}</strong> checks.</div>
    <div>Duplicate Entries are based on the same title combined with publisher, edition, release year, and box size.</div>
  `;

  elements.qualityGrid.innerHTML = sections
    .map((section) => `
      <article class="quality-panel">
        <h3>${escapeHtml(section.title)}</h3>
        ${
          section.items.length
            ? `<div class="quality-list">${section.items
                .map(
                  (item) => `
                    <div class="quality-list__item">
                      <div class="quality-list__text">${escapeHtml(item.text)}</div>
                      <div class="quality-list__actions">
                        ${
                          item.titles && item.titles.length
                            ? item.titles
                                .map(
                                  (title) =>
                                    `<button class="quality-link" type="button" data-edit-title="${escapeHtml(title)}">${escapeHtml(title)}</button>`,
                                )
                                .join("")
                            : ""
                        }
                        <button class="quality-link quality-link--accept" type="button" data-accept-quality="${escapeHtml(item.fingerprint)}">Accept</button>
                      </div>
                    </div>
                  `,
                )
                .join("")}</div>`
            : `<p class="chart-panel__empty">${escapeHtml(section.empty)}</p>`
        }
      </article>
    `)
    .join("");
}

function findDuplicateEntries(games) {
  const counts = new Map();

  for (const game of games) {
    const key = [
      normalizeQualityName(game.title),
      normalizeQualityName(game.publisher),
      normalizeQualityName(game.edition),
      String(game.release || ""),
      normalizeQualityName(game.boxSize),
    ].join("::");

    if (!key.replace(/::/g, "")) {
      continue;
    }

    const existing = counts.get(key) || {
      title: game.title,
      publisher: game.publisher || "Unknown publisher",
      edition: game.edition || "Unknown",
      release: game.release || "Unknown",
      boxSize: game.boxSize || "Unknown",
      titles: [],
      count: 0,
      key,
    };

    existing.count += 1;
    existing.titles.push(game.title);
    counts.set(key, existing);
  }

  return [...counts.values()]
    .filter((entry) => entry.count > 1)
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.title.localeCompare(right.title, "sv") ||
        left.publisher.localeCompare(right.publisher, "sv"),
    );
}

function findMissingCoreFields(games) {
  const checks = [
    ["Publisher", (game) => game.publisher && game.publisher !== "Unknown publisher"],
    ["Developer", (game) => game.developer && game.developer !== "Unknown publisher"],
    ["Release", (game) => Number.isInteger(game.release)],
    ["Genre", (game) => game.primaryGenre && game.primaryGenre !== "Other"],
    ["Box Size", (game) => game.boxSize && game.boxSize !== "Unknown"],
    ["Chipset", (game) => game.chipset && game.chipset !== "Unknown"],
  ];

  return games
    .map((game) => ({
      title: game.title,
      fields: checks.filter(([, test]) => !test(game)).map(([label]) => label),
    }))
    .filter((entry) => entry.fields.length > 0)
    .sort((left, right) => right.fields.length - left.fields.length || left.title.localeCompare(right.title, "sv"))
    .slice(0, 40);
}

function findSimilarNamePairs(games, field) {
  const names = [...new Set(games.map((game) => cleanText(game[field])).filter(Boolean))];
  const findings = [];

  for (let index = 0; index < names.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < names.length; compareIndex += 1) {
      const left = names[index];
      const right = names[compareIndex];
      const leftNormalized = normalizeQualityName(left);
      const rightNormalized = normalizeQualityName(right);

      if (!leftNormalized || !rightNormalized || leftNormalized === rightNormalized) {
        continue;
      }

      const similarity = getNameSimilarity(leftNormalized, rightNormalized);

      if (similarity >= 0.82) {
        findings.push({
          left,
          right,
          similarity,
          titles: games
            .filter((game) => game[field] === left || game[field] === right)
            .map((game) => game.title)
            .filter((title, index, titles) => titles.indexOf(title) === index)
            .slice(0, 6),
        });
      }
    }
  }

  return findings
    .sort((left, right) => right.similarity - left.similarity || left.left.localeCompare(right.left, "sv"))
    .slice(0, 25);
}

function normalizeQualityName(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNameSimilarity(left, right) {
  const leftTokens = new Set(left.split(" "));
  const rightTokens = new Set(right.split(" "));
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  if (!union) {
    return 0;
  }

  return overlap / union;
}

function handleQualityGridClick(event) {
  if (!state.isAdmin) {
    return;
  }

  const acceptButton = event.target.closest("[data-accept-quality]");

  if (acceptButton) {
    acceptQualityFinding(acceptButton.dataset.acceptQuality);
    return;
  }

  const editButton = event.target.closest("[data-edit-title]");

  if (editButton) {
    openEditorModal(editButton.dataset.editTitle);
  }
}

function acceptQualityFinding(fingerprint) {
  if (!fingerprint || state.acceptedQualityFindings.includes(fingerprint)) {
    return;
  }

  state.acceptedQualityFindings.push(fingerprint);
  persistAppData();
  render();
}

function syncPageView() {
  const isCatalog = state.currentPage === "catalog";
  const isStats = state.currentPage === "stats";
  const isTop50 = state.currentPage === "top50";
  const isGallery = state.currentPage === "gallery";
  const isGame = state.currentPage === "game";
  const isQuality = state.currentPage === "quality";

  elements.catalogPage.classList.toggle("hidden", !isCatalog);
  elements.statsPage.classList.toggle("hidden", !isStats);
  elements.top50Page.classList.toggle("hidden", !isTop50);
  elements.galleryPage.classList.toggle("hidden", !isGallery);
  elements.gamePage.classList.toggle("hidden", !isGame);
  elements.qualityPage.classList.toggle("hidden", !isQuality);
  elements.catalogNav.classList.toggle("is-active", isCatalog);
  elements.statsNav.classList.toggle("is-active", isStats);
  elements.top50Nav.classList.toggle("is-active", isTop50);
  elements.galleryNav.classList.toggle("is-active", isGallery);
  elements.qualityNav.classList.toggle("is-active", isQuality);
}

function countBy(items, field) {
  const counts = new Map();

  for (const item of items) {
    const key = item[field];
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sv"));
}

function renderGrid(filtered) {
  elements.grid.innerHTML = "";
  syncViewToggle();
  elements.emptyState.classList.toggle("hidden", filtered.length !== 0);

  const fragment = document.createDocumentFragment();

  filtered.forEach((game) => {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    const image = node.querySelector(".boxart-image");
    const placeholder = node.querySelector(".boxart-placeholder");
    const editButton = node.querySelector(".card-edit-button");
    const mediaFrame = node.querySelector(".boxart-frame");

    node.querySelector(".game-card__title").textContent = game.title;
    node.querySelector(".game-card__genre").textContent = `Genre: ${game.primaryGenre}`;
    node.querySelector(".game-card__publisher").textContent = `Publisher: ${game.publisher}`;
    node.querySelector(".game-card__developer").textContent = `Developer: ${game.developer}`;
    node.querySelector(".game-card__year").textContent = `Release year: ${game.release || "Unknown"}`;
    node.querySelector(".game-card__box-size").textContent = `Box size: ${game.boxSize}`;
    node.querySelector(".game-card__chipset").textContent = `Chipset: ${game.chipset}`;
    node.querySelector(".game-card__lemon-rating").textContent = `Lemon Amiga Rating: ${game.lemonRating || "Not imported"}`;
    node.querySelector(".boxart-placeholder__title").textContent = game.title;

    node.querySelector(".meta-whdload").textContent =
      game.whdloadDoesNotExist.toLowerCase() === "yes" ? "No" : "Yes";
    node.querySelector(".meta-installed").textContent =
      game.whdloadInstalled || "Unknown";
    node.querySelector(".meta-complete").textContent = game.complete || "No data";
    node.querySelector(".meta-original").textContent =
      game.edition.toLowerCase() === "original" ? "Yes" : "No";

    mediaFrame.addEventListener("click", () => {
      openDetailsModal(game.title);
    });
    mediaFrame.setAttribute("role", "button");
    mediaFrame.setAttribute("tabindex", "0");
    mediaFrame.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetailsModal(game.title);
      }
    });

    if (state.isAdmin) {
      editButton.classList.remove("hidden");
      editButton.addEventListener("click", () => {
        openEditorModal(game.title);
      });
    }

    if (game.boxartPath) {
      const showPlaceholder = () => {
        image.classList.add("hidden");
        placeholder.classList.remove("hidden");
      };

      image.alt = `${game.title} boxart`;
      image.addEventListener("error", showPlaceholder, { once: true });
      image.classList.remove("hidden");
      image.src = game.boxartPath;
      placeholder.classList.add("hidden");
    } else {
      image.classList.add("hidden");
      placeholder.classList.remove("hidden");
    }

    fragment.append(node);
  });

  elements.grid.append(fragment);
}
function getCompleteState(value) {
  const normalized = cleanText(value).toLowerCase();
  if (!normalized) {
    return "unknown";
  }
  if (normalized.startsWith("yes")) {
    return "complete";
  }
  return "incomplete";
}

function getTestedState(value) {
  const normalized = cleanText(value).toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (normalized.startsWith("yes")) {
    if (normalized.includes("not working")) {
      return "tested-not-working";
    }

    return "tested-working";
  }

  if (normalized.startsWith("no")) {
    return "untested";
  }

  return "unknown";
}

function getTestedLabel(value) {
  if (value === "tested-working") {
    return "Working";
  }

  if (value === "tested-not-working") {
    return "Not working";
  }

  if (value === "untested") {
    return "No";
  }

  return "Unknown";
}

function getWhdloadInstalledLabel(value) {
  const normalized = cleanText(value).toLowerCase();

  if (normalized === "yes") {
    return "Installed";
  }

  if (normalized === "no") {
    return "Not installed";
  }

  return "Unknown";
}

function getSoldState(value) {
  const normalized = cleanText(value).toLowerCase();

  return normalized === "yes" || normalized === "sold" || normalized.startsWith("yes,") || normalized.startsWith("sold");
}

function isUnknownLabel(value) {
  return cleanText(value).toLowerCase().startsWith("unknown");
}

function getBoxartPath(title) {
  if (state.boxartMap[title]) {
    return state.boxartMap[title];
  }

  const slug = slugify(title);
  return `./boxart/${slug}.jpg`;
}

function getLemonRating(title) {
  return state.lemonRatingsMap[title] || "";
}

function getLemonAmigaUrl(title) {
  return cleanText(state.externalLinksMap[title]?.lemonUrl)
    || `https://www.lemonamiga.com/games/list.php?list_title=${encodeURIComponent(cleanText(title))}`;
}

function getHallOfLightUrl(title) {
  return cleanText(state.externalLinksMap[title]?.holUrl);
}

function getGamePageUrl(title) {
  const url = new URL(window.location.href);
  url.searchParams.set("game", cleanText(title));
  return `${url.pathname}${url.search}`;
}

function getRouteGameTitle() {
  const url = new URL(window.location.href);
  return cleanText(url.searchParams.get("game"));
}

function applyRouteFromLocation() {
  const routeGameTitle = getRouteGameTitle();

  if (routeGameTitle && state.games.some((game) => game.title === routeGameTitle)) {
    state.currentPage = "game";
    return;
  }

  if (state.currentPage === "game") {
    state.currentPage = "catalog";
  }
}

function clearGameRoute() {
  const url = new URL(window.location.href);

  if (!url.searchParams.has("game")) {
    return;
  }

  url.searchParams.delete("game");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function openAuthModal() {
  elements.authModal.classList.remove("hidden");
  elements.authModal.setAttribute("aria-hidden", "false");
  elements.authPassword.value = "";
  elements.authError.classList.add("hidden");
  elements.authPassword.focus();
}

function closeAuthModal() {
  elements.authModal.classList.add("hidden");
  elements.authModal.setAttribute("aria-hidden", "true");
}

function handleLoginSubmit(event) {
  event.preventDefault();

  if (elements.authPassword.value !== ADMIN_PASSWORD) {
    elements.authError.classList.remove("hidden");
    return;
  }

  state.isAdmin = true;
  window.localStorage.setItem("amiga-admin-session", "true");
  closeAuthModal();
  syncAdminUi();
  render();
}

function logoutAdmin() {
  state.isAdmin = false;
  window.localStorage.removeItem("amiga-admin-session");
  syncAdminUi();
  closeEditorModal();
  render();
}

function syncAdminUi() {
  elements.authToggleLabel.textContent = state.isAdmin ? "Admin Logout" : "Admin Login";
  elements.adminFilterGroup.classList.toggle("hidden", !state.isAdmin);
  elements.detailsAdminPanel.classList.toggle("hidden", !state.isAdmin);
  elements.addGameButton.classList.toggle("hidden", !state.isAdmin);
  elements.exportCsvButton.classList.toggle("hidden", !state.isAdmin);
  elements.exportBackupButton.classList.toggle("hidden", !state.isAdmin);
  elements.importBackupButton.classList.toggle("hidden", !state.isAdmin);
  elements.qualityNav.classList.toggle("hidden", !state.isAdmin);

  if (!state.isAdmin && state.currentPage === "quality") {
    state.currentPage = "catalog";
  }
}

function openEditorModal(title) {
  const game = state.games.find((entry) => entry.title === title);

  if (!game) {
    return;
  }

  state.creatingGame = false;
  state.editingTitle = title;
  state.editingSourceTitle = title;
  state.editingCustom = game.isCustom === true;
  elements.editorTitle.textContent = title;
  elements.editorTitleInput.value = game.title;
  elements.editorTitleInput.disabled = !state.editingCustom;
  elements.editorBoxartPath.value = game.boxartPath || "";
  elements.editorGenre.value = game.primaryGenre === "Other" ? "" : game.primaryGenre;
  elements.editorPublisher.value = game.publisher === "Unknown publisher" ? "" : game.publisher;
  elements.editorDeveloper.value = game.developer === game.publisher ? game.developer : game.developer;
  elements.editorRelease.value = game.release || "";
  elements.editorBoxSize.value = game.boxSize === "Unknown" ? "" : game.boxSize;
  elements.editorChipset.value = game.chipset === "Unknown" ? "" : game.chipset;
  elements.editorLemonRating.value = game.lemonRating || "";
  elements.editorWhdloadInstalled.value = game.whdloadInstalled || "";
  elements.editorComplete.value = normalizeCompleteSelect(game.complete);
  elements.editorEdition.value = game.edition === "Unknown" ? "" : game.edition;
  elements.editorHolRarity.value = game.holRarity === "Unknown" ? "" : game.holRarity;
  elements.editorTop50Rank.value = game.top50Rank || "";
  elements.editorSold.value = getSoldState(game.sold) ? "Yes" : "";
  elements.editorTop50Comment.value = game.top50Comment || "";
  updateEditorBoxartPreview(game.title, game.boxartPath);
  elements.editorModal.classList.remove("hidden");
  elements.editorModal.setAttribute("aria-hidden", "false");
}

function openCreateGameModal() {
  state.creatingGame = true;
  state.editingCustom = true;
  state.editingTitle = "";
  state.editingSourceTitle = "";
  elements.editorTitle.textContent = "Add New Game";
  elements.editorTitleInput.value = "";
  elements.editorTitleInput.disabled = false;
  elements.editorBoxartPath.value = "";
  elements.editorGenre.value = "";
  elements.editorPublisher.value = "";
  elements.editorDeveloper.value = "";
  elements.editorRelease.value = "";
  elements.editorBoxSize.value = "";
  elements.editorChipset.value = "";
  elements.editorLemonRating.value = "";
  elements.editorWhdloadInstalled.value = "";
  elements.editorComplete.value = "";
  elements.editorEdition.value = "";
  elements.editorHolRarity.value = "";
  elements.editorTop50Rank.value = "";
  elements.editorSold.value = "";
  elements.editorTop50Comment.value = "";
  updateEditorBoxartPreview("", "");
  elements.editorModal.classList.remove("hidden");
  elements.editorModal.setAttribute("aria-hidden", "false");
}

function closeEditorModal() {
  state.editingTitle = "";
  state.editingSourceTitle = "";
  state.editingCustom = false;
  state.creatingGame = false;
  elements.editorModal.classList.add("hidden");
  elements.editorModal.setAttribute("aria-hidden", "true");
}

function openDetailsModal(title) {
  const game = state.games.find((entry) => entry.title === title);

  if (!game) {
    return;
  }

  state.detailsTitle = title;
  elements.detailsTitle.textContent = game.title;
  elements.detailsGenre.textContent = `Genre: ${game.primaryGenre}`;
  elements.detailsPublisher.textContent = `Publisher: ${game.publisher}`;
  elements.detailsDeveloper.textContent = `Developer: ${game.developer}`;
  elements.detailsYear.textContent = `Release year: ${game.release || "Unknown"}`;
  elements.detailsBoxSize.textContent = `Box size: ${game.boxSize}`;
  elements.detailsChipset.textContent = `Chipset: ${game.chipset}`;
  elements.detailsCopyProtection.textContent = `Copy protection: ${game.copyProtection}`;
  elements.detailsHolRarity.textContent = `Hall of Light Rarity: ${game.holRarity}`;
  elements.detailsLemonRating.textContent = `Lemon Amiga Rating: ${game.lemonRating || "Not imported"}`;
  const lemonUrl = getLemonAmigaUrl(game.title);
  const holUrl = getHallOfLightUrl(game.title);
  elements.detailsGameLink.href = getGamePageUrl(game.title);
  elements.detailsLemonLink.href = lemonUrl;
  elements.detailsHolLink.href = holUrl || "#";
  elements.detailsGameLink.classList.remove("hidden");
  elements.detailsLemonLink.classList.toggle("hidden", !lemonUrl);
  elements.detailsHolLink.classList.toggle("hidden", !holUrl);
  elements.detailsWhdload.textContent =
    game.whdloadDoesNotExist.toLowerCase() === "yes" ? "No" : "Yes";
  elements.detailsInstalled.textContent = game.whdloadInstalled || "Unknown";
  elements.detailsComplete.textContent = game.complete || "No data";
  elements.detailsOriginal.textContent = game.edition.toLowerCase() === "original" ? "Yes" : "No";
  elements.detailsTested.textContent = game.tested || "No data";
  elements.detailsPaid.textContent = formatPaidValue(game.paid);
  elements.detailsSold.textContent = getSoldState(game.sold) ? "Yes" : "No";
  elements.detailsBoxartTitle.textContent = game.title;
  renderReviewPanel(game.title);

  if (game.boxartPath) {
    const image = elements.detailsBoxartImage;
    const placeholder = elements.detailsBoxartPlaceholder;
    const showPlaceholder = () => {
      image.classList.add("hidden");
      placeholder.classList.remove("hidden");
    };

    image.alt = `${game.title} boxart`;
    image.onerror = showPlaceholder;
    image.classList.remove("hidden");
    image.src = game.boxartPath;
    placeholder.classList.add("hidden");
  } else {
    elements.detailsBoxartImage.classList.add("hidden");
    elements.detailsBoxartPlaceholder.classList.remove("hidden");
  }

  elements.detailsModal.classList.remove("hidden");
  elements.detailsModal.setAttribute("aria-hidden", "false");
}

function closeDetailsModal() {
  state.detailsTitle = "";
  elements.detailsModal.classList.add("hidden");
  elements.detailsModal.setAttribute("aria-hidden", "true");
}

function buildReviewPanelMarkup(game) {
  const reviewData = state.reviewsMap[game.title];

  if (!reviewData || !Array.isArray(reviewData.reviews) || reviewData.reviews.length === 0) {
    return `
      <section class="review-panel">
        <div class="review-panel__header">
          <h4>OpenRetro Magazine Reviews</h4>
          <strong>No review data</strong>
        </div>
        <div class="review-panel__list">
          <p class="review-panel__empty">No imported magazine scores yet for this title.</p>
        </div>
      </section>
    `;
  }

  const average =
    reviewData.averagePercent !== undefined && reviewData.averagePercent !== null && reviewData.averagePercent !== ""
      ? Number.parseFloat(reviewData.averagePercent)
      : calculateReviewAverage(reviewData.reviews);

  const averageLabel = Number.isNaN(average) ? "No review data" : `Average ${average.toFixed(1)}%`;

  return `
    <section class="review-panel">
      <div class="review-panel__header">
        <h4>OpenRetro Magazine Reviews</h4>
        <strong>${escapeHtml(averageLabel)}</strong>
      </div>
      <div class="review-panel__list">
        ${reviewData.reviews
          .map((review) => {
            const labelParts = [review.magazine, review.issue, review.year].filter(Boolean);
            return `
              <div class="review-row">
                <div class="review-row__source">${escapeHtml(labelParts.join(" · "))}</div>
                <div class="review-row__score">${escapeHtml(String(review.score))}%</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderReviewPanel(title) {
  const reviewData = state.reviewsMap[title];

  if (!reviewData || !Array.isArray(reviewData.reviews) || reviewData.reviews.length === 0) {
    elements.detailsReviewAverage.textContent = "No review data";
    elements.detailsReviewList.innerHTML = `
      <p class="review-panel__empty">No imported magazine scores yet for this title.</p>
    `;
    return;
  }

  const average =
    reviewData.averagePercent !== undefined && reviewData.averagePercent !== null && reviewData.averagePercent !== ""
      ? Number.parseFloat(reviewData.averagePercent)
      : calculateReviewAverage(reviewData.reviews);

  elements.detailsReviewAverage.textContent = Number.isNaN(average)
    ? "No review data"
    : `Average ${average.toFixed(1)}%`;

  elements.detailsReviewList.innerHTML = reviewData.reviews
    .map((review) => {
      const labelParts = [review.magazine, review.issue, review.year].filter(Boolean);
      return `
        <div class="review-row">
          <div class="review-row__source">${escapeHtml(labelParts.join(" · "))}</div>
          <div class="review-row__score">${escapeHtml(String(review.score))}%</div>
        </div>
      `;
    })
    .join("");
}

function calculateReviewAverage(reviews) {
  const scores = reviews
    .map((review) => Number.parseFloat(review.score))
    .filter((score) => !Number.isNaN(score));

  if (!scores.length) {
    return Number.NaN;
  }

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function handleEditorSubmit(event) {
  event.preventDefault();

  if (!state.editingTitle && !state.creatingGame) {
    return;
  }

  const nextTitle = cleanText(elements.editorTitleInput.value);

  if (!nextTitle) {
    elements.editorTitleInput.focus();
    return;
  }

  const currentGame = state.games.find((game) => game.title === state.editingTitle);

  const override = {
    title: nextTitle,
    primaryGenre: cleanText(elements.editorGenre.value) || "Other",
    genreOverride: cleanText(elements.editorGenre.value),
    publisher: cleanText(elements.editorPublisher.value) || "Unknown publisher",
    developer: cleanText(elements.editorDeveloper.value) || cleanText(elements.editorPublisher.value) || "Unknown publisher",
    release: cleanText(elements.editorRelease.value),
    boxSize: cleanText(elements.editorBoxSize.value) || "Unknown",
    chipset: cleanText(elements.editorChipset.value) || "Unknown",
    lemonRating: cleanText(elements.editorLemonRating.value),
    boxartPath: cleanText(elements.editorBoxartPath.value),
    whdloadInstalled: cleanText(elements.editorWhdloadInstalled.value),
    complete: normalizeCompleteValue(elements.editorComplete.value),
    edition: cleanText(elements.editorEdition.value) || "Unknown",
    holRarity: cleanText(elements.editorHolRarity.value) || "Unknown",
    top50Rank: cleanText(elements.editorTop50Rank.value),
    sold: cleanText(elements.editorSold.value),
    top50Comment: cleanText(elements.editorTop50Comment.value),
  };

  const collectionRecord = {
    ...buildCollectionRecord(currentGame || {}),
    title: nextTitle,
    platform: currentGame?.platform || "Amiga",
    publisher: override.publisher,
    developer: override.developer,
    release: override.release,
    genre: override.genreOverride ? splitMultiValue(override.genreOverride) : [override.primaryGenre],
    boxSize: override.boxSize,
    chipset: override.chipset,
    complete: override.complete,
    edition: override.edition,
    whdloadInstalled: override.whdloadInstalled,
    whdloadDoesNotExist: currentGame?.whdloadDoesNotExist || "",
    tested: currentGame?.tested || "",
    copyProtection: currentGame?.copyProtection || "",
    paid: currentGame?.paid || "",
    sold: override.sold,
    holRarity: override.holRarity,
    top50Rank: override.top50Rank,
    top50Comment: override.top50Comment,
    lemonRating: override.lemonRating,
    boxartPath: override.boxartPath,
    isCustom: currentGame?.isCustom === true || state.creatingGame || state.editingCustom,
  };

  upsertRawGame(collectionRecord, state.editingTitle);
  persistAppData();
  reapplyGames();
  closeEditorModal();
}

function reapplyGames() {
  state.games = state.rawGames.map(cloneGame);
  hydrateFilters();
  render();
}

function persistAppData() {
  const payload = buildCollectionDataPayload();

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
  window.localStorage.setItem(APP_STORAGE_BACKUP_KEY, JSON.stringify(payload));
}

function exportCollectionCsv() {
  if (!state.isAdmin) {
    return;
  }

  const rows = state.games
    .slice()
    .sort((left, right) => left.title.localeCompare(right.title, "sv"))
    .map((game) => ({
      Title: game.title,
      Platform: game.platform || "Amiga",
      Chipset: game.chipset || "",
      Edition: game.edition || "",
      Release: game.release || "",
      Publisher: game.publisher || "",
      Developer: game.developer || "",
      "Box Size": game.boxSize || "",
      Genre: game.genres?.join(", ") || game.primaryGenre || "",
      "WHDload Installed": game.whdloadInstalled || "",
      "WHDload does not exist": game.whdloadDoesNotExist || "",
      Tested: game.tested || "",
      Complete: game.complete || "",
      "Copy Protection": game.copyProtection || "",
      Paid: formatPaidValueForExport(game.paid),
      Sold: game.sold || "",
      "Hall of Light Rarity": game.holRarity || "",
      "Top 50 Rank": game.top50Rank || "",
      "Top 50 Comment": game.top50Comment || "",
      "Lemon Rating": game.lemonRating || "",
    }));

  const csv = convertRowsToCsv(rows);
  downloadFile(`daddy-cools-amiga-games-${getTimestampSlug()}.csv`, csv, "text/csv;charset=utf-8");
}

function exportBackupJson() {
  if (!state.isAdmin) {
    return;
  }

  const payload = buildCollectionDataPayload();

  downloadFile(
    "games.json",
    `${JSON.stringify(payload, null, 2)}\n`,
    "application/json;charset=utf-8",
  );
}

async function handleImportBackupFile(event) {
  if (!state.isAdmin) {
    return;
  }

  const [file] = event.target.files || [];
  elements.importBackupInput.value = "";

  if (!file) {
    return;
  }

  try {
    const rawText = await file.text();
    const payload = JSON.parse(rawText);

    if (!isValidCollectionData(payload) && !isValidImportBackup(payload)) {
      window.alert("The selected JSON file is not valid for this collection.");
      return;
    }

    const shouldImport = window.confirm(
      "Importing this games file will replace the current collection data in the browser. Do you want to continue?",
    );

    if (!shouldImport) {
      return;
    }

    if (isValidCollectionData(payload)) {
      state.rawGames = payload.collection.map(normalizeStoredGame);
      state.baseGames = state.rawGames.map(cloneGame);
      state.acceptedQualityFindings = Array.isArray(payload.acceptedQualityFindings) ? payload.acceptedQualityFindings : [];
      state.wishlist = Array.isArray(payload.wishlist) ? payload.wishlist.map((item) => cleanText(item)).filter(Boolean) : [];
      persistAppData();
      reapplyGames();
      window.alert("Collection data imported successfully.");
      return;
    }

    state.acceptedQualityFindings = Array.isArray(payload.acceptedQualityFindings) ? payload.acceptedQualityFindings : [];
    state.wishlist = [];
    state.rawGames = buildCollectionFromLegacyAdminData(state.baseGames, payload).map(normalizeStoredGame);
    persistAppData();
    reapplyGames();
    window.alert("Legacy admin data imported successfully.");
  } catch (error) {
    console.error(error);
    window.alert("The JSON file could not be imported.");
  }
}

function buildCollectionDataPayload() {
  return {
    version: APP_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    acceptedQualityFindings: state.acceptedQualityFindings,
    wishlist: [...new Set(state.wishlist.map((item) => cleanText(item)).filter(Boolean))],
    collection: state.rawGames.map(buildCollectionRecord),
  };
}

function buildCollectionRecord(game) {
  return {
    title: game.title,
    platform: game.platform,
    publisher: game.publisher,
    developer: game.developer,
    release: game.release,
    genre: game.genres,
    boxSize: game.boxSize,
    chipset: game.chipset,
    complete: game.complete,
    edition: game.edition,
    whdloadInstalled: game.whdloadInstalled,
    whdloadDoesNotExist: game.whdloadDoesNotExist,
    tested: game.tested,
    copyProtection: game.copyProtection,
    paid: game.paid,
    sold: game.sold,
    holRarity: game.holRarity,
    top50Rank: game.top50Rank,
    top50Comment: game.top50Comment,
    lemonRating: game.lemonRating,
    boxartPath: game.boxartPath,
    isCustom: game.isCustom === true,
  };
}

function normalizeCompleteSelect(value) {
  const normalized = cleanText(value).toLowerCase();
  if (normalized.startsWith("yes")) {
    return "Yes";
  }
  if (normalized.startsWith("no")) {
    return "No";
  }
  return "";
}

function normalizeCompleteValue(value) {
  if (value === "Yes") {
    return "Yes";
  }
  if (value === "No") {
    return "No";
  }
  return "";
}

function updateRatingRangeValue() {
  elements.ratingRangeValue.textContent = `${formatRatingValue(state.filters.ratingMin)} - ${formatRatingValue(state.filters.ratingMax)}`;
  updateRatingRangeUi();
}

function formatRatingValue(value) {
  return Number(value).toFixed(1);
}

function updateRatingRangeUi() {
  const minPercent = (state.filters.ratingMin / 10) * 100;
  const maxPercent = (state.filters.ratingMax / 10) * 100;

  elements.ratingRange.style.setProperty("--range-min", `${minPercent}%`);
  elements.ratingRange.style.setProperty("--range-max", `${maxPercent}%`);
}

function slugify(value) {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadAppDataStore() {
  const primary = readJsonFromStorage(APP_STORAGE_KEY);

  if (isValidAppDataStore(primary)) {
    return primary;
  }

  const backup = readJsonFromStorage(APP_STORAGE_BACKUP_KEY);

  if (isValidAppDataStore(backup)) {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(backup));
    return backup;
  }

  const migrated = {
    version: APP_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    collection: [],
    acceptedQualityFindings: [],
    wishlist: [],
  };

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated));
  window.localStorage.setItem(APP_STORAGE_BACKUP_KEY, JSON.stringify(migrated));
  return migrated;
}

function readJsonFromStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function isValidCollectionData(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.collection) &&
      (!("wishlist" in value) || Array.isArray(value.wishlist)) &&
      value.collection.every((entry) => entry && typeof entry === "object" && typeof cleanText(entry.title || entry.Title) === "string"),
  );
}

function isValidAppDataStore(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.collection) &&
      Array.isArray(value.acceptedQualityFindings) &&
      Array.isArray(value.wishlist || []) &&
      value.collection.every((entry) => entry && typeof entry === "object"),
  );
}

function isValidImportBackup(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (!Array.isArray(value.customGames) || !value.gameOverrides || typeof value.gameOverrides !== "object") {
    return false;
  }

  return value.customGames.every(
    (entry) => entry && typeof entry === "object" && typeof cleanText(entry.Title || entry.title) === "string",
  );
}

function selectPreferredCollectionPayload(filePayload, localPayload) {
  if (!isValidCollectionData(localPayload) || !localPayload.collection.length) {
    return filePayload;
  }

  const fileTime = Date.parse(filePayload.savedAt || "");
  const localTime = Date.parse(localPayload.savedAt || "");

  if (Number.isFinite(localTime) && (!Number.isFinite(fileTime) || localTime > fileTime)) {
    return {
      ...localPayload,
      acceptedQualityFindings: mergeAcceptedQualityFindings(
        filePayload.acceptedQualityFindings,
        localPayload.acceptedQualityFindings,
      ),
      wishlist: mergeWishlist(filePayload.wishlist, localPayload.wishlist),
    };
  }

  return filePayload;
}

function mergeWishlist(...lists) {
  return [...new Set(lists.flatMap((list) => (Array.isArray(list) ? list : [])).map((item) => cleanText(item)).filter(Boolean))];
}

function mergeAcceptedQualityFindings(...lists) {
  return [...new Set(lists.flatMap((list) => (Array.isArray(list) ? list : [])))];
}

function cloneGame(game) {
  return {
    ...game,
    genres: Array.isArray(game.genres) ? [...game.genres] : [],
  };
}

function upsertRawGame(record, previousTitle = "") {
  const normalizedRecord = normalizeStoredGame(record);
  const targetTitle = cleanText(previousTitle || normalizedRecord.title);
  const index = state.rawGames.findIndex((game) => game.title === targetTitle);

  if (index >= 0) {
    state.rawGames[index] = normalizedRecord;
  } else {
    state.rawGames.push(normalizedRecord);
  }
}

function buildCollectionFromLegacyAdminData(baseGames, payload) {
  const gamesByTitle = new Map(baseGames.map((game) => [game.title, cloneGame(game)]));

  for (const customGame of Array.isArray(payload.customGames) ? payload.customGames : []) {
    const normalizedCustomGame = normalizeGame({ ...customGame, __custom: true });
    gamesByTitle.set(normalizedCustomGame.title, normalizedCustomGame);
  }

  for (const [title, override] of Object.entries(payload.gameOverrides || {})) {
    const current = gamesByTitle.get(title);

    if (!current) {
      continue;
    }

    const merged = normalizeStoredGame({
      ...buildCollectionRecord(current),
      title: override.title || current.title,
      publisher: override.publisher ?? current.publisher,
      developer: override.developer ?? current.developer,
      release: override.release ?? current.release,
      genre: override.genreOverride || override.primaryGenre || current.genres,
      boxSize: override.boxSize ?? current.boxSize,
      chipset: override.chipset ?? current.chipset,
      lemonRating: override.lemonRating ?? current.lemonRating,
      whdloadInstalled: override.whdloadInstalled ?? current.whdloadInstalled,
      complete: override.complete ?? current.complete,
      edition: override.edition ?? current.edition,
      holRarity: override.holRarity ?? current.holRarity,
      top50Rank: override.top50Rank ?? current.top50Rank,
      top50Comment: override.top50Comment ?? current.top50Comment,
      sold: override.sold ?? current.sold,
      boxartPath: override.boxartPath ?? current.boxartPath,
    });

    gamesByTitle.delete(title);
    gamesByTitle.set(merged.title, merged);
  }

  return [...gamesByTitle.values()].map(buildCollectionRecord);
}

function convertRowsToCsv(rows) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map((header) => escapeCsvValue(header)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? "")).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

function escapeCsvValue(value) {
  const stringValue = String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getTimestampSlug() {
  return new Date().toISOString().replaceAll(":", "-").replace(/\..+$/, "");
}

function formatPaidValueForExport(value) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return "";
  }

  const match = cleaned.match(/[0-9]+(?:[.,][0-9]+)?/);
  return match ? `${match[0].replace(",", ".")} SEK` : "";
}

function updateEditorBoxartPreview(title, path) {
  const nextTitle = cleanText(title) || "Untitled";
  const nextPath = cleanText(path);
  const image = elements.editorBoxartImage;
  const placeholder = elements.editorBoxartPlaceholder;

  elements.editorBoxartTitle.textContent = nextTitle;

  if (!nextPath) {
    image.classList.add("hidden");
    placeholder.classList.remove("hidden");
    image.removeAttribute("src");
    return;
  }

  image.alt = `${nextTitle} boxart`;
  image.onerror = () => {
    image.classList.add("hidden");
    placeholder.classList.remove("hidden");
  };
  image.classList.remove("hidden");
  image.src = nextPath;
  placeholder.classList.add("hidden");
}

function handleEditorBoxartFileSelect(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  loadEditorBoxartFile(file);
}

function handleEditorBoxartDragOver(event) {
  event.preventDefault();
  elements.editorBoxartDropzone.classList.add("is-dragover");
}

function handleEditorBoxartDragLeave(event) {
  event.preventDefault();
  elements.editorBoxartDropzone.classList.remove("is-dragover");
}

function handleEditorBoxartDrop(event) {
  event.preventDefault();
  elements.editorBoxartDropzone.classList.remove("is-dragover");

  const [file] = event.dataTransfer?.files || [];
  if (!file) {
    return;
  }

  loadEditorBoxartFile(file);
}

function loadEditorBoxartFile(file) {
  if (!file.type.startsWith("image/")) {
    window.alert("Please choose an image file for boxart.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    elements.editorBoxartPath.value = result;
    updateEditorBoxartPreview(elements.editorTitleInput.value, result);
  };
  reader.readAsDataURL(file);
}
