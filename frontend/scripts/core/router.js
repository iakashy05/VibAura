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

import { renderHomePage } from "/scripts/ui/renderers/home.js";
import { renderArtistPage } from "/scripts/ui/renderers/artist.js";
import { 
  renderPlaylistPage, 
  renderLikedSongsPage, 
  renderRecentlyPlayedPage 
} from "/scripts/ui/renderers/playlist.js";
import { renderLibraryPage } from "/scripts/ui/renderers/library.js";
import { renderSearchPage } from "/scripts/ui/renderers/search.js";
import { clearViewStyles } from "/scripts/ui/renderers/utils.js";

import {
  renderLoginPage,
  renderSignupPage,
  renderForgotPasswordPage,
  renderOTPVerificationPage,
  renderNewPasswordPage,
  setAuthMode
} from "/scripts/auth/authUI.js";

import { isAuthenticated } from "/scripts/auth/authService.js";

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
 * Includes a Route Guard to enforce authentication.
 */
export async function router() {
  const hash = window.location.hash || "#home";
  const isAuthRoute = hash.startsWith("#/login") || 
                     hash.startsWith("#/signup") || 
                     hash.startsWith("#/forgot-password") || 
                     hash.startsWith("#/reset-password");

  // Global UI Reset (Consolidated Cleanup)
  clearViewStyles();

  console.log(`[Router] Guarding route: ${hash}. Authenticated: ${isAuthenticated()}`);

  // --- ROUTE GUARD LOGIC ---
  if (!isAuthenticated() && !isAuthRoute) {
    console.warn(`[Router] Unauthorized access to ${hash} - redirecting to login`);
    window.location.hash = "#/login";
    return;
  }

  if (isAuthenticated() && isAuthRoute) {
    console.log(`[Router] Authenticated user on auth route - redirecting home`);
    window.location.hash = "#home";
    return;
  }

  // Close any open modals on route change
  const openModals = document.querySelectorAll('.modal, #create-playlist-modal');
  openModals.forEach(modal => {
    if (modal.style.display === 'flex' || modal.style.display === 'block') {
      modal.style.display = 'none';
      const form = modal.querySelector('form');
      if (form) form.reset();
    }
  });

  // Update active state on navigation links
  const updateActiveStates = () => {
    desktopNavLinks.forEach((link) => {
      if (!link) return;
      const linkHash = link.hash;
      if (linkHash === hash || (linkHash === "#" && (hash === "" || hash === "#home"))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    mobileNavLinks.forEach((link) => {
      if (!link) return;
      const linkHash = link.hash;
      if (linkHash === hash || (linkHash === "#" && (hash === "" || hash === "#home"))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };
  updateActiveStates();

  // --- RESPONSIVE LAYOUT MANAGEMENT ---
  if (window.innerWidth <= 768) {
    const shouldHideHeader = hash === "#library" || hash === "#search" || hash.startsWith("#/artist/");
    // Header management for specific mobile views
    if (shouldHideHeader) {
      // Classes are now handled by clearViewStyles + specific renderer additions
    }
  } else {
    if (mobileHeader) {
      mobileHeader.style.display = "";
      mobileHeader.style.visibility = "";
    }
    if (contentArea) contentArea.style.paddingTop = "";

    if (hash === "#library" || hash === "#search") {
      window.location.hash = "#home";
      return;
    }
  }

  // --- RENDERING DISPATCH ---
  if (hash === "#library") {
    setAuthMode(false);
    renderLibraryPage();
  } else if (hash === "#liked-songs") {
    setAuthMode(false);
    renderLikedSongsPage();
  } else if (hash === "#/recently-played") {
    setAuthMode(false);
    renderRecentlyPlayedPage();
  } else if (hash === "#search") {
    setAuthMode(false);
    renderSearchPage();
  } else if (hash.startsWith("#/artist/")) {
    setAuthMode(false);
    renderArtistPage(hash.substring(9));
  } else if (hash.startsWith("#/playlist/")) {
    setAuthMode(false);
    renderPlaylistPage(hash.substring(11));
  } else if (hash === "#/login") {
    renderLoginPage();
  } else if (hash === "#/signup") {
    renderSignupPage();
  } else if (hash === "#/forgot-password") {
    renderForgotPasswordPage();
  } else if (hash.startsWith("#/otp-verification")) {
    const email = new URLSearchParams(hash.split('?')[1]).get('email');
    renderOTPVerificationPage(email);
  } else if (hash.startsWith("#/reset-password")) {
    // Legacy route or direct access - redirect to forgot password
    window.location.hash = "#/forgot-password";
  } else {
    setAuthMode(false);
    renderHomePage();
  }
}

/**
 * DEBOUNCED RESIZE LISTENER
 */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // DO NOT trigger router re-render on resize if we are on an AUTH route 
    // to prevent keyboard-triggered focus loss on mobile.
    const hash = window.location.hash || "#home";
    const isAuthRoute = hash.startsWith("#/login") || 
                       hash.startsWith("#/signup") || 
                       hash.startsWith("#/forgot-password") || 
                       hash.startsWith("#/otp-verification") || 
                       hash.startsWith("#/reset-password");
    
    if (!isAuthRoute) {
      router();
    }
  }, 250);
});

// Router logic only. Initialization is now handled by app.js to ensure proper sequencing.