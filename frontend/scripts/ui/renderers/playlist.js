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
  if (scrollContainer) scrollContainer.classList.add("no-padding");

  if (!contentArea.querySelector('.playlist-view-container')) {
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

    document.body.classList.add('playlist-view-active');

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // --- MOBILE RENDER ---
      const mobileSongRowsHTML = songs.map((song, index) => {
        let artistNames = "Unknown Artist";
        if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
          artistNames = song.artists.map(a => a.name || a).join(", ");
        } else if (song.artistName) {
          artistNames = song.artistName;
        }
        
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
               <button class="song-more-btn" data-song-id="${song._id}">
                 <img src="images/icons/more.png" alt="Options" />
               </button>
             </div>
          </div>`;
      }).join("");

      contentArea.innerHTML = `
        <div class="page-view playlist-view-container" style="background: var(--color-view-playlist-bg);">
          <button class="mobile-hero-back-btn" onclick="window.history.back()" title="Go back">
             <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
          </button>
          <div class="mobile-playlist-header-clean">
             
             <div class="header-main-content">
                <div class="header-cover-box">
                   <img src="${coverImage}" alt="${playlist.name}" class="header-cover-img">
                </div>
                <div class="header-text-box">
                   <span class="header-subtitle">Playlist</span>
                   <h1 class="header-title">${playlist.name}</h1>
                   <div class="header-meta">
                      <span class="meta-label">VibAura Collection</span>
                      <span class="meta-separator">•</span>
                      <span class="meta-count">${songCount} songs</span>
                   </div>
                </div>
             </div>

             <div class="header-actions-row">
                <div class="play-shuffle-row-mobile">
                   <button class="play-btn-pill" id="mobile-play-btn">
                      <img src="images/media controls/play.png" class="btn-icon"> Play
                   </button>
                   <button class="shuffle-btn-pill" id="mobile-shuffle-btn">
                      <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
                   </button>
                </div>
                <button class="action-icon-btn sort-trigger-btn" id="mobile-sort-btn" title="Sort">
                   <img src="images/icons/sort.png" class="icon-adaptive">
                </button>
             </div>
          </div>

          <div class="playlist-songs-list">${mobileSongRowsHTML}</div>
          ${songs.length === 0 ? '<div class="empty-list">No songs yet</div>' : ''}
        </div>`;

      if (scrollContainer) {
        scrollContainer.classList.add("no-padding");
        scrollContainer.style.background = "var(--color-view-playlist-bg)";
        
        const stickyHeader = contentArea.querySelector('.mobile-playlist-header-clean');
        if (stickyHeader) {
          scrollContainer.onscroll = () => {
            if (scrollContainer.scrollTop > 50) {
              stickyHeader.classList.add("stuck");
            } else {
              stickyHeader.classList.remove("stuck");
            }
          };
        }
      }

      const songListContainer = contentArea.querySelector('.playlist-songs-list');
      if (songListContainer) {
        songListContainer.addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row) return;
          const songIndex = parseInt(row.dataset.index);
          const song = songs[songIndex];
          if (e.target.closest('.song-more-btn')) {
            e.stopPropagation();
            if (window.BottomSheetManager && song) window.BottomSheetManager.open('song', song);
            return;
          }
          playSongFromPlaylist(songs, songIndex);
        });
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
        mbSortBtn.addEventListener("click", () => window.BottomSheetManager.open('sort-options', { options: [{ label: 'Recents', value: 'recents' }, { label: 'Title (A-Z)', value: 'title' }, { label: 'Artist', value: 'artist' }], onSelect: (c) => renderPlaylistPage(playlistId, c) }));
      }
      return;
    }

    // --- DESKTOP RENDER ---
    let songsListRowsHTML = `<div class="playlist-song-list">` + songs.map((song, index) => {
      const artistNames = (song.artists && song.artists.length > 0) ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
      return `
        <div class="playlist-row song-item" data-index="${index}" data-id="${song._id}">
          <div class="col-index"><span class="index-num">${index + 1}</span><span class="play-icon-row">▶</span></div>
          <div class="col-title"><img src="${song.artworkUrl}" alt="${song.title}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${artistNames}</span></div></div>
          <div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div>
          <div class="col-options">
             <button class="song-more-btn" data-index="${index}">
                <img src="images/icons/more.png" alt="More" class="icon-adaptive">
             </button>
          </div>
        </div>`;
    }).join("") + `</div>`;

    contentArea.innerHTML = `
      <div class="page-view playlist-view-container" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
        <div class="playlist-header-dynamic" id="main-header">
           <div class="header-content-wrapper">
             <img src="${coverImage}" alt="${playlist.name}" class="playlist-cover-large">
             <div class="playlist-details-large">
               <span class="playlist-label">Playlist</span>
               <h1 class="playlist-title-large">${playlist.name}</h1>
               <p class="playlist-description">
                 <span class="owner-name">${playlist.owner?.name || 'VibAura'}</span> • 
                 <span class="song-count">${songCount} songs</span>, 
                 <span class="total-duration">${durationText}</span>
               </p>
             </div>
           </div>
        </div>
        
        <div class="playlist-sticky-group" id="sticky-group">
            <div class="playlist-actions-bar" id="actions-bar">
               <div class="desktop-action-pills">
                  <button class="action-play-pill" id="playlist-play-btn">
                    <img src="images/media controls/play.png" alt="Play">
                    <span>Play Now</span>
                  </button>
                  <button class="action-shuffle-pill" id="playlist-shuffle-btn">
                    <img src="images/media controls/shuffle.png" alt="Shuffle">
                    <span>Shuffle</span>
                  </button>
               </div>

               <div class="playlist-right-actions">
                  <button class="action-icon-btn sort-trigger-btn" id="dk-playlist-sort-btn" title="Sort Songs">
                      <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                  </button>
                  ${isOwner ? `
                        <button class="action-icon-btn" id="rename-playlist-btn" title="Rename">
                            <img src="images/icons/edit.png" alt="Edit" class="icon-adaptive icon-edit">
                        </button>
                    ` : isSaved ? `
                        <button class="action-icon-btn" id="save-library-btn" title="Already in Linked" style="cursor: default;">
                            <img src="images/icons/check.png" alt="Saved" class="icon-adaptive icon-check">
                        </button>` : `
                        <button class="action-icon-btn" id="save-library-btn" title="Save to Library">
                            <img src="images/icons/plus.png" alt="Save" class="icon-adaptive icon-save">
                        </button>`
                  }
                  <span class="sticky-group-title">${playlist.name}</span>
               </div>
            </div>
            </div>

        <div class="song-list-container">
           <h2 class="section-title">Songs</h2>
           ${songsListRowsHTML}
        </div>
      </div>`;

    const playlistShuffleBtn = contentArea.querySelector("#playlist-shuffle-btn");
    if (playlistShuffleBtn && songs.length > 0) {
      playlistShuffleBtn.addEventListener("click", () => {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        playSongFromPlaylist(shuffled, 0);
      });
    }

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
        if (!item) return;
        
        const songIndex = parseInt(item.dataset.index);
        const song = songs[songIndex];

        // Handle More Options Button (Desktop)
        if (e.target.closest('.song-more-btn')) {
           e.stopPropagation();
           if (window.ContextMenuManager) {
              window.ContextMenuManager.open(e, 'song', song); // CORRECTED: .open() instead of .show()
           }
           return;
        }

        playSongFromPlaylist(songs, songIndex);
      });
    }

    if (isOwner) {
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

    const dkSortBtn = contentArea.querySelector("#dk-playlist-sort-btn");
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
  const contentArea = getContentArea();
  if (!contentArea) return;

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer) scrollContainer.classList.add("no-padding");
  document.body.classList.add("playlist-view-active");

  contentArea.innerHTML = `<div class="page-view"><p>Loading Liked Songs...</p></div>`;

  try {
    const data = await PlaylistService.getUserLibrary();
    let likedSongs = data.likedSongs || [];
    likedSongs = sortSongs(likedSongs, sortCriteria);

    const mockPlaylist = { _id: "liked-songs", name: "Liked Songs", description: "Your tracks", coverImageUrl: "images/media controls/favourite.png", owner: { name: "You" } };
    const songCount = likedSongs.length;
    const rgb = await getDominantColor(mockPlaylist.coverImageUrl);
    const bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const isMobile = window.innerWidth <= 768;

    document.body.classList.add("playlist-view-active");

    if (isMobile) {
      if (scrollContainer && scrollContainer.classList.contains("content")) {
        scrollContainer.style.background = "var(--color-view-playlist-bg)";
      }
      // --- MOBILE LIKED SONGS ---
      const songListHTML = likedSongs.map((song, index) => {
        const artistNames = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        const artwork = song.artworkUrl || song.imageUrl || "images/default-album.webp";
        return `
            <div class="playlist-song-row" data-index="${index}" data-song-id="${song._id}">
               <div class="song-index"><img src="${artwork}" class="song-list-art"></div>
               <div class="song-main-info">
                  <div class="song-title-row">${song.title}</div>
                  <div class="song-artist-row">${artistNames}</div>
               </div>
               <div class="song-options">
                  <button class="song-more-btn" data-song-id="${song._id}">
                    <img src="images/icons/more.png" alt="Options" />
                  </button>
               </div>
            </div>`;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-view-container" style="background: var(--color-view-playlist-bg);">
            <button class="mobile-hero-back-btn" onclick="window.history.back()" title="Go back">
               <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
            </button>
            <div class="mobile-playlist-header-clean">
               <div class="header-main-content">
                  <div class="header-cover-box" style="background: linear-gradient(135deg, #450af5, #c4efd9); display: flex; align-items: center; justify-content: center;">
                     <img src="${mockPlaylist.coverImageUrl}" alt="Liked" class="header-cover-img" style="width: 60%; height: 60%; object-fit: contain;">
                  </div>
                  <div class="header-text-box">
                     <span class="header-subtitle">Playlist</span>
                     <h1 class="header-title">Liked Songs</h1>
                     <div class="header-meta"><span>By You</span><span>•</span><span>${songCount} songs</span></div>
                  </div>
               </div>
               <div class="header-actions-row">
                  <div class="play-shuffle-row-mobile">
                     <button class="play-btn-pill" id="liked-play-btn">
                        <img src="images/media controls/play.png" class="btn-icon"> Play
                     </button>
                     <button class="shuffle-btn-pill" id="liked-shuffle-btn">
                        <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
                     </button>
                  </div>
                  <button class="action-icon-btn sort-trigger-btn" id="liked-sort-btn" title="Sort Songs">
                      <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                  </button>
               </div>
            </div>
            <div class="playlist-songs-list">${songListHTML}</div>
          </div>`;

      contentArea.querySelector('.playlist-songs-list').addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row) return;
          const song = likedSongs[parseInt(row.dataset.index)];
          if (e.target.closest('.song-more-btn')) {
            e.stopPropagation();
            if (window.BottomSheetManager) window.BottomSheetManager.open('song', song);
          } else {
            playSongFromPlaylist(likedSongs, parseInt(row.dataset.index));
          }
      });
    } else {
      // --- DESKTOP LIKED SONGS ---
      let songsListRowsHTML = `<div class="playlist-song-list">` + likedSongs.map((song, index) => {
        const artistNames = (song.artists && song.artists.length > 0) ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        return `
          <div class="playlist-row song-item" data-index="${index}">
            <div class="col-index"><span class="index-num">${index + 1}</span><span class="play-icon-row">▶</span></div>
            <div class="col-title"><img src="${song.artworkUrl || 'images/default-album.webp'}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${artistNames}</span></div></div>
            <div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div>
            <div class="col-options">
               <button class="song-more-btn" data-index="${index}">
                  <img src="images/icons/more.png" alt="More" class="icon-adaptive">
               </button>
            </div>
          </div>`;
      }).join("") + `</div>`;

      contentArea.innerHTML = `
          <div class="page-view playlist-view-container" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
            <div class="playlist-header-dynamic" id="main-header">
              <div class="header-content-wrapper">
                <img src="${mockPlaylist.coverImageUrl}" alt="Liked Songs" class="playlist-cover-large" style="background: linear-gradient(135deg, #450af5, #c4efd9); object-fit: contain;">
                <div class="playlist-details-large">
                  <span class="playlist-label">Playlist</span>
                  <h1 class="playlist-title-large">Liked Songs</h1>
                  <p class="playlist-description"><span>VibAura Playlist</span> • <span>${songCount} songs</span></p>
                </div>
              </div>
            </div>
            <div class="playlist-sticky-group" id="sticky-group">
                <div class="playlist-actions-bar" id="actions-bar">
                   <div class="desktop-action-pills">
                      <button class="action-play-pill" id="liked-play-btn"><img src="images/media controls/play.png"> <span>Play Now</span></button>
                      <button class="action-shuffle-pill" id="liked-shuffle-btn"><img src="images/media controls/shuffle.png"> <span>Shuffle</span></button>
                   </div>
                   <div class="playlist-right-actions">
                      <button class="action-icon-btn sort-trigger-btn" id="liked-sort-btn" title="Sort Songs">
                          <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                      </button>
                      <span class="sticky-group-title">Liked Songs</span>
                   </div>
                </div>
            </div>
            <div class="song-list-container"><h2 class="section-title">Songs</h2>${songsListRowsHTML}</div>
          </div>`;

      if (scrollContainer) { scrollContainer.onscroll = () => { const y = scrollContainer.scrollTop; if (y > 300) stickyGroup.classList.add("stuck"); else stickyGroup.classList.remove("stuck"); if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (y/280)); }; }
      const stickyGroup = contentArea.querySelector("#sticky-group");
      const mainHeader = contentArea.querySelector("#main-header");

      contentArea.querySelector(".playlist-song-list").addEventListener("click", (e) => {
        const item = e.target.closest('.song-item');
        if (!item) return;
        const song = likedSongs[parseInt(item.dataset.index)];
        if (e.target.closest('.song-more-btn')) {
           e.stopPropagation();
           if (window.ContextMenuManager) window.ContextMenuManager.open(e, 'song', song); // CORRECTED: .open()
           return;
        }
        playSongFromPlaylist(likedSongs, parseInt(item.dataset.index));
      });
    }

    const playBtn = contentArea.querySelector("#liked-play-btn");
    if (playBtn && likedSongs.length > 0) playBtn.addEventListener("click", () => playSongFromPlaylist(likedSongs, 0));
    const shuffleBtn = contentArea.querySelector("#liked-shuffle-btn");
    if (shuffleBtn && likedSongs.length > 0) shuffleBtn.addEventListener("click", () => playSongFromPlaylist([...likedSongs].sort(() => Math.random() - 0.5), 0));

  } catch (err) { console.error("Error Liked Songs:", err); contentArea.innerHTML = `<div class="page-view error"><p>Error loading Liked Songs</p></div>`; }
}

/**
 * Renders the Recently Played history page.
 */
export async function renderRecentlyPlayedPage(sortCriteria = 'recents') {
  const contentArea = getContentArea();
  if (!contentArea) return;

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer) scrollContainer.classList.add("no-padding");
  document.body.classList.add('playlist-view-active');
  contentArea.innerHTML = `<div class="page-view"><p>Loading history...</p></div>`;

  try {
    const historyData = await HistoryService.getHistory();
    const songs = historyData.map(item => ({ ...item.song, playedAt: item.playedAt }));
    const sortedSongs = sortSongs(songs, sortCriteria);
    const coverImage = "images/icons/history.png";
    const songCount = songs.length;
    const isMobile = window.innerWidth <= 768;

    document.body.classList.add('playlist-view-active');

    if (isMobile) {
      const mobileList = sortedSongs.map((song, index) => {
        const artist = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        return `
          <div class="playlist-song-row" data-index="${index}">
             <div class="song-index"><img src="${song.artworkUrl || 'images/default-album.webp'}" class="song-list-art"></div>
             <div class="song-main-info"><div class="song-title-row">${song.title}</div><div class="song-artist-row">${artist}</div></div>
             <div class="song-options"><button class="song-more-btn"><img src="images/icons/more.png" /></button></div>
          </div>`;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-view-container" style="background: var(--color-view-playlist-bg);">
            <button class="mobile-hero-back-btn" onclick="window.history.back()" title="Go back">
               <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
            </button>
            <div class="mobile-playlist-header-clean">
               <div class="header-main-content">
                  <div class="header-cover-box" style="background: linear-gradient(135deg, #1db954, #191414); display: flex; align-items: center; justify-content: center;">
                    <img src="${coverImage}" class="header-cover-img" style="width: 60%; height: 60%; object-fit: contain;">
                  </div>
                  <div class="header-text-box">
                    <span class="header-subtitle">Collection</span>
                    <h1 class="header-title">Recently Played</h1>
                    <div class="header-meta"><span>By You</span><span>•</span><span>${songCount} songs</span></div>
                  </div>
               </div>
               <div class="header-actions-row">
                  <div class="play-shuffle-row-mobile">
                     <button class="play-btn-pill" id="history-play-btn">
                        <img src="images/media controls/play.png" class="btn-icon"> Play
                     </button>
                     <button class="shuffle-btn-pill" id="history-shuffle-btn">
                        <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
                     </button>
                  </div>
                  <button class="action-icon-btn sort-trigger-btn" id="history-sort-btn" title="Sort Songs">
                      <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                  </button>
               </div>
            </div>
            <div class="playlist-songs-list">${mobileList}</div>
          </div>`;

      contentArea.querySelector('.playlist-songs-list').addEventListener('click', (e) => {
          const row = e.target.closest('.playlist-song-row');
          if (!row) return;
          const song = sortedSongs[parseInt(row.dataset.index)];
          if (e.target.closest('.song-more-btn')) {
            e.stopPropagation();
            if (window.BottomSheetManager) window.BottomSheetManager.open('song', song);
          } else {
            playSongFromPlaylist(sortedSongs, parseInt(row.dataset.index));
          }
      });
    } else {
      const rgb = await getDominantColor(coverImage);
      const bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      let songsListRowsHTML = `<div class="playlist-song-list">` + sortedSongs.map((song, index) => {
        const artist = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown";
        return `
          <div class="playlist-row song-item" data-index="${index}">
            <div class="col-index"><span class="index-num">${index+1}</span><span class="play-icon-row">▶</span></div>
            <div class="col-title"><img src="${song.artworkUrl || 'images/music.webp'}"><div class="song-meta-text"><span class="song-title-text">${song.title}</span><span class="song-artist-text">${artist}</span></div></div>
            <div class="col-album">${song.album || "Single"}</div><div class="col-duration">${formatTime(song.duration)}</div>
            <div class="col-options"><button class="song-more-btn"><img src="images/icons/more.png" class="icon-adaptive"></button></div>
          </div>`;
      }).join("") + `</div>`;

      contentArea.innerHTML = `
        <div class="page-view playlist-view-container" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
          <div class="playlist-header-dynamic" id="main-header">
            <div class="header-content-wrapper">
              <img src="${coverImage}" class="playlist-cover-large" style="padding: 40px; background: linear-gradient(135deg, #1db954, #191414); object-fit: contain;">
              <div class="playlist-details-large">
                <span class="playlist-label">Virtual Playlist</span>
                <h1 class="playlist-title-large">Recently Played</h1>
                <p class="playlist-description"><span>VibAura History</span> • <span>${songCount} songs</span></p>
              </div>
            </div>
          </div>
          <div class="playlist-sticky-group" id="sticky-group">
              <div class="playlist-actions-bar" id="actions-bar">
                 <div class="desktop-action-pills"><button class="action-play-pill" id="history-play-btn"><img src="images/media controls/play.png"> <span>Play Now</span></button></div>
                 <div class="playlist-right-actions">
                    <button class="action-icon-btn sort-trigger-btn" id="history-sort-btn" title="Sort Songs">
                        <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                    </button>
                    <span class="sticky-group-title">Recently Played</span>
                 </div>
              </div>
          </div>
          <div class="song-list-container"><h2 class="section-title">Songs</h2>${songsListRowsHTML}</div>
        </div>`;

      if (scrollContainer) { scrollContainer.onscroll = () => { const y = scrollContainer.scrollTop; if (y > 300) stickyGroup.classList.add("stuck"); else stickyGroup.classList.remove("stuck"); if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (y/280)); }; }
      const stickyGroup = contentArea.querySelector("#sticky-group");
      const mainHeader = contentArea.querySelector("#main-header");
      
      contentArea.querySelector(".playlist-song-list").addEventListener("click", (e) => {
        const item = e.target.closest('.song-item');
        if (!item) return;
        const song = sortedSongs[parseInt(item.dataset.index)];
        if (e.target.closest('.song-more-btn')) {
           e.stopPropagation();
           if (window.ContextMenuManager) window.ContextMenuManager.open(e, 'song', song); // CORRECTED: .open()
           return;
        }
        playSongFromPlaylist(sortedSongs, parseInt(item.dataset.index));
      });

      const playBtn = contentArea.querySelector("#history-play-btn");
      if (playBtn && sortedSongs.length > 0) playBtn.onclick = () => playSongFromPlaylist(sortedSongs, 0);

      const shuffleBtn = contentArea.querySelector("#history-shuffle-btn");
      if (shuffleBtn && sortedSongs.length > 0) {
        shuffleBtn.onclick = () => {
          const shuffled = [...sortedSongs].sort(() => Math.random() - 0.5);
          playSongFromPlaylist(shuffled, 0);
        };
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
