import { playSongFromPlaylist } from "../../player/playerProxy.js";
import { formatTime } from "../../utils/utils.js";
import { 
  getContentArea, 
  sortSongs, 
  getDominantColor, 
  getContrastColor 
} from "./utils.js";

/**
 * Renders the artist detail page.
 */
export async function renderArtistPage(artistId, sortCriteria = 'recents') {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  document.body.classList.remove("playlist-view-active");

  const mobileHeader = document.querySelector('.mobile-header');
  if (mobileHeader) {
    mobileHeader.style.display = 'none';
  }

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading artist...</p></div>`;

  try {
    const response = await fetch(`/api/artists/${artistId}`);
    if (!response.ok) throw new Error("Artist not found");

    const data = await response.json();
    const artist = data.artist;
    let songs = data.songs || [];

    songs = sortSongs(songs, sortCriteria);

    const artistImg = artist.artworkUrl || artist.imageUrl || "https://placehold.co/300x300?text=Artist";
    const songCount = songs.length;

    const normalizedSongs = songs.map(song => {
      let artistName = '';
      if (song.artists && song.artists.length > 0) {
        const firstArtist = song.artists[0];
        if (typeof firstArtist === 'string') {
          artistName = artist.name;
        } else {
          const validNames = song.artists
            .map(a => a.name)
            .filter(name => name && name.trim() !== '');
          artistName = validNames.length > 0 ? validNames.join(", ") : artist.name;
        }
      } else {
        artistName = artist.name;
      }
      return { ...song, artistName };
    });

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // --- MOBILE RENDER ---
      const mobileControlsHTML = `
        <div class="play-shuffle-row" style="padding: 1rem; padding-bottom: 0;">
            <button class="play-btn-pill" id="mobile-play-btn" style="flex: 1;">
                <img src="images/media controls/play.png" class="btn-icon"> Play
            </button>
            <button class="action-icon-btn sort-trigger-btn" id="mobile-sort-btn" title="Sort">
                <img src="images/icons/sort.png" class="icon-adaptive" style="width:24px; height:24px;">
            </button>
        </div>
      `;

      let songsHTML = "";
      if (normalizedSongs.length > 0) {
        songsHTML = normalizedSongs.map((song, index) => {
          const artistNames = song.artistName || artist.name;
          return `
          <div class="mobile-artist-song-item" data-index="${index}" data-song-id="${song._id}">
            <img src="${song.artworkUrl || 'images/music.webp'}" alt="${song.title}" class="mobile-artist-song-artwork">
            <div class="mobile-artist-song-info">
              <div class="mobile-artist-song-title">${song.title}</div>
              <div class="mobile-artist-song-artists">${artistNames}</div>
            </div>
            <button class="mobile-artist-song-more" data-song-index="${index}">
              <img src="images/icons/more.png" alt="More options">
            </button>
          </div>
        `;
        }).join('');
      } else {
        songsHTML = `<div class="mobile-artist-empty"><p>No songs available for this artist.</p></div>`;
      }

      contentArea.innerHTML = `
        <div class="mobile-artist-sticky-header" id="mobile-artist-sticky-header">
          <button class="sticky-back-btn" onclick="window.history.back()">
            <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
          </button>
        </div>
        <div class="page-view mobile-artist-page" style="background: var(--color-background-surface);">
          <div class="mobile-artist-hero">
            <img src="${artistImg}" alt="${artist.name}" class="mobile-artist-hero-image">
            <div class="mobile-artist-hero-overlay"></div>
            <button class="mobile-artist-back-btn" onclick="window.history.back()">
              <img src="images/icons/back.png" alt="Back">
            </button>
            <div class="mobile-artist-hero-info">
              <span class="artist-type-label">ARTIST</span>
              <h1 class="mobile-artist-name">${artist.name}</h1>
              <div class="artist-stats">${songCount} songs</div>
            </div>
          </div>
          <div class="mobile-artist-content">
            <h2 class="mobile-artist-section-title">Songs</h2>
            ${mobileControlsHTML}
            <div class="mobile-artist-song-list">
              ${songsHTML}
            </div>
          </div>
        </div>
      `;

      const stickyHeader = contentArea.querySelector('#mobile-artist-sticky-header');
      if (stickyHeader && scrollContainer) {
        scrollContainer.onscroll = () => {
          if (scrollContainer.scrollTop > 280) stickyHeader.classList.add("visible");
          else stickyHeader.classList.remove("visible");
        };
      }

      const mbSortBtn = contentArea.querySelector("#mobile-sort-btn");
      if (mbSortBtn) {
        mbSortBtn.addEventListener("click", () => {
          if (window.BottomSheetManager) {
            window.BottomSheetManager.open('sort-options', {
              options: [
                { label: 'Recents', value: 'recents' },
                { label: 'Title (A-Z)', value: 'title' },
                { label: 'Album', value: 'album' }
              ],
              onSelect: (criteria) => renderArtistPage(artistId, criteria)
            });
          }
        });
      }

      const playBtn = contentArea.querySelector("#mobile-play-btn");
      if (playBtn && normalizedSongs.length > 0) {
        playBtn.addEventListener("click", () => playSongFromPlaylist(normalizedSongs, 0));
      }

      const songListContainer = contentArea.querySelector('.mobile-artist-song-list');
      if (songListContainer) {
        let longPressTimer;
        const holdDuration = 500;

        songListContainer.addEventListener('click', (e) => {
          const item = e.target.closest('.mobile-artist-song-item');
          if (!item) return;

          const songIndex = parseInt(item.dataset.index);
          const song = normalizedSongs[songIndex];

          if (e.target.closest('.mobile-artist-song-more')) {
            e.stopPropagation();
            if (window.BottomSheetManager) window.BottomSheetManager.open('song', song);
            return;
          }

          if (item.dataset.longPressTriggered === 'true') {
            item.dataset.longPressTriggered = 'false';
            return;
          }

          playSongFromPlaylist(normalizedSongs, songIndex);
        });

        songListContainer.addEventListener('touchstart', (e) => {
          const item = e.target.closest('.mobile-artist-song-item');
          if (!item || e.target.closest('.mobile-artist-song-more')) return;

          item.dataset.longPressTriggered = 'false';
          longPressTimer = setTimeout(() => {
            item.dataset.longPressTriggered = 'true';
            if (navigator.vibrate) navigator.vibrate(50);
            const songIndex = parseInt(item.dataset.index);
            if (window.BottomSheetManager) window.BottomSheetManager.open('song', normalizedSongs[songIndex]);
          }, holdDuration);
        }, { passive: true });

        const cancelPress = () => clearTimeout(longPressTimer);
        songListContainer.addEventListener('touchend', cancelPress);
        songListContainer.addEventListener('touchmove', cancelPress);
      }

      return;
    }

    // --- DESKTOP RENDER ---
    const { r, g, b } = await getDominantColor(artistImg);
    const bgColor = `rgb(${r}, ${g}, ${b})`;
    const textColor = getContrastColor(r, g, b);

    let songsListHTML = "";
    if (songs.length > 0) {
      songsListHTML = `<div class="artist-song-list">`;
      songs.forEach((song, index) => {
        songsListHTML += `
          <div class="artist-row song-item" data-index="${index}">
            <div class="col-index">
              <span class="index-num">${index + 1}</span>
              <span class="play-icon-row">▶</span>
            </div>
            <div class="col-title">
              <img src="${song.artworkUrl}" alt="${song.title}">
              <div class="song-meta-text">
                <span class="song-title-text">${song.title}</span>
              </div>
            </div>
            <div class="col-album">${song.album || "Single"}</div>
            <div class="col-duration">${formatTime(song.duration)}</div>
          </div>
        `;
      });
      songsListHTML += `</div>`;
    } else {
      songsListHTML = `<div class="empty-state"><p>No songs available.</p></div>`;
    }

    contentArea.innerHTML = `
      <div class="page-view artist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: ${textColor};">
        <div class="artist-header-dynamic" id="artist-header">
           <div class="artist-header-content">
              <img src="${artistImg}" alt="${artist.name}" class="artist-img-large">
              <div class="artist-details-large">
                 <div class="verified-bade">
                    <img src="images/icons/verified.png" class="verified-icon" alt="Verified">
                    Verified Artist
                 </div>
                 <h1 class="artist-title-large">${artist.name}</h1>
                 <p class="artist-stats">${songCount} songs • 1,234,567 monthly listeners</p>
              </div>
           </div>
        </div>
        <div class="artist-sticky-group" id="artist-sticky">
            <div class="artist-actions-bar">
               <button class="action-play-btn" id="artist-play-btn">
                 <img src="images/media controls/play.png" alt="Play">
               </button>
               <button class="action-follow-btn">Follow</button>
               <button class="action-icon-btn sort-trigger-btn" id="dk-artist-sort-btn" title="Sort">
                  <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
               </button>
               <span class="sticky-artist-name">${artist.name}</span>
            </div>
        </div>
        <div class="artist-content-container">
           <div class="section-title">Popular</div>
           ${songsListHTML}
           <div class="section-title">Discography</div>
           <div class="discography-grid">
               ${songs.map(s => `
                  <div class="discography-card">
                      <img src="${s.artworkUrl}" class="discography-img">
                      <div class="discography-title">${s.album || "Single"}</div>
                      <div class="discography-year">2024 • Single</div>
                  </div>
               `).slice(0, 4).join('')}
           </div>
        </div>
      </div>
    `;

    const stickyGroup = contentArea.querySelector("#artist-sticky");
    const mainHeader = contentArea.querySelector("#artist-header");
    const mainPlayBtn = contentArea.querySelector("#artist-play-btn");
    
    if (songs.length > 0 && mainPlayBtn) {
      mainPlayBtn.addEventListener("click", () => playSongFromPlaylist(songs, 0));
    }

    const dkSortBtn = contentArea.querySelector("#dk-artist-sort-btn");
    if (dkSortBtn) {
      dkSortBtn.addEventListener("click", () => {
        const choice = prompt(`Sort By:\nrecents, title, album`, sortCriteria);
        if (choice && ['recents', 'title', 'album'].includes(choice)) {
          renderArtistPage(artistId, choice);
        }
      });
    }

    scrollContainer.onscroll = () => {
      const scrollY = scrollContainer.scrollTop;
      if (scrollY > 300) stickyGroup.classList.add("stuck");
      else stickyGroup.classList.remove("stuck");
      if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
    };

    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", () => {
        playSongFromPlaylist(songs, parseInt(item.dataset.index));
      });
    });

  } catch (error) {
    console.error("Error rendering artist page:", error);
    contentArea.innerHTML = `
      <div class="page-view"><p class="error-message">Could not load artist. Please try again.</p></div>`;
  }
}
