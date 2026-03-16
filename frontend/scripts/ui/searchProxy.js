/**
 * Lazy loading proxy for the Search component.
 * Defers loading the full search logic (700+ lines) until the user focuses the search bar.
 */

let searchModule = null;

async function getSearchModule() {
  if (!searchModule) {
    console.log("[LazySearch] Dynamically importing search logic...");
    searchModule = await import("../ui/search.js");
  }
  return searchModule;
}

/**
 * Proxy for initSearch.
 * Mounts the minimal search bar and weights for focus to load full logic.
 */
export function initSearch() {
  const isMobileView = window.innerWidth < 768;

  // If mobile, we wait for route change to #search (handled by routing logic)
  // But we still need the proxy to be available.

  const setupDesktopTrigger = () => {
    const searchInput = document.getElementById("vibAura-search-input");
    if (!searchInput) return;

    searchInput.addEventListener("focus", async () => {
      const { initSearch: realInitSearch } = await getSearchModule();
      // On desktop, the component is already "mounted" in a basic state by index.html or partials
      // The real initSearch will attach the debounced listeners and key handlers
      realInitSearch();
    }, { once: true });
  };

  if (isMobileView) {
    // For mobile, we listen for the hash change to #search
    window.addEventListener("hashchange", async () => {
      if (window.location.hash === "#search") {
        const { initSearch: realInitSearch } = await getSearchModule();
        realInitSearch();
      }
    });
    // Check initial load
    if (window.location.hash === "#search") {
      getSearchModule().then(m => m.initSearch());
    }
  } else {
    // On desktop, if the input exists, shield it
    // If it doesn't exist yet (not mounted), we might need to wait or mount a shell
    setupDesktopTrigger();
    
    // Watch for mount (though search is usually static in header)
    const observer = new MutationObserver((mutations) => {
      if (document.getElementById("vibAura-search-input")) {
        setupDesktopTrigger();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
