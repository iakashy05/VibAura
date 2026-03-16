/**
 * Lazy loading proxy for the Player Controller.
 * Defers loading the full player logic (600+ lines) until the user interacts with it.
 */

let playerModule = null;

/**
 * Load the real player module dynamically.
 */
async function getPlayer() {
  if (!playerModule) {
    console.log("[LazyPlayer] Dynamically importing playerController...");
    playerModule = await import("./playerController.js");
    // Once loaded, we must initialize the listeners
    if (playerModule.initPlayer) {
      playerModule.initPlayer();
    }
  }
  return playerModule;
}

/**
 * Proxy for playSongFromPlaylist.
 * Triggers the dynamic import and then delegates the call.
 */
export async function playSongFromPlaylist(newPlaylist, index) {
  const player = await getPlayer();
  return player.playSongFromPlaylist(newPlaylist, index);
}

/**
 * Proxy for initPlayer.
 * We don't initialize immediately; instead, we attach "guard" listeners 
 * to the mini-player that trigger loading.
 */
export function initPlayer() {
  const miniPlayer = document.querySelector(".music-player");
  if (!miniPlayer) return;

  // Track if we've already started loading to avoid multiple triggers
  let isTriggered = false;

  const triggerLoad = async (e) => {
    if (isTriggered) return;
    
    // Check if the click was on one of the controls that should trigger the player
    // But honestly, any interaction with the player area should probably start loading it
    console.log("[LazyPlayer] Interaction detected, loading player logic...");
    isTriggered = true;
    
    // Clean up these temporary listeners
    miniPlayer.removeEventListener("click", triggerLoad);
    miniPlayer.removeEventListener("touchstart", triggerLoad);

    await getPlayer();
    
    // NOTE: The real initPlayer() inside the real module will attach the real listeners.
    // If this was a click event, we might want to re-dispatch it or simply wait 
    // for the real listener to catch subsequent clicks.
  };

  // Attach temporary listeners for the "first touch"
  miniPlayer.addEventListener("click", triggerLoad);
  miniPlayer.addEventListener("touchstart", triggerLoad, { passive: true });

  // Also expose playSongFromPlaylist to window as the renderers expect it
  window.playSongFromPlaylist = playSongFromPlaylist;
}
