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
import { initThemeManager } from "../ui/themeManager.js";
import { initPlayer } from "../player/playerProxy.js";
import { initSearch } from "../ui/searchProxy.js";
import { initAuthUI } from "../auth/authUI.js";
import { initSplashScreen } from "../ui/splashScreen.js";
import { initScrollController } from "../ui/scrollController.js";
import { LibraryManager } from "../ui/libraryManager.js";

// Import modules that self-initialize or are needed for side-effects (like router)
import "../core/router.js"; // This import runs the router setup
import "../mobile/mobile.js"; // This import runs mobile-specific setup

import { verifySession } from "../auth/authService.js";
import { router } from "./router.js";

// Initialize splash screen animation first (creates the splash promise)
// This is crucial so the router can wait for it.
// initSplashScreen(); // Moved inside initializeApp for explicit ordering

// Define initialization sequence
async function initializeApp() {
  console.log("[App] Starting static initialization...");
  
  // 1. Splash screen animation first
  initSplashScreen();

  // 2. Check session first to clear stale tokens (Crucial!)
  // This must be awaited before ANY UI renders
  await verifySession();

  // 3. Initialize core UI components
  initThemeManager();
  initPlayer();
  initScrollController();
  initSearch();
  initAuthUI(); 
  LibraryManager.init();

  // 4. Finally, attach router listeners and run initial route
  window.addEventListener("hashchange", router);
  await router();
  
  console.log("[App] Initialization complete.");
}

// Start the app immediately
initializeApp().catch(err => {
    console.error("Critical: App initialization failed:", err);
    // Fallback if everything explodes
    router().catch(e => console.error("Router fallback failed:", e));
});