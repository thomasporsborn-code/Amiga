const ADMIN_PASSWORD = "amiga";
const CHART_COLORS = ["#0058ac", "#2d82d4", "#67a9e4", "#90c2ef", "#f29f3f", "#e55c57", "#7fb069"];
const APP_STORAGE_KEY = "amiga-data-store";
const APP_STORAGE_BACKUP_KEY = "amiga-data-store-backup";
const APP_STORAGE_VERSION = 1;
const ADMIN_DATA_URL = "./admin-data.json";

const persistedData = loadAppDataStore();

const state = {
  rawGames: [],
  games: [],
  filteredGames: [],
  boxartMap: {},
  lemonRatingsMap: {},
  reviewsMap: {},
  customGames: persistedData.customGames,
  gameOverrides: persistedData.gameOverrides,
  acceptedQualityFindings: persistedData.acceptedQualityFindings,
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
  catalogNav: document.querySelector("#catalog-nav"),
  statsNav: document.querySelector("#stats-nav"),
  top50Nav: document.querySelector("#top50-nav"),
  qualityNav: document.querySelector("#quality-nav"),
  catalogPage: document.querySelector("#catalog-page"),
  statsPage: document.querySelector("#stats-page"),
  top50Page: document.querySelector("#top50-page"),
  qualityPage: document.querySelector("#quality-page"),
  authModal: document.querySelector("#auth-modal"),
  authForm: document.querySelector("#auth-form"),
  authPassword: document.querySelector("#auth-password"),
  authError: document.querySelector("#auth-error"),
  authCancel: document.querySelector("#auth-cancel"),
  editorModal: document.querySelector("#editor-modal"),
  editorForm: document.querySelector("#editor-form"),
  editorCancel: document.querySelector("#editor-cancel"),
  editorReset: document.querySelector("#editor-reset"),
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
  collectionSummary: document.querySelector("#collection-summary"),
  statsBoard: document.querySelector("#stats-board"),
  top50Summary: document.querySelector("#top50-summary"),
  top50List: document.querySelector("#top50-list"),
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
    await loadAdminDataFile();
    const csvText = await fetchTextWithRetry("./games.csv");
    state.rawGames = [...parseCsv(csvText), ...state.customGames.map(serializeCustomGame)].map(normalizeGame);
    state.games = state.rawGames.map((game) => applyOverrideToGame(game));
    loadBoxartMap();
    loadLemonRatingsMap();
    loadReviewsMap();
    hydrateFilters();
    render();
  } catch (error) {
    elements.collectionSummary.innerHTML = `
      <strong>The CSV file could not be loaded automatically.</strong>
      <span>Open the page through a simple local web server so the filters can work properly, for example with <code>python3 -m http.server</code> in the project folder.</span>
    `;
    console.error(error);
  }
}

async function loadBoxartMap() {
  try {
    const response = await fetchTextWithRetry("./boxart-map.json");
    state.boxartMap = JSON.parse(response);
    state.rawGames = state.rawGames.map((game) => ({
      ...game,
      boxartPath: getBoxartPath(game.title),
    }));
    state.games = state.rawGames.map((game) => applyOverrideToGame(game));
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
      lemonRating: getLemonRating(game.title),
    }));
    state.games = state.rawGames.map((game) => applyOverrideToGame(game));
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

function bindEvents() {
  elements.catalogNav.addEventListener("click", () => {
    state.currentPage = "catalog";
    syncPageView();
  });

  elements.statsNav.addEventListener("click", () => {
    state.currentPage = "stats";
    syncPageView();
  });

  elements.top50Nav.addEventListener("click", () => {
    state.currentPage = "top50";
    syncPageView();
  });

  elements.qualityNav.addEventListener("click", () => {
    state.currentPage = "quality";
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
  elements.editorReset.addEventListener("click", resetEditedGame);
  elements.addGameButton.addEventListener("click", openCreateGameModal);
  elements.exportCsvButton.addEventListener("click", exportCollectionCsv);
  elements.exportBackupButton.addEventListener("click", exportBackupJson);
  elements.importBackupButton.addEventListener("click", () => {
    elements.importBackupInput.click();
  });
  elements.importBackupInput.addEventListener("change", handleImportBackupFile);
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

  return applyOverrideToGame(baseGame);
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

function serializeCustomGame(entry) {
  return {
    Title: cleanText(entry.Title || entry.title),
    Platform: cleanText(entry.Platform || entry.platform) || "Amiga",
    Developer: cleanText(entry.Developer || entry.developer),
    Chipset: cleanText(entry.Chipset || entry.chipset),
    Edition: cleanText(entry.Edition || entry.edition),
    Release: cleanText(entry.Release || entry.release),
    Publisher: cleanText(entry.Publisher || entry.publisher),
    "Box Size": cleanText(entry["Box Size"] || entry.boxSize),
    Genre: cleanText(entry.Genre || entry.genreOverride || entry.primaryGenre),
    "WHDload Installed": cleanText(entry["WHDload Installed"] || entry.whdloadInstalled),
    "WHDload does not exist": cleanText(entry["WHDload does not exist"] || entry.whdloadDoesNotExist),
    Tested: cleanText(entry.Tested || entry.tested),
    Complete: cleanText(entry.Complete || entry.complete),
    "Copy Protection": cleanText(entry["Copy Protection"] || entry.copyProtection),
    Paid: cleanText(entry.Paid || entry.paid),
    Sold: cleanText(entry.Sold || entry.sold),
    "Top 50 Comment": cleanText(entry["Top 50 Comment"] || entry.top50Comment),
    boxartPath: cleanText(entry.boxartPath),
    __custom: true,
  };
}

function saveCustomGame(override) {
  const record = serializeCustomGame({
    Title: override.title,
    Release: override.release,
    Publisher: override.publisher,
    Developer: override.developer,
    Genre: override.genreOverride || override.primaryGenre,
    "Box Size": override.boxSize,
    Chipset: override.chipset,
    Edition: override.edition,
    "WHDload Installed": override.whdloadInstalled,
    Complete: override.complete,
    Sold: override.sold,
    "Top 50 Comment": override.top50Comment,
    boxartPath: override.boxartPath,
  });

  const existingIndex = state.customGames.findIndex((game) => game.Title === state.editingSourceTitle);

  if (existingIndex >= 0) {
    state.customGames[existingIndex] = record;
  } else {
    state.customGames.push(record);
  }

  persistAppData();

  const nonPersistentFields = {
    holRarity: override.holRarity,
    top50Rank: override.top50Rank,
    top50Comment: override.top50Comment,
    sold: override.sold,
    lemonRating: override.lemonRating,
  };

  state.gameOverrides[record.Title] = {
    primaryGenre: override.primaryGenre,
    genreOverride: override.genreOverride,
    publisher: override.publisher,
    developer: override.developer,
    release: override.release,
    boxSize: override.boxSize,
    chipset: override.chipset,
    lemonRating: override.lemonRating,
    whdloadInstalled: override.whdloadInstalled,
    complete: override.complete,
    edition: override.edition,
    holRarity: nonPersistentFields.holRarity,
    top50Rank: nonPersistentFields.top50Rank,
    top50Comment: nonPersistentFields.top50Comment,
    sold: nonPersistentFields.sold,
    boxartPath: override.boxartPath,
  };

  if (state.editingSourceTitle && state.editingSourceTitle !== record.Title) {
    delete state.gameOverrides[state.editingSourceTitle];
  }

  persistAppData();
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

  state.filteredGames = filtered;

  renderHeroStats(state.games);
  renderCollectionSummary(filtered);
  renderStatsBoard(state.games);
  renderGrid(filtered);
  renderTop50(top50Games);
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

  elements.heroStats.innerHTML = `
    <div class="stat-chip">
      <span class="stat-chip__icon" aria-hidden="true">T</span>
      <span class="stat-chip__text"><strong>${games.length}</strong><span>Titles</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__icon" aria-hidden="true">P</span>
      <span class="stat-chip__text"><strong>${publisherCount}</strong><span>Publishers</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__icon" aria-hidden="true">D</span>
      <span class="stat-chip__text"><strong>${developerCount}</strong><span>Developers</span></span>
    </div>
    <div class="stat-chip">
      <span class="stat-chip__icon" aria-hidden="true">O</span>
      <span class="stat-chip__text"><strong>${originalEditionCount}</strong><span>Original Editions</span></span>
    </div>
  `;
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
  const isQuality = state.currentPage === "quality";

  elements.catalogPage.classList.toggle("hidden", !isCatalog);
  elements.statsPage.classList.toggle("hidden", !isStats);
  elements.top50Page.classList.toggle("hidden", !isTop50);
  elements.qualityPage.classList.toggle("hidden", !isQuality);
  elements.catalogNav.classList.toggle("is-active", isCatalog);
  elements.statsNav.classList.toggle("is-active", isStats);
  elements.top50Nav.classList.toggle("is-active", isTop50);
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

function applyOverrideToGame(game) {
  const override = state.gameOverrides[game.title];

  if (!override) {
    return game;
  }

  const merged = {
    ...game,
    ...override,
  };

  const normalizedGenres = splitMultiValue(merged.genreOverride || merged.primaryGenre || merged.genres?.join(", "));

  if (override.primaryGenre || override.genreOverride) {
    merged.genres = normalizedGenres.length ? normalizedGenres : game.genres;
    merged.primaryGenre = normalizedGenres[0] || game.primaryGenre;
  }

  if (override.release !== undefined) {
    const releaseYear = Number.parseInt(String(override.release), 10);
    merged.release = Number.isNaN(releaseYear) ? null : releaseYear;
  }

  if (override.complete !== undefined) {
    merged.completeState = getCompleteState(merged.complete);
    merged.completeStateLabel =
      merged.completeState === "complete"
        ? "Complete"
        : merged.completeState === "incomplete"
          ? "Incomplete"
          : "Unknown status";
  }

  if (override.holRarity !== undefined) {
    merged.holRarity = cleanText(merged.holRarity) || "Unknown";
  }

  if (override.top50Rank !== undefined) {
    const parsedRank = Number.parseInt(String(override.top50Rank), 10);
    merged.top50Rank = Number.isNaN(parsedRank) ? null : parsedRank;
  }

  if (override.top50Comment !== undefined) {
    merged.top50Comment = cleanText(override.top50Comment);
  }

  if (override.sold !== undefined) {
    merged.sold = cleanText(override.sold);
  }

  if (override.boxartPath !== undefined) {
    merged.boxartPath = cleanText(override.boxartPath) || getBoxartPath(merged.title);
  }

  return merged;
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
  elements.authToggle.textContent = state.isAdmin ? "Admin Logout" : "Admin Login";
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

  if (state.creatingGame || state.editingCustom) {
    saveCustomGame(override);
  } else {
    delete override.title;
    state.gameOverrides[state.editingTitle] = override;
    persistAppData();
  }

  rebuildRawGames();
  closeEditorModal();
}

function resetEditedGame() {
  if (!state.editingTitle && !state.creatingGame) {
    return;
  }

  if (state.creatingGame) {
    closeEditorModal();
    return;
  }

  if (state.editingCustom) {
    state.customGames = state.customGames.filter((game) => game.Title !== state.editingSourceTitle);
    delete state.gameOverrides[state.editingSourceTitle];
    persistAppData();
    rebuildRawGames();
    closeEditorModal();
    return;
  }

  delete state.gameOverrides[state.editingTitle];
  persistAppData();
  rebuildRawGames();
  closeEditorModal();
}

function reapplyGames() {
  state.games = state.rawGames.map((game) => applyOverrideToGame(game));
  hydrateFilters();
  render();
}

function persistAppData() {
  const payload = buildAdminDataPayload();

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

  const payload = buildAdminDataPayload();

  downloadFile(
    "admin-data.json",
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

    if (!isValidImportBackup(payload)) {
      window.alert("The selected backup file is not valid for this collection.");
      return;
    }

    const shouldImport = window.confirm(
      "Importing this admin-data file will replace the current admin data in the browser. Do you want to continue?",
    );

    if (!shouldImport) {
      return;
    }

    state.customGames = payload.customGames;
    state.gameOverrides = payload.gameOverrides;
    state.acceptedQualityFindings = Array.isArray(payload.acceptedQualityFindings) ? payload.acceptedQualityFindings : [];
    persistAppData();
    rebuildRawGames();
    window.alert("Admin data imported successfully.");
  } catch (error) {
    console.error(error);
    window.alert("The admin-data file could not be imported.");
  }
}

function rebuildRawGames() {
  state.rawGames = [...state.rawGames.filter((game) => !game.isCustom), ...state.customGames.map(serializeCustomGame).map(normalizeGame)];
  reapplyGames();
}

function buildAdminDataPayload() {
  return {
    version: APP_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    customGames: state.customGames,
    gameOverrides: state.gameOverrides,
    acceptedQualityFindings: state.acceptedQualityFindings,
    collection: state.games.map((game) => ({
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
      isCustom: game.isCustom === true,
    })),
  };
}

async function loadAdminDataFile() {
  try {
    const response = await fetchTextWithRetry(ADMIN_DATA_URL, 1);
    const payload = JSON.parse(response);

    if (!isValidImportBackup(payload) || !hasAdminDataContent(payload)) {
      return;
    }

    state.customGames = payload.customGames;
    state.gameOverrides = payload.gameOverrides;
    state.acceptedQualityFindings = Array.isArray(payload.acceptedQualityFindings) ? payload.acceptedQualityFindings : [];
    persistAppData();
  } catch (error) {
    console.warn("admin-data.json could not be loaded on startup.", error);
  }
}

function hasAdminDataContent(payload) {
  return Boolean(
    (Array.isArray(payload.customGames) && payload.customGames.length > 0) ||
      (payload.gameOverrides && Object.keys(payload.gameOverrides).length > 0) ||
      (Array.isArray(payload.acceptedQualityFindings) && payload.acceptedQualityFindings.length > 0),
  );
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

function loadStorageJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStorageJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
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
    customGames: loadStorageJson("amiga-custom-games", []),
    gameOverrides: loadStorageJson("amiga-game-overrides", {}),
    acceptedQualityFindings: [],
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

function isValidAppDataStore(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray(value.customGames) &&
      Array.isArray(value.acceptedQualityFindings) &&
      value.gameOverrides &&
      typeof value.gameOverrides === "object",
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
