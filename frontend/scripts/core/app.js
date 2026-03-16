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
import { LibraryManager } from "../ui/libraryManager.js";

// Import modules that self-initialize or are needed for side-effects (like router)
import "../core/router.js"; // This import runs the router setup
import "../mobile/mobile.js"; // This import runs mobile-specific setup

// Initialize splash screen animation first (creates the splash promise)
// This is crucial so the router can wait for it.
initSplashScreen();

// Initialize all other core application components
initThemeManager();
initPlayer();
initScrollController();
initSearch();
initAuthUI(); // <-- Initialize Auth UI (Login/Logout buttons)
LibraryManager.init();