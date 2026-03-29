/**
 * ============================================================================
 * VibAura Music App - Main Entry Point
 * ============================================================================
 *
 * This module initializes all core components of the VibAura music application:
 * - Splash screen animation
 * - Theme manager (light/dark mode switching)
 * - Music player with controls
 * - Scroll behavior for page interactions
 * - Smart search functionality
 * - Router for navigation
 * - Mobile-specific functionality
 *
 * Initialization order is critical:
 * 1. Splash screen sets up animation promise
 * 2. Theme manager applies saved/system theme
 * 3. Player initializes audio controls
 * 4. Scroll controller adds header effects
 * 5. Search component mounts and initializes
 * 6. Router and mobile features load (Router import runs its event listeners)
 * ============================================================================
 */

// Import initialization functions from their respective modules
import { initSplashScreen } from "/scripts/ui/splashScreen.js";
import { verifySession, isAuthenticated } from "/scripts/auth/authService.js";
import { initAuthUI, setAuthMode } from "/scripts/auth/authUI.js";
import { router } from "/scripts/core/router.js";
import { initThemeManager } from "/scripts/ui/themeManager.js";
import { initPlayer } from "/scripts/player/playerProxy.js";
import { initScrollController } from "/scripts/ui/scrollController.js";
import { initSearch } from "/scripts/ui/searchProxy.js";
import { LibraryManager } from "/scripts/ui/libraryManager.js";

// Define initialization sequence
async function initializeApp() {
  console.log("[App] Starting static initialization...");
  
  // 1. Splash screen animation first (deterministic sequence)
  initSplashScreen();

  // 2. AUTH GATE: Check session before loading ANY app shell
  // We await this to ensure we have a valid UserStore before proceeding.
  console.log("[App] Auth Handshake - Verifying session...");
  await verifySession();

  // 3. SHELL SELECTION: Initialize components based on Auth status
  // initAuthUI will handle the "Login Shell" or "App Shell" toggle
  initAuthUI(); 
  initThemeManager();

  const hash = window.location.hash || "#home";
  const isAuthRoute = hash.startsWith("#/login") || 
                      hash.startsWith("#/signup") || 
                      hash.startsWith("#/forgot-password") ||
                      hash.startsWith("#/otp-verification") ||
                      hash.startsWith("#/reset-password");

  if (isAuthRoute) {
    console.log("[App] Loading Auth Shell...");
  } else {
    console.log("[App] Loading App Shell...");
    initPlayer();
    initScrollController();
    initSearch();
    LibraryManager.init();
  }

  // 4. ROUTER: Finally, run the router to handle the current hash
  window.addEventListener("hashchange", router);
  await router();

  // 5. DISMISS SPLASH: Only after everything is mounted and routed
  if (window.hideSplashScreen) {
    console.log("[App] Dismissing splash screen.");
    window.hideSplashScreen();
  }
  
  console.log("[App] Initialization complete.");
}

// Start the app immediately
initializeApp().catch(err => {
    console.error("Critical: App initialization failed:", err);
    // Fallback if everything explodes
    router().catch(e => console.error("Router fallback failed:", e));
});