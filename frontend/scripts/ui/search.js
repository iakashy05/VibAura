/**
 * ============================================================================
 * VibAura Search Component - Frontend Logic
 * ============================================================================
 *
 * A fully functional smart search system with:
 * - Debounced API calls (300ms) to reduce server load
 * - Real-time categorized results (songs, artists, playlists)
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Text highlighting for the matched query
 * - AbortController to cancel stale/out-of-order requests
 * - Click-outside detection to close the dropdown
 * - Separate logic for desktop (header) and mobile (search page)
 *
 * Integration:
 * - `initSearch()` is called in app.js on load.
 * - Replaces the static search bar in the desktop header.
 * - Attaches listeners to the mobile search page when routed.
 * - Plays songs directly via `playSongFromPlaylist`.
 * - Navigates to artist/playlist pages via the `router`.
 *
 * @module search
 * @requires playerController (for song playback)
 * @requires router (for navigation)
 * ============================================================================
 */

import { playSongFromPlaylist } from "../player/playerProxy.js";
import { router } from "../core/router.js";

// --- Module-level state variables ---
let searchAbortController = null; // To cancel pending fetch requests
let currentFocusIndex = -1; // For keyboard navigation
let allResults = []; // Caches the last successful search result
let debounceTimer = null; // Timer for debouncing user input

/**
 * Initializes the search component.
 * - Determines if mobile or desktop view.
 * - Mounts the desktop search component if needed.
 * - Attaches global listeners (click outside, resize).
 * - Sets up the mobile search page navigation listener.
 *
 * @exports initSearch
 */
export function initSearch() {
  console.log("[Search] Initializing search component...");

  const isMobileView = window.innerWidth < 768;

  if (!isMobileView) {
    // Desktop: Mount search component in the header immediately
    mountSearchComponent();
    attachSearchListeners();
  }

  // Global listeners
  attachClickOutsideListener();
  setupMobileSearchNavigation();

  // Handle window resize: Re-mounts search component if switching
  // between mobile and desktop layouts.
  let resizeTimer;
  let lastViewportWidth = window.innerWidth;
  let isMobileMode = lastViewportWidth < 768;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const currentWidth = window.innerWidth;
      const nowMobile = currentWidth < 768;

      // Only remount if we switched between mobile and desktop modes
      if (isMobileMode !== nowMobile) {
        console.log(
          `[Search] Viewport changed from ${lastViewportWidth}px to ${currentWidth}px - remounting search component`
        );
        isMobileMode = nowMobile;
        lastViewportWidth = currentWidth;

        // Remove old search component
        const oldSearch = document.querySelector(
          ".search-bar:not(.mobile-search-bar)"
        );
        if (oldSearch) {
          oldSearch.remove();
        }

        // Remount if now in desktop mode
        if (!nowMobile) {
          mountSearchComponent();
          attachSearchListeners();
        }
      }
    }, 250); // Debounce resize event
  });

  console.log("[Search] Search component initialized successfully!");
}

/**
 * MOUNT SEARCH COMPONENT (Desktop)
 * Replaces the static placeholder .search-bar in the desktop header
 * with the fully interactive search component.
 */
function mountSearchComponent() {
  console.log("[Search] Mounting desktop search component...");

  // Find the placeholder in the desktop header
  let targetContainer = document.querySelector(".nav .search-bar");
  if (!targetContainer) {
    // Fallback for different HTML structure
    targetContainer = document.querySelector(
      ".search-bar:not(.mobile-search-bar)"
    );
  }

  if (!targetContainer) {
    console.error("[Search] No desktop search bar container found");
    return;
  }

  // Define the interactive search component HTML
  const searchInputMarkup = `
    <img src="images/icons/search.png" alt="Search" class="search-icon" />
    <input 
      type="text" 
      id="vibAura-search-input" 
      class="vibAura-search-input"
      placeholder="What do you want to play?" 
      autocomplete="off"
      aria-label="Search songs, artists, and playlists"
    />
    <button 
      class="search-clear-btn" 
      id="search-clear-btn"
      aria-label="Clear search"
      style="display: none;"
    >
      ✕
    </button>
    
    <div class="search-results-dropdown" id="search-results">
      <div class="search-loading" style="display: none;">
        <span class="loading-text">Searching…</span>
      </div>
      <div class="search-no-results" style="display: none;">
        <span class="no-results-text">No results found</span>
      </div>
      <div class="search-results-content">
        </div>
    </div>
  `;

  console.log("[Search] Replacing desktop search bar contents...");
  targetContainer.innerHTML = searchInputMarkup;
}

/**
 * SETUP MOBILE SEARCH NAVIGATION
 * On mobile, the "Search" link in the bottom nav navigates to the #search
 * page (handled by the router). This function listens for that hash change
 * and then attaches listeners to the search input *on that page*.
 */
function setupMobileSearchNavigation() {
  const handleSearchPage = () => {
    if (window.location.hash === "#search") {
      console.log("[Search] Search page loaded, attaching search listeners...");
      // Wait for the router to render the page
      setTimeout(() => {
        attachSearchListenersToPage();
      }, 100);
    } else {
      // When leaving search page, remove the active class
      document.body.classList.remove("search-page-active");
    }
  };

  // Handle hash changes
  window.addEventListener("hashchange", handleSearchPage);

  // Also check on initial page load (if URL is already #search)
  if (window.location.hash === "#search") {
    setTimeout(() => {
      attachSearchListenersToPage();
    }, 100);
  }
}

/**
 * ATTACH SEARCH LISTENERS TO PAGE (Mobile)
 * Attaches listeners to the search input on the dedicated #search page.
 * Implements lazy activation: input is readonly until clicked.
 */
function attachSearchListenersToPage() {
  const searchInput = document.getElementById("vibAura-search-input");
  const clearBtn = document.getElementById("search-clear-btn");
  const searchBarContainer = document.querySelector(".search-bar-container");
  const searchPageInputWrapper = document.querySelector(
    ".search-page-input-wrapper"
  );
  const searchPage = document.querySelector(".search-page");

  if (!searchInput) {
    console.warn("[Search] Search input element not found on page");
    return;
  }

  console.log("[Search] Attaching listeners to search page input...");

  // Make input readonly initially
  searchInput.setAttribute("readonly", "");

  // Click handler - activate search mode
  searchInput.addEventListener("click", () => {
    if (searchInput.hasAttribute("readonly")) {
      console.log("[Search] Activating search mode...");
      // Remove readonly to enable typing
      searchInput.removeAttribute("readonly");
      // Mark as active
      searchPageInputWrapper.classList.add("search-active");
      searchPage.classList.add("search-active");
      // Focus and open keyboard
      searchInput.focus();
    }
  });

  // INPUT EVENT - Debounced search
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Show/hide clear button
    if (clearBtn) clearBtn.style.display = query.length > 0 ? "flex" : "none";

    // Clear previous debounce timer
    clearTimeout(debounceTimer);

    if (query.length === 0) {
      closeSearchResults();
      return;
    }

    // Debounce API call (300ms)
    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // CLEAR BUTTON
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      closeSearchResults();
      searchInput.focus();
    });
  }

  // ESCAPE KEY - Close search and return to readonly mode
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      console.log("[Search] Closing search mode...");
      searchInput.setAttribute("readonly", "");
      searchInput.value = "";
      if (clearBtn) clearBtn.style.display = "none";
      closeSearchResults();
      searchPageInputWrapper.classList.remove("search-active");
      searchPage.classList.remove("search-active");
      searchInput.blur();
    }
  });
}

/**
 * ATTACH SEARCH EVENT LISTENERS (Desktop)
 * Attaches listeners for input, focus, and keyboard navigation
 * to the search bar in the desktop header.
 */
function attachSearchListeners() {
  const searchInput = document.getElementById("vibAura-search-input");
  const clearBtn = document.getElementById("search-clear-btn");

  if (!searchInput) {
    console.warn("[Search] Search input element not found");
    return;
  }

  // INPUT EVENT - Debounced search
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Show/hide clear button
    clearBtn.style.display = query.length > 0 ? "flex" : "none";

    // Clear previous debounce timer
    clearTimeout(debounceTimer);

    if (query.length === 0) {
      closeSearchResults();
      return;
    }

    // Debounce API call (300ms)
    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // FOCUS EVENT - Show last results (if any)
  searchInput.addEventListener("focus", () => {
    const resultsDiv = document.getElementById("search-results");
    if (resultsDiv && allResults.length > 0) {
      resultsDiv.style.display = "block";
    }
  });

  // KEYBOARD NAVIGATION
  searchInput.addEventListener("keydown", (e) => {
    const resultsDiv = document.getElementById("search-results");
    const resultItems = document.querySelectorAll(".search-result-item");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(); // Prevent cursor from moving in input
        currentFocusIndex = Math.min(
          currentFocusIndex + 1,
          resultItems.length - 1
        );
        focusResultItem(resultItems, currentFocusIndex);
        break;

      case "ArrowUp":
        e.preventDefault(); // Prevent cursor from moving in input
        currentFocusIndex = Math.max(currentFocusIndex - 1, -1);
        if (currentFocusIndex === -1) {
          // Focus is back on the input
          searchInput.focus();
        } else {
          focusResultItem(resultItems, currentFocusIndex);
        }
        break;

      case "Enter":
        e.preventDefault();
        // If an item is focused, click it
        if (currentFocusIndex >= 0 && resultItems[currentFocusIndex]) {
          resultItems[currentFocusIndex].click();
        }
        break;

      case "Escape":
        e.preventDefault();
        // Close dropdown and blur input
        closeSearchResults();
        searchInput.blur();
        break;
    }
  });

  // CLEAR BUTTON
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    searchInput.focus();
    closeSearchResults();
    currentFocusIndex = -1;
  });
}

/**
 * ATTACH CLICK-OUTSIDE LISTENER
 * Close the search dropdown when clicking anywhere outside of it.
 */
function attachClickOutsideListener() {
  document.addEventListener("click", (e) => {
    const searchContainer = document.querySelector(".search-container");
    const mobileSearchBar = document.getElementById("mobile-search-container");
    const mobileNav = document.querySelector(".mobile-nav");
    const mobileHeader = document.querySelector(".mobile-header");

    // Close desktop search results dropdown if clicking outside
    if (searchContainer && !searchContainer.contains(e.target)) {
      closeSearchResults();
    }

    // Close mobile search bar (legacy, if used)
    if (mobileSearchBar && mobileSearchBar.style.display !== "none") {
      const isClickInMobileNav = mobileNav && mobileNav.contains(e.target);
      const isClickInMobileHeader =
        mobileHeader && mobileHeader.contains(e.target);
      const isClickInSearchBar = mobileSearchBar.contains(e.target);

      if (
        !isClickInSearchBar &&
        !isClickInMobileNav &&
        !isClickInMobileHeader
      ) {
        console.log("[Search] Closing mobile search bar (clicked outside)");
        mobileSearchBar.style.display = "none";
      }
    }
  });
}

/**
 * PERFORM SEARCH
 * - Cancels any pending search.
 * - Shows loading state.
 * - Fetches data from the /api/search endpoint.
 * - Renders results or error state.
 *
 * @async
 * @param {string} query - Search query
 */
async function performSearch(query) {
  console.log(`[Search] Performing search for: "${query}"`);

  // Cancel previous request if it's still pending
  if (searchAbortController) {
    searchAbortController.abort();
  }

  // Create a new AbortController for this request
  searchAbortController = new AbortController();

  showLoading();

  try {
    const url = `/api/search?q=${encodeURIComponent(query)}`;
    console.log(`[Search] Fetching from: ${url}`);

    const response = await fetch(url, {
      signal: searchAbortController.signal, // Pass the signal to fetch
    });

    console.log(`[Search] Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("[Search] Response data:", data);

    allResults = data; // Cache results

    renderSearchResults(data, query);
    currentFocusIndex = -1; // Reset keyboard focus
  } catch (error) {
    if (error.name === "AbortError") {
      // This is expected if a new search was typed
      console.log("[Search] Request cancelled");
      return;
    }

    console.error("[Search] Error fetching results:", error.message);
    console.error("[Search] Full error:", error);
    showNoResults();
  }
}

/**
 * RENDER SEARCH RESULTS
 * Populates the dropdown/results container with categorized results.
 *
 * @param {object} data - Search results from API {songs, artists, playlists}
 * @param {string} query - Original search query (for highlighting)
 */
function renderSearchResults(data, query) {
  const resultsDiv = document.getElementById("search-results");
  const contentDiv = resultsDiv.querySelector(".search-results-content");
  const loadingDiv = resultsDiv.querySelector(".search-loading");
  const noResultsDiv = resultsDiv.querySelector(".search-no-results");

  // Hide loading state
  loadingDiv.style.display = "none";

  const hasResults =
    data.songs.length > 0 ||
    data.artists.length > 0 ||
    data.playlists.length > 0;

  if (!hasResults) {
    showNoResults();
    return;
  }

  // Clear previous results
  contentDiv.innerHTML = "";

  // --- RENDER SONGS ---
  if (data.songs.length > 0) {
    const songsSection = createResultSection(
      "🎵 Songs",
      data.songs,
      "song",
      query
    );
    contentDiv.appendChild(songsSection);
  }

  // --- RENDER ARTISTS ---
  if (data.artists.length > 0) {
    const artistsSection = createResultSection(
      "🧑‍🎤 Artists",
      data.artists,
      "artist",
      query
    );
    contentDiv.appendChild(artistsSection);
  }

  // --- RENDER PLAYLISTS ---
  if (data.playlists.length > 0) {
    const playlistsSection = createResultSection(
      "🎶 Playlists",
      data.playlists,
      "playlist",
      query
    );
    contentDiv.appendChild(playlistsSection);
  }

  // Show results
  noResultsDiv.style.display = "none";
  resultsDiv.style.display = "block";

  // Attach click handlers to the new items
  attachResultItemHandlers();
}

/**
 * CREATE RESULT SECTION
 * Generates the HTML for a single category (e.g., "Songs").
 *
 * @param {string} title - Section title with emoji
 * @param {Array} items - Array of result items
 * @param {string} type - Result type ('song', 'artist', 'playlist')
 * @param {string} query - Search query for highlighting
 * @returns {HTMLElement} A <div> element for the section
 */
function createResultSection(title, items, type, query) {
  const section = document.createElement("div");
  section.className = "search-section";

  // Add section title (e.g., "🎵 Songs")
  const sectionTitle = document.createElement("div");
  sectionTitle.className = "search-section-title";
  sectionTitle.textContent = title;
  section.appendChild(sectionTitle);

  // Create and append each item in the section
  items.forEach((item) => {
    const itemElement = createResultItem(item, type, query);
    section.appendChild(itemElement);
  });

  return section;
}

/**
 * CREATE RESULT ITEM
 * Generates the HTML for a single search result item.
 *
 * @param {object} item - Result item data
 * @param {string} type - Result type ('song', 'artist', 'playlist')
 * @param {string} query - Search query for highlighting
 * @returns {HTMLElement} A <div> element for the result item
 */
function createResultItem(item, type, query) {
  const itemDiv = document.createElement("div");
  itemDiv.className = "search-result-item";
  itemDiv.dataset.id = item._id; // Store ID for click handler
  itemDiv.dataset.type = type; // Store type for click handler

  let imageUrl = "";
  let title = "";
  let subtitle = "";

  // --- Song Result ---
  if (type === "song") {
    imageUrl =
      item.artworkUrl ||
      "https://placehold.co/48x48/E5E7EB/1E1E1E?text=🎵";
    title = highlightMatch(item.title, query);

    // Handle multiple artists
    if (item.artists && item.artists.length > 0) {
      const artistNames = item.artists.map(a => a.name).join(", ");
      subtitle = artistNames; // Highlight match logic could be added here if needed, but keeping it simple
    } else {
      subtitle = "Unknown Artist";
    }
  }
  // --- Artist Result ---
  else if (type === "artist") {
    imageUrl =
      item.artworkUrl ||
      "https://placehold.co/48x48/E5E7EB/1E1E1E?text=🧑‍🎤";
    title = highlightMatch(item.name, query);
    subtitle = `${item.followers || 0} followers`;
  }
  // --- Playlist Result ---
  else if (type === "playlist") {
    imageUrl =
      item.cover || "https://placehold.co/48x48/E5E7EB/1E1E1E?text=🎶";
    title = highlightMatch(item.name, query);
    subtitle = item.category || "Playlist";
  }

  // Set the inner HTML for the item
  itemDiv.innerHTML = `
    <img src="${imageUrl}" alt="${title}" class="search-result-image" />
    <div class="search-result-info">
      <div class="search-result-title">${title}</div>
      <div class="search-result-subtitle">${subtitle}</div>
    </div>
    <div class="search-result-icon">→</div>
  `;

  return itemDiv;
}

/**
 * HIGHLIGHT MATCH
 * Wraps the matching part of a string in <mark> tags.
 *
 * @param {string} text - Text to highlight (e.g., "Song Title")
 * @param {string} query - Query to match (e.g., "Title")
 * @returns {string} HTML string with highlighted matches
 */
function highlightMatch(text, query) {
  if (!query) return text; // Return original text if no query

  // Use RegExp to find all occurrences, case-insensitive
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * ATTACH RESULT ITEM HANDLERS
 * Attaches click and keydown (Enter/Space) listeners to all
 * rendered result items.
 */
function attachResultItemHandlers() {
  const resultItems = document.querySelectorAll(".search-result-item");

  resultItems.forEach((item) => {
    // Click handler
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      const type = item.dataset.type;
      handleResultClick(id, type);
    });

    // Keyboard accessibility
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click(); // Trigger the click handler
      }
    });
  });
}

/**
 * HANDLE RESULT CLICK
 * Performs the correct action (play song or navigate) based on
 * the clicked item's type.
 *
 * @param {string} id - Item's _id
 * @param {string} type - Result type ('song', 'artist', 'playlist')
 */
function handleResultClick(id, type) {
  console.log(`[Search] Result clicked: type="${type}", id="${id}"`);

  closeSearchResults(); // Hide the dropdown

  if (type === "song") {
    // Find the full song object from the cached results
    const song = allResults.songs.find((s) => s._id === id);

    if (song) {
      // Play the song by creating a new playlist with just this one song
      playSongFromPlaylist([song], 0);
      console.log(
        `[Search] Playing song: "${song.title}" by ${(song.artists && song.artists.length > 0)
          ? song.artists.map(a => a.name).join(", ")
          : "Unknown Artist"
        }`
      );
    } else {
      console.error(`[Search] Song with ID ${id} not found in results`);
    }
  } else if (type === "artist") {
    // Navigate to artist page
    const artistHash = `#/artist/${id}`;
    console.log(`[Search] Setting hash to: ${artistHash}`);
    window.location.hash = artistHash;
    // Manually call router if hash is the same (e.g., clicking twice)
    router();
  } else if (type === "playlist") {
    // Navigate to playlist page
    const playlistHash = `#/playlist/${id}`;
    console.log(`[Search] Setting hash to: ${playlistHash}`);
    window.location.hash = playlistHash;
    // Manually call router
    router();
  } else {
    console.warn(`[Search] Unknown result type: ${type}`);
  }

  // Clear search input and hide clear button
  const searchInput = document.getElementById("vibAura-search-input");
  if (searchInput) {
    searchInput.value = "";
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
  }
}

/**
 * FOCUS RESULT ITEM
 * Applies keyboard focus styling (.focused class) to a result item.
 *
 * @param {NodeList} items - All result items
 * @param {number} index - Index of the item to focus
 */
function focusResultItem(items, index) {
  // Remove 'focused' class from all items
  items.forEach((item, i) => {
    item.classList.toggle("focused", i === index);
  });

  // Scroll the newly focused item into view if needed
  if (items[index]) {
    items[index].scrollIntoView({ block: "nearest" });
  }
}

/**
 * SHOW LOADING STATE
 * Displays the "Searching..." message in the results container.
 */
function showLoading() {
  const resultsDiv = document.getElementById("search-results");
  const loadingDiv = resultsDiv.querySelector(".search-loading");
  const noResultsDiv = resultsDiv.querySelector(".search-no-results");
  const contentDiv = resultsDiv.querySelector(".search-results-content");

  loadingDiv.style.display = "flex";
  noResultsDiv.style.display = "none";
  contentDiv.innerHTML = ""; // Clear old content
  resultsDiv.style.display = "block";
}

/**
 * SHOW NO RESULTS STATE
 * Displays the "No results found" message.
 */
function showNoResults() {
  const resultsDiv = document.getElementById("search-results");
  const loadingDiv = resultsDiv.querySelector(".search-loading");
  const noResultsDiv = resultsDiv.querySelector(".search-no-results");
  const contentDiv = resultsDiv.querySelector(".search-results-content");

  loadingDiv.style.display = "none";
  noResultsDiv.style.display = "flex";
  contentDiv.innerHTML = ""; // Clear old content
  resultsDiv.style.display = "block";
}

/**
 * CLOSE SEARCH RESULTS
 * Hides the results dropdown and resets the keyboard focus.
 */
function closeSearchResults() {
  const resultsDiv = document.getElementById("search-results");
  if (resultsDiv) {
    resultsDiv.style.display = "none";
  }
  currentFocusIndex = -1;
}