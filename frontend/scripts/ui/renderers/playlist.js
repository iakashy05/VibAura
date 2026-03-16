import { playSongFromPlaylist } from "../../player/playerProxy.js";
import { formatTime } from "../../utils/utils.js";
import { PlaylistService } from "../../services/playlistService.js";
import { HistoryService } from "../../services/historyService.js";
import { getCurrentUser } from "../../auth/authService.js";
import { LibraryManager } from "../libraryManager.js";
import { 
  getContentArea, 
  sortSongs, 
  getDominantColor 
} from "./utils.js";

/**
 * Renders the playlist detail page.
 */
export async function renderPlaylistPage(playlistId, sortCriteria = 'recents') {
  const contentArea = getContentArea();
  if (!contentArea) return;

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  if (!contentArea.querySelector('.playlist-page')) {
    contentArea.innerHTML = `<div class="page-view"><p>Loading playlist...</p></div>`;
  }

  try {
    const response = await fetch(`/api/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('vibAuraToken')}` }
    });
    if (!response.ok) throw new Error("Playlist not found");

    const playlist = await response.json();
    let songs = playlist.songs || [];
    songs = sortSongs(songs, sortCriteria);

    const coverImage = playlist.artworkUrl || playlist.coverImageUrl || "images/Playlist.webp";
    const songCount = songs.length;
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    let isOwner = false;
    if (playlist.owner) {
      if (typeof playlist.owner === 'object') {
        isOwner = playlist.owner._id === currentUserId;
      } else {
        isOwner = playlist.owner === currentUserId;
      }
    }

    let isSaved = false;
    if (currentUserId && !isOwner) {
      try {
        const myPlaylists = await PlaylistService.getUserLibrary();
        isSaved = myPlaylists.some(p => p._id === playlist._id);
      } catch (e) { console.warn("Could not check library status", e); }
    }

    const totalDurationSec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalHours = Math.floor(totalDurationSec / 3600);
    const totalMinutes = Math.floor((totalDurationSec % 3600) / 60);
    const durationText = totalHours > 0
      ? `about ${totalHours} hr ${totalMinutes} min`
      : `about ${totalMinutes} min`;

    const rgb = await getDominantColor(coverImage);
    const bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const sortBtnHTML = `
      <button class="action-icon-btn sort-trigger-btn" title="Sort Songs">
          <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
      </button>
    `;

    let ownerActionsHTML = sortBtnHTML;
    if (isOwner) {
      ownerActionsHTML += `
            <button class="action-icon-btn" id="rename-playlist-btn" title="Rename">
                <img src="images/icons/edit.png" alt="Edit" class="icon-adaptive icon-edit">
            </button>
        `;
    } else {
      ownerActionsHTML += isSaved ? `
            <button class="action-icon-btn" id="save-library-btn" title="Already in Linked" style="cursor: default;">
                <img src="images/icons/check.png" alt="Saved" class="icon-adaptive icon-check">
            </button>` : `
            <button class="action-icon-btn" id="save-library-btn" title="Save to Library">
                <img src="images/icons/plus.png" alt="Save" class="icon-adaptive icon-save">
            </button>`;
    }

    document.body.classList.remove("library-page-active");
    document.body.classList.remove("search-page-active");
    document.body.classList.add('playlist-view-active');

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // --- MOBILE RENDER ---
      const mobileSongListHTML = songs.map((song, index) => {
        const artistNames = (song.artists && song.artists.length > 0)
          ? song.artists.map(a => a.name).join(", ")
          : "Unknown Artist";
        const artwork = song.artworkUrl || song.imageUrl || "images/default-album.webp";
        return `
            <div class="playlist-song-row" data-index="${index}" data-song-id="${song._id}">
               <div class="song-index">
                 <img src="${artwork}" class="song-list-art" loading="lazy">
                 <img src="images/equaliser.gif" class="playing-gif" style="display: none;" />
               </div>
               <div class="song-main-info">
                 <div class="song-title-row">${song.title}</div>
                 <div class="song-artist-row">${artistNames}</div>
               </div>
               <div class="song-options">
                 <button class="card-options-btn" data-song-id="${song._id}">
                   <img src="images/icons/more.png" alt="Options" />
                 </button>
               </div>
            </div>`;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-mode" style="background: var(--color-background-surface);">
            <div class="mobile-sticky-header" id="mobile-sticky-header">
               <button class="sticky-back-btn" onclick="window.history.back()">
                  <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
               </button>
               <span class="sticky-title">${playlist.name}</span>
               <div style="width: 24px;"></div>
            </div>
            <div class="playlist-header">
               <div class="header-top-row">
                   <div class="playlist-cover-wrapper"><img src="${coverImage}" alt="${playlist.name}" class="playlist-cover"></div>
                   <div class="playlist-info">
                     <span class="playlist-type" style="opacity: 0.8; color: var(--color-text-secondary);">Playlist</span>
                     <h1 class="playlist-title" style="color: var(--color-text-primary);">${playlist.name}</h1>
                     <div class="playlist-meta" style="color: var(--color-text-secondary); opacity: 0.8;">
                        <span class="playlist-owner">${playlist.owner ? (playlist.owner.name || 'User') : 'You'}</span><span class="bullet">•</span><span>${songCount} songs</span>
                     </div>
                   </div>
               </div>
               <div class="play-shuffle-row">
                   <button class="play-btn-pill" id="mobile-play-btn"><img src="images/media controls/play.png" class="btn-icon"> Play</button>
                   <button class="shuffle-btn-pill" id="mobile-shuffle-btn"><img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle</button>
                   <button class="action-icon-btn sort-trigger-btn" id="mobile-sort-btn" title="Sort"><img src="images/icons/sort.png" class="icon-adaptive" style="width:24px; height:24px;"></button>
               </div>
            </div>
            <div class="playlist-songs-list">${mobileSongListHTML}</div>
            ${songs.length === 0 ? '<div style="text-align:center; padding:20px; opacity:0.6;">No songs yet</div>' : ''}
          </div>`;

      const handleSort = (criteria) => renderPlaylistPage(playlistId, criteria);
      const sortOptionsArr = [{ label: 'Recents', value: 'recents' }, { label: 'Title (A-Z)', value: 'title' }, { label: 'Artist', value: 'artist' }, { label: 'Album', value: 'album' }];

      const songListContainer = contentArea.querySelector('.playlist-songs-list');
      if (songListContainer) {
        let longPressTimer;
        const holdDuration = 500;

        songListContainer.addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row) return;

          const songIndex = parseInt(row.dataset.index);
          const song = songs[songIndex];

          if (e.target.closest('.card-options-btn')) {
            e.stopPropagation();
            if (window.BottomSheetManager && song) window.BottomSheetManager.open('song', song);
            return;
          }

          if (row.dataset.longPressTriggered === 'true') {
            row.dataset.longPressTriggered = 'false';
            return;
          }

          playSongFromPlaylist(songs, songIndex);
        });

        songListContainer.addEventListener('touchstart', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row || e.target.closest('.card-options-btn')) return;

          row.dataset.longPressTriggered = 'false';
          longPressTimer = setTimeout(() => {
            row.dataset.longPressTriggered = 'true';
            if (navigator.vibrate) navigator.vibrate(50);
            const song = songs[parseInt(row.dataset.index)];
            if (window.BottomSheetManager && song) window.BottomSheetManager.open('song', song);
          }, holdDuration);
        }, { passive: true });

        const cancelPress = () => clearTimeout(longPressTimer);
        songListContainer.addEventListener('touchend', cancelPress);
        songListContainer.addEventListener('touchmove', cancelPress);
      }

      const playBtn = contentArea.querySelector("#mobile-play-btn");
      if (playBtn && songs.length > 0) playBtn.addEventListener("click", () => playSongFromPlaylist(songs, 0));

      const shuffleBtn = contentArea.querySelector("#mobile-shuffle-btn");
      if (shuffleBtn && songs.length > 0) {
        shuffleBtn.addEventListener("click", () => {
          const shuffled = [...songs].sort(() => Math.random() - 0.5);
          playSongFromPlaylist(shuffled, 0);
        });
      }

      const mbSortBtn = contentArea.querySelector("#mobile-sort-btn");
      if (mbSortBtn && window.BottomSheetManager) {
        mbSortBtn.addEventListener("click", () => window.BottomSheetManager.open('sort-options', { options: sortOptionsArr, onSelect: handleSort }));
      }

      const stickyHeader = contentArea.querySelector("#mobile-sticky-header");
      if (stickyHeader && scrollContainer) {
        scrollContainer.onscroll = () => {
          if (scrollContainer.scrollTop > 150) stickyHeader.classList.add("visible");
          else stickyHeader.classList.remove("visible");
        };
      }
      return;
    }

    // --- DESKTOP RENDER ---
    const songListHeaderHTML = `
        <div class="song-list-header">
          <div class="col-header col-index">#</div><div class="col-header col-title">Title</div><div class="col-header col-album">Album</div>
          <div class="col-header col-right col-duration"><img src="images/icons/clock.png" class="icon-adaptive small icon-clock"></div>
          ${isOwner ? '<div class="col-header col-right"></div>' : ''}
        </div>`;

    let songsListRowsHTML = "";
    if (songs.length > 0) {
      songsListRowsHTML = `<div class="playlist-song-list">`;
      songs.forEach((song, index) => {
        const artistName = (song.artists && song.artists.length > 0) ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        songsListRowsHTML += `
          <div class="playlist-row song-item" data-index="${index}" data-id="${song._id}">
            <div class="col-index"><span class="index-num">${index + 1}</span><span class="play-icon-row">▶</span></div>
            <div class="col-title"><img src="${song.artworkUrl}" alt="${song.title}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${artistName}</span></div></div>
            <div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div>
            ${isOwner ? `<div class="col-actions"><button class="icon-btn small remove-song-btn" data-song-id="${song._id}" title="Remove"><img src="images/icons/trash.png" class="icon-adaptive small icon-trash"></button></div>` : ''}
          </div>`;
      });
      songsListRowsHTML += `</div>`;
    } else { songsListRowsHTML = `<div class="empty-state"><p>No songs in this playlist yet.</p></div>`; }

    contentArea.innerHTML = `
      <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
        <div class="playlist-header-dynamic" id="main-header">
           <div class="header-content-wrapper"><img src="${coverImage}" alt="${playlist.name}" class="playlist-cover-large"><div class="playlist-details-large"><span class="playlist-label">Playlist</span><h1 class="playlist-title-large">${playlist.name}</h1><p class="playlist-description"><span class="owner-name">${playlist.owner?.name || 'VibAura'}</span> • <span class="song-count">${songCount} songs</span>, <span class="total-duration">${durationText}</span></p></div></div>
        </div>
        <div class="playlist-sticky-group" id="sticky-group"><div class="playlist-actions-bar" id="actions-bar"><div class="actions-left"><button class="action-play-btn" id="playlist-play-btn"><img src="images/media controls/play.png" alt="Play"></button>${ownerActionsHTML}</div><span class="sticky-group-title">${playlist.name}</span></div>${songListHeaderHTML}</div>
        <div class="song-list-container">${songsListRowsHTML}</div>
      </div>`;

    const stickyGroup = contentArea.querySelector("#sticky-group");
    const mainHeader = contentArea.querySelector("#main-header");
    scrollContainer.onscroll = () => {
      const scrollY = scrollContainer.scrollTop; const triggerPoint = 300;
      if (scrollY > triggerPoint) stickyGroup.classList.add("stuck"); else stickyGroup.classList.remove("stuck");
      if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
    };

    const mainPlayBtn = contentArea.querySelector("#playlist-play-btn");
    if (songs.length > 0 && mainPlayBtn) mainPlayBtn.addEventListener("click", () => playSongFromPlaylist(songs, 0));

    // DESKTOP EVENT DELEGATION
    const desktopSongContainer = contentArea.querySelector(".playlist-song-list");
    if (desktopSongContainer) {
      desktopSongContainer.addEventListener("click", (e) => {
        const item = e.target.closest('.song-item');
        if (!item || e.target.closest('.remove-song-btn')) return;
        playSongFromPlaylist(songs, parseInt(item.dataset.index));
      });
    }

    if (isOwner) {
      contentArea.querySelectorAll(".remove-song-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Remove song from playlist?")) return;
          try { await PlaylistService.removeSongFromPlaylist(playlistId, btn.dataset.songId); renderPlaylistPage(playlistId); } catch (err) { alert("Failed to remove song"); }
        });
      });
      const renameBtn = document.getElementById('rename-playlist-btn');
      if (renameBtn) {
        renameBtn.addEventListener('click', async () => {
          const newName = prompt("Enter new playlist name:", playlist.name);
          if (newName && newName !== playlist.name) {
            try { await PlaylistService.renamePlaylist(playlistId, newName); renderPlaylistPage(playlistId); LibraryManager.renderLibrary(); } catch (err) { alert("Failed to rename"); }
          }
        });
      }
    } else {
      const saveBtn = document.getElementById('save-library-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          if (isSaved) { alert("This playlist is already in your library."); return; }
          try { await PlaylistService.addPlaylistToLibrary(playlistId); LibraryManager.renderLibrary(); alert("Saved to library"); renderPlaylistPage(playlistId); } catch (err) { alert("Failed to save: " + err.message); }
        });
      }
    }

    const dkSortBtn = contentArea.querySelector(".actions-left .sort-trigger-btn");
    if (dkSortBtn) {
      dkSortBtn.addEventListener("click", () => {
        const criteria = prompt(`Sort By:\nrecents, title, artist, album`, sortCriteria);
        if (criteria && ['recents', 'title', 'artist', 'album'].includes(criteria)) renderPlaylistPage(playlistId, criteria);
      });
    }

  } catch (error) {
    console.error("Error rendering playlist page:", error);
    contentArea.innerHTML = `<div class="page-view"><p class="error-message">Could not load playlist.</p></div>`;
  }
}

/**
 * Renders the Liked Songs page.
 */
export async function renderLikedSongsPage(sortCriteria = 'recents') {
  document.body.classList.remove("library-page-active");
  document.body.classList.remove("search-page-active");
  document.body.classList.add("playlist-view-active");

  const contentArea = getContentArea();
  if (!contentArea) return;

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) scrollContainer.classList.add("no-padding");

  contentArea.innerHTML = `<div class="page-view"><p>Loading Liked Songs...</p></div>`;

  try {
    const data = await PlaylistService.getUserLibrary();
    let likedSongs = data.likedSongs || [];
    likedSongs = sortSongs(likedSongs, sortCriteria);

    const mockPlaylist = { _id: "liked-songs", name: "Liked Songs", description: "Your favorite tracks, all in one place.", songs: likedSongs, coverImageUrl: "images/media controls/favourite.png", owner: { name: "You" } };
    const songCount = likedSongs.length;
    const bgColor = "rgb(79, 70, 229)"; const textColor = "white";
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const songListHTML = likedSongs.map((song, index) => {
        const artistNames = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        const durationMin = Math.floor((song.duration || 0) / 60); const durationSec = (song.duration || 0) % 60;
        const artwork = song.artworkUrl || song.imageUrl || "images/default-album.webp";
        return `
            <div class="playlist-song-row" data-index="${index}" data-song-id="${song._id}">
               <div class="song-index"><img src="${artwork}" class="song-list-art" loading="lazy"></div>
               <div class="song-main-info"><div class="song-title-row">${song.title}</div><div class="song-artist-row">${artistNames}</div></div>
               <div class="song-album-info">${song.album || ''}</div><div class="song-duration">${durationMin}:${durationSec.toString().padStart(2, "0")}</div>
               <div class="song-options"><button class="card-options-btn" data-song-id="${song._id}" onclick="event.stopPropagation();"><img src="images/icons/more.png" alt="Options" /></button></div>
            </div>`;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-mode" style="background: var(--color-background-surface);">
            <div class="mobile-sticky-header" id="liked-sticky-header">
               <button class="sticky-back-btn" onclick="window.history.back()"><img src="images/icons/back.png" alt="Back" class="icon-adaptive"></button>
               <span class="sticky-title">Liked Songs</span><div style="width: 24px;"></div>
            </div>
            <div class="playlist-header">
               <div class="header-top-row"><div class="playlist-cover-wrapper"><img src="${mockPlaylist.coverImageUrl}" alt="Liked Songs" class="playlist-cover" style="background: linear-gradient(135deg, #450af5, #c4efd9); object-fit: contain;"></div>
                   <div class="playlist-info"><span class="playlist-type" style="color: ${textColor}; opacity: 0.8;">Playlist</span><h1 class="playlist-title" style="color: ${textColor}">Liked Songs</h1><div class="playlist-meta" style="color: ${textColor}; opacity: 0.7;"><span class="playlist-owner">You</span><span class="bullet">•</span><span>${songCount} songs</span></div></div>
               </div>
               <div class="play-shuffle-row"><button class="play-btn-pill" id="liked-play-btn"><img src="images/media controls/play.png" class="btn-icon"> Play</button><button class="shuffle-btn-pill" id="liked-shuffle-btn"><img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle</button><button class="action-icon-btn sort-trigger-btn" id="liked-mobile-sort-btn" title="Sort"><img src="images/icons/sort.png" class="icon-adaptive" style="width:24px; height:24px;"></button></div>
            </div>
            <div class="playlist-songs-list">${songListHTML}</div>
          </div>`;

      // MOBILE LIKED DELEGATION
      const container = contentArea.querySelector('.playlist-songs-list');
      if (container) {
        container.addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row || e.target.closest('.card-options-btn')) return;
          playSongFromPlaylist(likedSongs, parseInt(row.dataset.index));
        });
      }

      const stickyHeader = contentArea.querySelector("#liked-sticky-header");
      if (stickyHeader && scrollContainer) { scrollContainer.onscroll = () => { if (scrollContainer.scrollTop > 150) stickyHeader.classList.add("visible"); else stickyHeader.classList.remove("visible"); }; }
      const mbSortBtn = contentArea.querySelector("#liked-mobile-sort-btn");
      if (mbSortBtn && window.BottomSheetManager) mbSortBtn.addEventListener("click", () => window.BottomSheetManager.open('sort-options', { options: [{ label: 'Recents', value: 'recents' }, { label: 'Title (A-Z)', value: 'title' }, { label: 'Artist', value: 'artist' }], onSelect: (c) => renderLikedSongsPage(c) }));

    } else {
      // DESKTOP LIKED SONGS
      const songListHeaderHTML = `<div class="song-list-header"><div class="col-header col-index">#</div><div class="col-header col-title">Title</div><div class="col-header col-album">Album</div><div class="col-header col-right col-duration"><img src="images/icons/clock.png" class="icon-adaptive small icon-clock"></div></div>`;
      let songsListRowsHTML = `<div class="playlist-song-list">` + likedSongs.map((song, index) => {
        const artistName = (song.artists && song.artists.length > 0) ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        return `
          <div class="playlist-row song-item" data-index="${index}" data-id="${song._id}">
            <div class="col-index"><span class="index-num">${index + 1}</span><span class="play-icon-row">▶</span></div>
            <div class="col-title"><img src="${song.artworkUrl || 'images/default-album.webp'}" alt="${song.title}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${artistName}</span></div></div>
            <div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div>
            <div class="col-actions"><button class="icon-btn small remove-song-btn" data-song-id="${song._id}" title="Remove from Liked Songs"><img src="images/media controls/favourite-filled.png" class="icon-adaptive small icon-trash" style="filter: brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(1989%) hue-rotate(307deg) brightness(91%) contrast(92%);"></button></div>
          </div>`;
      }).join("") + `</div>`;

      contentArea.innerHTML = `
          <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
            <div class="playlist-header-dynamic" id="main-header"><div class="header-content-wrapper"><img src="${mockPlaylist.coverImageUrl}" alt="Liked Songs" class="playlist-cover-large" style="background: linear-gradient(135deg, #450af5, #c4efd9); object-fit: contain;"><div class="playlist-details-large"><span class="playlist-label">Playlist</span><h1 class="playlist-title-large">Liked Songs</h1><p class="playlist-description"><span class="owner-name">You</span> • <span class="song-count">${songCount} songs</span></p></div></div></div>
            <div class="playlist-sticky-group" id="sticky-group"><div class="playlist-actions-bar" id="actions-bar"><div class="actions-left"><button class="action-play-btn" id="liked-play-btn"><img src="images/media controls/play.png" alt="Play"></button><button class="action-icon-btn sort-trigger-btn" id="liked-dk-sort-btn" title="Sort"><img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort"></button></div><span class="sticky-group-title">Liked Songs</span></div>${songListHeaderHTML}</div>
            <div class="song-list-container">${songsListRowsHTML}</div>
          </div>`;

      if (scrollContainer) { scrollContainer.onscroll = () => { const y = scrollContainer.scrollTop; if (y > 300) stickyGroup.classList.add("stuck"); else stickyGroup.classList.remove("stuck"); if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (y/280)); }; }
      
      // DESKTOP LIKED DELEGATION
      const desktopContainer = contentArea.querySelector(".playlist-song-list");
      if (desktopContainer) {
        desktopContainer.addEventListener("click", (e) => {
          const item = e.target.closest('.song-item');
          if (!item || e.target.closest('.remove-song-btn')) return;
          playSongFromPlaylist(likedSongs, parseInt(item.dataset.index));
        });
      }

      contentArea.querySelectorAll(".remove-song-btn").forEach(btn => { btn.addEventListener("click", async (e) => { e.stopPropagation(); try { await PlaylistService.removeFromLikedSongs(btn.dataset.songId); renderLikedSongsPage(); } catch (err) { alert("Failed to unlike song"); } }); });
      const dkSortBtn = contentArea.querySelector("#liked-dk-sort-btn");
      if (dkSortBtn) dkSortBtn.addEventListener("click", () => { const choice = prompt(`Sort By:\nrecents, title, artist`, sortCriteria); if (choice && ['recents', 'title', 'artist'].includes(choice)) renderLikedSongsPage(choice); });
    }

    const playBtn = contentArea.querySelector("#liked-play-btn");
    if (playBtn && likedSongs.length > 0) playBtn.addEventListener("click", () => playSongFromPlaylist(likedSongs, 0));
    if (window.registerPlaylist) window.registerPlaylist(mockPlaylist);

  } catch (err) { console.error("Error rendering Liked Songs:", err); contentArea.innerHTML = `<div class="page-view error"><p>Error loading Liked Songs</p></div>`; }
}

/**
 * Renders the Recently Played history page.
 */
export async function renderRecentlyPlayedPage(sortCriteria = 'recents') {
  const contentArea = getContentArea();
  if (!contentArea) return;
  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) scrollContainer.classList.add("no-padding");
  contentArea.innerHTML = `<div class="page-view"><p>Loading history...</p></div>`;

  try {
    const historyData = await HistoryService.getHistory();
    const songs = historyData.map(item => ({ ...item.song, playedAt: item.playedAt }));
    const coverImage = "images/icons/history.png"; const songCount = songs.length;
    const totalMinutes = Math.floor(songs.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
    const sortedSongs = sortSongs(songs, sortCriteria);
    const bgColor = "rgb(29, 185, 84)";
    document.body.classList.add('playlist-view-active');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const mobileList = sortedSongs.map((song, index) => {
        const artist = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        return `<div class="playlist-song-row" data-index="${index}" data-song-id="${song._id}"><div class="song-index"><img src="${song.artworkUrl || 'images/default-album.webp'}" class="song-list-art"></div><div class="song-main-info"><div class="song-title-row">${song.title}</div><div class="song-artist-row">${artist}</div></div><div class="song-options"><button class="card-options-btn" data-song-id="${song._id}"><img src="images/icons/more.png" alt="Options" /></button></div></div>`;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-mode" style="background: var(--color-background-surface);">
            <div class="mobile-sticky-header" id="mobile-history-sticky"><button class="sticky-back-btn" onclick="window.history.back()"><img src="images/icons/back.png" alt="Back" class="icon-adaptive"></button><span class="sticky-title">Recently Played</span><div style="width: 24px;"></div></div>
            <div class="playlist-header">
               <div class="header-top-row"><div class="playlist-cover-wrapper"><img src="${coverImage}" alt="Recently Played" class="playlist-cover" onerror="this.src='images/music.webp'" style="padding: 20px; background: linear-gradient(135deg, #1db954, #191414);"></div>
                   <div class="playlist-info"><span class="playlist-type">History</span><h1 class="playlist-title">Recently Played</h1><div class="playlist-meta"><span>Stored locally</span><span class="bullet">•</span><span>${songCount} songs</span></div></div>
               </div>
               <div class="play-shuffle-row" style="padding: 1rem; padding-top: 0;"><button class="action-icon-btn sort-trigger-btn" id="history-mobile-sort-btn" title="Sort" style="margin-left: auto;"><img src="images/icons/sort.png" class="icon-adaptive" style="width:24px; height:24px;"></button></div>
            </div>
            <div class="playlist-songs-list">${mobileList}</div>
          </div>`;

      if (scrollContainer) { scrollContainer.onscroll = () => { if (scrollContainer.scrollTop > 150) stickyHeader.classList.add("visible"); else stickyHeader.classList.remove("visible"); }; }
      const stickyHeader = contentArea.querySelector("#mobile-history-sticky");
      
      // MOBILE HISTORY DELEGATION
      const container = contentArea.querySelector('.playlist-songs-list');
      if (container) {
        container.addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row) return;
          const index = parseInt(row.dataset.index);
          const song = sortedSongs[index];
          if (e.target.closest('.card-options-btn')) {
            if (window.BottomSheetManager) window.BottomSheetManager.open('song', song);
          } else {
            playSongFromPlaylist(sortedSongs, index);
          }
        });
      }

      const mbSortBtn = contentArea.querySelector("#history-mobile-sort-btn");
      if (mbSortBtn && window.BottomSheetManager) mbSortBtn.addEventListener("click", () => window.BottomSheetManager.open('sort-options', { options: [{ label: 'Recently Played', value: 'recents' }, { label: 'Title (A-Z)', value: 'title' }, { label: 'Artist', value: 'artist' }], onSelect: (c) => renderRecentlyPlayedPage(c) }));
    } else {
      // DESKTOP HISTORY
      contentArea.innerHTML = `
        <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: white;">
          <div class="playlist-header-dynamic" id="history-main-header"><div class="header-content-wrapper"><img src="${coverImage}" class="playlist-cover-large" onerror="this.src='images/music.webp'" style="padding: 40px; background: linear-gradient(135deg, #1db954, #191414);"><div class="playlist-details-large"><span class="playlist-label">Virtual Playlist</span><h1 class="playlist-title-large">Recently Played</h1><p class="playlist-description"><span>Your History</span> • <span>${songCount} songs</span>, <span>about ${totalMinutes} min</span></p></div></div></div>
          <div class="playlist-sticky-group" id="history-sticky-group"><div class="playlist-actions-bar"><div class="actions-left"><button class="action-play-btn" id="history-play-btn"><img src="images/media controls/play.png" alt="Play"></button><button class="action-icon-btn sort-trigger-btn" id="history-dk-sort-btn" title="Sort"><img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort"></button></div><span class="sticky-group-title">Recently Played</span></div>
            <div class="song-list-header"><div class="col-header col-index">#</div><div class="col-header col-title">Title</div><div class="col-header col-album">Album</div><div class="col-header col-right col-duration"><img src="images/icons/clock.png" class="icon-adaptive small icon-clock"></div></div>
          </div>
          <div class="song-list-container"><div class="playlist-song-list">` + sortedSongs.map((song, index) => `<div class="playlist-row song-item" data-index="${index}"><div class="col-index"><span class="index-num">${index+1}</span><span class="play-icon-row">▶</span></div><div class="col-title"><img src="${song.artworkUrl || 'images/music.webp'}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${song.artists ? song.artists.map(a=>a.name).join(", ") : "Unknown"}</span></div></div><div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div></div>`).join("") + `</div></div>
        </div>`;
      if (scrollContainer) { scrollContainer.onscroll = () => { const y = scrollContainer.scrollTop; if (y > 300) stickyGroup.classList.add("stuck"); else stickyGroup.classList.remove("stuck"); if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (y/280)); }; }
      const stickyGroup = contentArea.querySelector("#history-sticky-group");
      const mainHeader = contentArea.querySelector("#history-main-header");
      const playBtn = contentArea.querySelector("#history-play-btn");
      if (playBtn && sortedSongs.length > 0) playBtn.onclick = () => playSongFromPlaylist(sortedSongs, 0);
      const dkSortBtn = contentArea.querySelector("#history-dk-sort-btn");
      if (dkSortBtn) dkSortBtn.onclick = () => { const c = prompt("Sort By: recents, title, artist", sortCriteria); if (c && ['recents', 'title', 'artist'].includes(c)) renderRecentlyPlayedPage(c); };
      
      // DESKTOP HISTORY DELEGATION
      const desktopHistoryContainer = contentArea.querySelector(".playlist-song-list");
      if (desktopHistoryContainer) {
        desktopHistoryContainer.addEventListener("click", (e) => {
          const item = e.target.closest('.song-item');
          if (!item) return;
          playSongFromPlaylist(sortedSongs, parseInt(item.dataset.index));
        });
      }
    }
  } catch (err) { console.error("Error history:", err); contentArea.innerHTML = `<div class="page-view"><p>Error history</p></div>`; }
}

/**
 * Renders a generic detail page template.
 */
export function renderDetailPage(type, name) {
  const contentArea = getContentArea();
  if (!contentArea) return;
  contentArea.innerHTML = `<div class="page-view"><button class="back-btn">&#10094; Go Back</button><h1>${type}: ${name}</h1><p>Built in future phase.</p></div>`;
  contentArea.querySelector(".back-btn").addEventListener("click", () => window.history.back());
}

