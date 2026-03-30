/**
 * ============================================================================
 * VibAura Component Builder - Aggregator
 * ============================================================================
 *
 * This file now serves as a central export point for modularized UI components.
 * Components have been moved to the ./components/ directory for better
 * maintainability and to reduce file size.
 * ============================================================================
 */

export { createSkeletonSection } from "./components/skeletons.js";
export { createSectionElement, createCardElement } from "./components/cards.js";
export { createScrollButton, attachScrollButtonListeners } from "./components/scroll.js";
export { openAddToPlaylistModal, openCreatePlaylistModal } from "./components/modals.js";