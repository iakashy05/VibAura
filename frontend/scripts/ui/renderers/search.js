import { getContentArea } from "./utils.js";

/**
 * Renders the search page container (mobile).
 */
export function renderSearchPage() {
  const contentArea = getContentArea();
  if (!contentArea) return;

  document.body.classList.remove("library-page-active");
  document.body.classList.remove("playlist-view-active");
  document.body.classList.add("search-page-active");

  const userAvatar = "https://placehold.co/40x40/DBEAFE/2563EB?text=A";

  contentArea.innerHTML = `
  <div class="page-view search-page">
    <div class="search-page-container">
      <div class="search-page-input-wrapper">
        <img src="images/music.webp" alt="VibAura" class="auth-logo">
        <div class="search-bar-container">
          <img src="images/icons/search.png" alt="Search" class="search-icon" />
          <input type="text" id="vibAura-search-input" class="vibAura-search-input" placeholder="What do you want to play?" autocomplete="off" aria-label="Search" readonly />
          <button class="search-clear-btn" id="search-clear-btn" aria-label="Clear" style="display: none;">✕</button>
        </div>
        <img src="${userAvatar}" alt="User Avatar" class="search-avatar" />
      </div>
      <div class="search-results-dropdown" id="search-results" style="position: relative; top: 0; left: 0; right: 0; border: none; max-height: none;">
        <div class="search-loading" style="display: none;"><span class="loading-text">Searching…</span></div>
        <div class="search-no-results" style="display: none;"><span class="no-results-text">No results found</span></div>
        <div class="search-results-content"></div>
      </div>
    </div>
  </div>`;
}
