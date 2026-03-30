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

  document.body.classList.remove("playlist-view-active", "search-page-active");
  document.body.classList.add("artist-page-active");

  const scrollContainer = contentArea.parentElement;
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    if (scrollContainer && scrollContainer.classList.contains("content")) {
      scrollContainer.classList.add("no-padding");
      scrollContainer.style.backgroundColor = "var(--color-view-artist-bg)";
    }
    contentArea.style.backgroundColor = "var(--color-view-artist-bg)";
  } else {
    contentArea.style.backgroundColor = "";
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

  // --- Shuffle Utility ---
  const shuffleAndPlay = (songArray) => {
    const shuffled = [...songArray].sort(() => Math.random() - 0.5);
    playSongFromPlaylist(shuffled, 0);
  };

  if (isMobile) {
    // --- MOBILE RENDER (Horizontal Header Style) ---
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

    const mobileControlsHTML = `
      <div class="mobile-playlist-actions">
          <div class="play-shuffle-row">
              <button class="play-btn-pill" id="mobile-play-btn">
                  <img src="images/media controls/play.png" class="btn-icon"> Play
              </button>
              <button class="shuffle-btn-pill" id="mobile-shuffle-btn">
                  <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
              </button>
          </div>
          <button class="action-icon-btn sort-trigger-btn" id="mobile-sort-btn" title="Sort">
              <img src="images/icons/sort.png" class="icon-adaptive" style="width:24px; height:24px;">
          </button>
      </div>
    `;

    contentArea.innerHTML = `
      <div class="mobile-artist-sticky-header" id="mobile-artist-sticky-header">
        <button class="sticky-back-btn" onclick="window.history.back()">
          <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
        </button>
        <span class="sticky-artist-name-mobile">${artist.name}</span>
      </div>
      <div class="page-view mobile-artist-page" style="background: var(--color-view-artist-bg);">
        <button class="mobile-hero-back-btn" onclick="window.history.back()" title="Go back">
           <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
        </button>
        <div class="mobile-artist-header-clean">
          <div class="mobile-header-top-row">
            <div class="mobile-artist-img-wrapper">
               <img src="${artistImg}" alt="${artist.name}" class="mobile-artist-circular-img">
            </div>
            <div class="mobile-artist-info-clean">
               <span class="artist-type-label">ARTIST</span>
               <h1 class="mobile-artist-name-clean">${artist.name}</h1>
               <div class="artist-stats-clean">${songCount} songs</div>
            </div>
          </div>
          ${mobileControlsHTML}
        </div>
        <div class="mobile-artist-content">
          <h2 class="mobile-artist-section-title">Popular Tracks</h2>
          <div class="mobile-artist-song-list">
            ${songsHTML}
          </div>
        </div>
      </div>
    `;

    const stickyHeader = contentArea.querySelector('#mobile-artist-sticky-header');
    const mbPlayBtn = contentArea.querySelector("#mobile-play-btn");
    const mbShuffleBtn = contentArea.querySelector("#mobile-shuffle-btn");

    if (mbPlayBtn && normalizedSongs.length > 0) {
      mbPlayBtn.addEventListener("click", () => playSongFromPlaylist(normalizedSongs, 0));
    }
    if (mbShuffleBtn && normalizedSongs.length > 0) {
      mbShuffleBtn.addEventListener("click", () => shuffleAndPlay(normalizedSongs));
    }

    if (stickyHeader && scrollContainer) {
      scrollContainer.classList.add("no-padding");
      scrollContainer.style.background = "var(--color-view-artist-bg)";
      
      const onScroll = () => {
        if (scrollContainer.scrollTop > 180) {
          stickyHeader.classList.add("visible");
        } else {
          stickyHeader.classList.remove("visible");
        }
      };
      scrollContainer.addEventListener('scroll', onScroll);
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
        let songArtist = "Unknown Artist";
        if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
          songArtist = song.artists.map(a => a.name || a).join(", ");
        } else {
          songArtist = song.artistName || artist.name || "Unknown Artist";
        }
        songsListHTML += `
          <div class="artist-row song-item" data-index="${index}" data-id="${song._id}">
            <div class="col-index">
              <span class="index-num">${index + 1}</span>
              <span class="play-icon-row">▶</span>
            </div>
            <div class="col-title">
              <img src="${song.artworkUrl || 'images/music.webp'}" alt="${song.title}">
              <div class="song-meta-text">
                <span class="song-title-text">${song.title}</span>
                <span class="song-artist-text">${songArtist}</span>
              </div>
            </div>
            <div class="col-album">${song.album || "Single"}</div>
            <div class="col-duration">${formatTime(song.duration)}</div>
            <div class="col-options">
               <button class="song-more-btn" data-index="${index}">
                  <img src="images/icons/more.png" alt="More" class="icon-adaptive">
               </button>
            </div>
          </div>
        `;
      });
      songsListHTML += `</div>`;
    } else {
      songsListHTML = `<div class="empty-state"><p>No songs available.</p></div>`;
    }

    contentArea.innerHTML = `
      <div class="page-view artist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: ${textColor};">
        <!-- New Immersive Hero Area -->
        <div class="artist-hero-immersive" id="artist-header">
           <div class="artist-hero-backdrop" style="background-image: url('${artistImg}')"></div>
           <div class="artist-hero-aura"></div>
           <div class="artist-hero-content">
              <img src="${artistImg}" alt="${artist.name}" class="hero-profile-img">
              <div class="artist-details-large">
                  <span class="artist-label">Verified Artist</span>
                  <h1 class="artist-hero-title">${artist.name}</h1>
                  <p class="artist-description">
                      <span>VibAura Artist</span> • <span>${songs.length} songs</span>
                  </p>
              </div>
           </div>
        </div>

        <!-- Desktop Action Bar -->
        <div class="artist-sticky-group" id="artist-sticky">
            <div class="artist-actions-bar">
               <div class="desktop-action-pills">
                  <button class="action-play-pill" id="artist-play-btn">
                    <img src="images/media controls/play.png" alt="Play">
                    <span>Play Now</span>
                  </button>
                  <button class="action-shuffle-pill" id="artist-shuffle-btn">
                    <img src="images/media controls/shuffle.png" alt="Shuffle">
                    <span>Shuffle</span>
                  </button>
               </div>

               <div class="artist-left-actions">
                  <button class="action-icon-btn sort-trigger-btn" id="dk-artist-sort-btn" title="Sort">
                      <img src="images/icons/sort.png" alt="Sort" class="icon-adaptive icon-sort">
                  </button>
                  <span class="sticky-artist-name">${artist.name}</span>
               </div>
            </div>
        </div>

        <div class="artist-content-container">
           <h2 class="section-title">Songs</h2>
           ${songsListHTML}
        </div>
      </div>
    `;

    const stickyGroup = contentArea.querySelector("#artist-sticky");
    const mainHeader = contentArea.querySelector("#artist-header");
    const mainPlayBtn = contentArea.querySelector("#artist-play-btn");
    const mainShuffleBtn = contentArea.querySelector("#artist-shuffle-btn");
    
    if (songs.length > 0) {
      if (mainPlayBtn) mainPlayBtn.addEventListener("click", () => playSongFromPlaylist(songs, 0));
      if (mainShuffleBtn) mainShuffleBtn.addEventListener("click", () => shuffleAndPlay(songs));
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
      item.addEventListener("click", (e) => {
        const moreBtn = e.target.closest('.song-more-btn');
        if (moreBtn) {
           e.stopPropagation();
           const songIndex = parseInt(item.dataset.index);
           const song = songs[songIndex];
           
           if (window.innerWidth > 768 && window.ContextMenuManager) {
              window.ContextMenuManager.open(e, 'song', song);
           } else if (window.BottomSheetManager) {
              window.BottomSheetManager.open('song', song);
           }
           return;
        }
        playSongFromPlaylist(songs, parseInt(item.dataset.index));
      });
    });

  } catch (error) {
    console.error("Error rendering artist page:", error);
    contentArea.innerHTML = `
      <div class="page-view"><p class="error-message">Could not load artist. Please try again.</p></div>`;
  }
}
