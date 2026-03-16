/**
 * ============================================================================
 * VibAura Router - Client-side Navigation Handler
 * ============================================================================
 *
 * Manages hash-based routing for single-page application (SPA) navigation.
 * Handles route changes, updates active navigation states, and coordinates
 * with the splash screen animation promise before rendering pages.
 *
 * Supported routes:
 * - # or #home     : Home page with trending content
 * - #library     : Library page (mobile-focused)
 * - #search      : Search page (mobile-focused)
 * - #/artist/:id  : Artist detail page
 * - #/playlist/:id: Playlist detail page
 * ============================================================================
*/

import { renderHomePage } from "../ui/renderers/home.js";
import { renderArtistPage } from "../ui/renderers/artist.js";
import { 
  renderPlaylistPage, 
  renderLikedSongsPage, 
  renderRecentlyPlayedPage 
} from "../ui/renderers/playlist.js";
import { renderLibraryPage } from "../ui/renderers/library.js";
import { renderSearchPage } from "../ui/renderers/search.js";

import {
  renderLoginPage,
  renderSignupPage,
  renderForgotPasswordPage,
  renderResetPasswordPage,
  setAuthMode
} from "../auth/authUI.js";

// DOM elements for routing and navigation state
const mobileHeader = document.querySelector(".mobile-header");
const contentArea = document.querySelector(".content");

// Desktop nav links (Note: #nav-library doesn't exist in the provided HTML)
const desktopNavLinks = [
  document.getElementById("nav-home"),
  document.getElementById("nav-library"), // This ID might be missing in index.html
];
// Mobile bottom bar nav links
const mobileNavLinks = document.querySelectorAll(".mobile-nav .nav-link");

/**
 * Main router function - Processes URL hash changes and renders the appropriate page.
 *
 * Features:
 * - Updates active navigation states on desktop and mobile
 * - Shows/hides mobile header based on the current route
 * - Waits for splash screen animation to finish on initial homepage load
 * - Routes to the correct page rendering function based on URL hash
 *
 * @async
 * @exports router
 * @returns {void}
 */
export async function router() {
  const hash = window.location.hash;

  console.log(`[Router] Processing route: ${hash || "(home)"}`);

  // Update active state on desktop navigation links
  desktopNavLinks.forEach((link) => {
    if (!link) return; // Skip if link (e.g., #nav-library) isn't found

    const linkHash = link.hash;
    // Check if link's hash matches, or if it's the home link and hash is empty
    if (linkHash === hash || (linkHash === "#" && hash === "")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Update active state on mobile navigation links
  mobileNavLinks.forEach((link) => {
    if (!link) return;

    const linkHash = link.hash;
    // Check if link's hash matches, or if it's the home link (#) and hash is empty
    if (linkHash === hash || (linkHash === "#" && (hash === "" || hash === "#home"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Show/hide header based on route for mobile responsiveness
  // Library page hides header; all other pages show it
  if (mobileHeader && contentArea) {
    console.log(`[Router] Mobile check - innerWidth: ${window.innerWidth}, hash: ${hash}`);
    if (window.innerWidth <= 768) {
      // Mobile view: Hide header for Library, Search, AND Artist pages
      const shouldHideHeader = hash === "#library" || hash === "#search" || hash.startsWith("#/artist/");

      if (shouldHideHeader) {
        console.log(`[Router] Hiding mobile header for ${hash}`);
        mobileHeader.style.display = "none";
        mobileHeader.style.visibility = "hidden";
        contentArea.style.paddingTop = hash.startsWith("#/artist/") ? "0" : "20px";

        // Toggle body classes for CSS targeting
        if (hash === "#library") document.body.classList.add("library-page-active");
        if (hash === "#search") document.body.classList.add("search-page-active");
        if (hash.startsWith("#/artist/")) document.body.classList.add("artist-page-active");
      } else {
        console.log("[Router] Showing mobile header");
        mobileHeader.style.display = "flex";
        mobileHeader.style.visibility = "visible";
        contentArea.style.paddingTop = "75px";

        // Clean up classes
        document.body.classList.remove("library-page-active");
        document.body.classList.remove("search-page-active");
        document.body.classList.remove("artist-page-active");
      }
    } else {
      // Reset to default styles for desktop view
      mobileHeader.style.display = ""; // Resets to CSS default
      mobileHeader.style.visibility = "";
      contentArea.style.paddingTop = ""; // Resets to CSS default
      document.body.classList.remove("library-page-active");
    }
  }

  // * Wait for splash screen animation to complete on *initial* homepage load.
  // * The 'window.splashAnimationDone' promise is created in splashScreen.js
  // * and resolves after the splash animation finishes or is skipped.
  const isHomePage = hash === "" || hash === "#" || hash === "#home";
  if (isHomePage) {
    // This await ensures the homepage content only renders *after* the splash is gone.
    // await window.splashAnimationDone;
  }

  // Route to appropriate page based on URL hash
  console.log(`[Router] Hash value: "${hash}"`);

  if (hash === "#library") {
    // --- Library Page (Mobile) ---
    setAuthMode(false);
    console.log("[Router] Rendering library page");
    renderLibraryPage();
  } else if (hash === "#liked-songs") {
    // --- Liked Songs Page ---
    setAuthMode(false);
    console.log("[Router] Rendering liked songs page");
    renderLikedSongsPage();
  } else if (hash === "#/recently-played") {
    // --- Recently Played Page ---
    setAuthMode(false);
    console.log("[Router] Rendering recently played page");
    renderRecentlyPlayedPage();
  } else if (hash === "#search") {
    // --- Search Page (Mobile) ---
    setAuthMode(false);
    console.log("[Router] Rendering search page");
    renderSearchPage();
  } else if (hash.startsWith("#/artist/")) {
    // --- Artist Detail Page ---
    setAuthMode(false);
    const artistId = hash.substring(9); // Get the ID after "#/artist/"
    console.log(`[Router] Rendering artist page for ID: ${artistId}`);
    renderArtistPage(artistId);
  } else if (hash.startsWith("#/playlist/")) {
    // --- Playlist Detail Page ---
    setAuthMode(false);
    const playlistId = hash.substring(11); // Get the ID after "#/playlist/"
    console.log(`[Router] Rendering playlist page for ID: ${playlistId}`);
    renderPlaylistPage(playlistId);
  } else if (hash === "#/login") {
    // --- Login Page ---
    console.log("[Router] Rendering login page");
    renderLoginPage();
  } else if (hash === "#/signup") {
    // --- Signup Page ---
    console.log("[Router] Rendering signup page");
    renderSignupPage();
  } else if (hash === "#/forgot-password") {
    // --- Forgot Password Page ---
    console.log("[Router] Rendering forgot password page");
    renderForgotPasswordPage();
  } else if (hash.startsWith("#/reset-password")) {
    // --- Reset Password Page ---
    console.log("[Router] Rendering reset password page");
    renderResetPasswordPage();
  } else {
    // --- Home Page (Default) ---
    // Default to home page for root hash (#), empty hash, or unrecognized routes
    setAuthMode(false);
    console.log("[Router] Rendering home page (default)");
    renderHomePage();
  }
}

// Initialize router on page load (DOMContentLoaded) and listen for hash changes
window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);