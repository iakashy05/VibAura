import { PlaylistService } from "../../services/playlistService.js";
import { getContentArea } from "./utils.js";

/**
 * Renders the library page (mobile-focused).
 */
export async function renderLibraryPage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  document.body.classList.remove("search-page-active");
  document.body.classList.remove("playlist-view-active");
  document.body.classList.add("library-page-active");

  const token = localStorage.getItem('vibAuraToken');
  const userStr = localStorage.getItem('vibAuraUser');
  let currentUserId = null;
  if (userStr) { try { currentUserId = JSON.parse(userStr).id; } catch (e) { } }

  if (!token) {
    contentArea.innerHTML = `
        <div class="page-view mobile-library-page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
            <h2 style="margin-bottom:1rem;">Your Library</h2>
            <p>Log in to view your playlists.</p>
        </div>`;
    return;
  }

  contentArea.innerHTML = '<div class="loader"></div>';

  try {
    const data = await PlaylistService.getUserLibrary();
    const playlists = Array.isArray(data) ? data : (data.libraryPlaylists || []);
    const likedSongs = data.likedSongs || [];

    let listHTML = `
        <li class="library-item mobile-playlist-item" data-id="liked-songs" data-name="Liked Songs" data-is-owner="false" data-cover="images/media controls/favourite.png" style="position: relative;">
          <img src="images/media controls/favourite.png" alt="Liked Songs" class="library-item-img" style="padding: 12px; background: linear-gradient(135deg, #450af5, #c4efd9); pointer-events: none;" />
          <div class="library-item-info" style="pointer-events: none;"><span class="library-item-title">Liked Songs</span><span class="library-item-subtitle">Playlist • ${likedSongs.length} songs</span></div>
        </li>
        <li class="library-item mobile-playlist-item" data-id="recently-played" data-name="Recently Played" data-is-owner="false" data-cover="images/icons/history.png" style="position: relative;">
          <img src="images/icons/history.png" alt="Recently Played" class="library-item-img" style="padding: 12px; background: linear-gradient(135deg, #1db954, #191414); pointer-events: none;" onerror="this.src='images/icons/library.png'" />
          <div class="library-item-info" style="pointer-events: none;"><span class="library-item-title">Recently Played</span><span class="library-item-subtitle">Virtual Playlist</span></div>
        </li>`;

    if (playlists.length === 0) {
      listHTML += `<li style="padding:20px; text-align:center; opacity:0.7;">No playlists yet. Create one!</li>`;
    } else {
      playlists.forEach(p => {
        const cover = p.coverImageUrl || 'images/Playlist.webp';
        const ownerId = (typeof p.owner === 'object') ? p.owner?._id : p.owner;
        const isOwner = (currentUserId && ownerId === currentUserId);
        listHTML += `
            <li class="library-item mobile-playlist-item" data-id="${p._id}" data-name="${p.name}" data-is-owner="${isOwner}" data-cover="${cover}" style="position: relative;">
              <img src="${cover}" alt="${p.name}" class="library-item-img" style="pointer-events: none;" />
              <div class="library-item-info" style="pointer-events: none;"><span class="library-item-title">${p.name}</span><span class="library-item-subtitle">Playlist • ${p.songs?.length || 0} songs</span></div>
            </li>`;
      });
    }

    contentArea.innerHTML = `
    <div class="page-view mobile-library-page">
      <div class="library-header"><h2 class="library-title">Your Library</h2><button id="mobile-create-pl-btn" class="action-icon-btn" style="background:transparent; border:none;"><img src="images/icons/plus.png" class="icon-adaptive" style="width:24px; height:24px;"></button></div>
      <ul class="library-list">${listHTML}</ul>
    </div>`;

    const btn = contentArea.querySelector('#mobile-create-pl-btn');
    if (btn) btn.addEventListener('click', () => window.openCreatePlaylistModal());

    contentArea.querySelectorAll('.mobile-playlist-item').forEach(item => {
      let timer; let isLongPress = false;
      const startPress = (e) => {
        if (timer) clearTimeout(timer); if (e.type === 'mousedown' && e.button !== 0) return;
        isLongPress = false; timer = setTimeout(() => {
          isLongPress = true; if (navigator.vibrate) navigator.vibrate(50);
          if (window.BottomSheetManager) window.BottomSheetManager.open('library-playlist', { _id: item.dataset.id, name: item.dataset.name, isOwner: item.dataset.isOwner === 'true', coverImageUrl: item.dataset.cover });
        }, 600);
      };
      const cancelPress = () => { if (timer) clearTimeout(timer); };
      const handleClick = (e) => {
        if (isLongPress) { e.preventDefault(); e.stopPropagation(); isLongPress = false; return; }
        if (item.dataset.id === 'recently-played') window.location.hash = '#/recently-played';
        else if (item.dataset.id === 'liked-songs') window.location.hash = '#liked-songs';
        else window.location.hash = `#/playlist/${item.dataset.id}`;
      };
      item.addEventListener('touchstart', startPress, { passive: false });
      item.addEventListener('touchend', cancelPress);
      item.addEventListener('touchcancel', cancelPress);
      item.addEventListener('touchmove', cancelPress);
      item.addEventListener('mousedown', startPress);
      item.addEventListener('mouseup', cancelPress);
      item.addEventListener('mouseleave', cancelPress);
      item.addEventListener('click', handleClick);
    });
  } catch (err) {
    console.error("Failed to load mobile library", err);
    contentArea.innerHTML = `<div class="error-message">Failed to load library: ${err.message}</div>`;
  }
}
