/**
 * ============================================================================
 * VibAura Page Renderer - Aggregator
 * ============================================================================
 *
 * This file now serves as a central export point for modularized renderers.
 * View-specific logic has been moved to the ./renderers/ directory.
 * ============================================================================
 */

export { renderHomePage } from "./renderers/home.js";
export { renderArtistPage } from "./renderers/artist.js";
export { 
    renderPlaylistPage, 
    renderLikedSongsPage, 
    renderRecentlyPlayedPage, 
    renderDetailPage 
} from "./renderers/playlist.js";
export { renderLibraryPage } from "./renderers/library.js";
export { renderSearchPage } from "./renderers/search.js";

// Re-export utilities if needed by other legacy modules
export { getContentArea } from "./renderers/utils.js";
