import { playSongFromPlaylist } from "../../player/playerProxy.js";
import { BottomSheetManager } from "../bottomSheetManager.js";
import { openAddToPlaylistModal } from "./modals.js";
import { createScrollButton } from "./scroll.js";

/**
 * Creates a complete section with a title and a scrollable card grid.
 * Uses event delegation for performance.
 */
export function createSectionElement(section) {
  const fragment = document.createDocumentFragment();

  const sectionTitle = document.createElement("h2");
  sectionTitle.textContent = section.title;
  fragment.appendChild(sectionTitle);

  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";
  if (section.type === "artist") {
    wrapper.classList.add("artist-section");
  }

  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  const items = section.songs || section.items;

  items.forEach((item, index) => {
    cardContainer.appendChild(createCardElement(item, section, index));
  });

  // --- EVENT DELEGATION ---
  let longPressTimer;
  const holdDuration = 500;

  const handleAction = (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    const index = parseInt(card.dataset.index);
    const item = items[index];

    // Handle Options Button
    if (e.target.closest('.card-options-btn')) {
      e.stopPropagation();
      openAddToPlaylistModal(item);
      return;
    }

    // Standard Click Action
    if (card.dataset.longPressTriggered === 'true') {
      card.dataset.longPressTriggered = 'false';
      return;
    }

    if (section.type === "song") {
      playSongFromPlaylist(items, index);
    } else {
      window.location.hash = `#/${section.type}/${item._id}`;
    }
  };

  cardContainer.addEventListener("click", handleAction);

  // Mobile Long Press Delegation
  cardContainer.addEventListener('touchstart', (e) => {
    const card = e.target.closest('.card');
    if (!card || e.target.closest('.card-options-btn')) return;

    card.dataset.longPressTriggered = 'false';
    longPressTimer = setTimeout(() => {
      card.dataset.longPressTriggered = 'true';
      if (navigator.vibrate) navigator.vibrate(50);
      const index = parseInt(card.dataset.index);
      BottomSheetManager.open(section.type, items[index]);
    }, holdDuration);
  }, { passive: true });

  const cancelLongPress = (e) => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  cardContainer.addEventListener('touchend', cancelLongPress);
  cardContainer.addEventListener('touchmove', cancelLongPress);

  wrapper.appendChild(createScrollButton("scroll-left"));
  wrapper.appendChild(cardContainer);
  wrapper.appendChild(createScrollButton("scroll-right"));
  fragment.appendChild(wrapper);

  return fragment;
}

/**
 * Creates an individual card shell. Listeners are handled via delegation.
 */
export function createCardElement(item, section, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.index = index;
  card.dataset.id = item._id;

  const imgDiv = document.createElement("div");
  imgDiv.className = "card-img-div";
  const img = document.createElement("img");

  if (section.type === "song") {
    img.src = item.artworkUrl;
    
    const optionsBtn = document.createElement('button');
    optionsBtn.className = 'card-options-btn';
    optionsBtn.innerHTML = '<img src="images/icons/more.png" style="width:16px; height:16px;">';
    optionsBtn.title = "Add to playlist";
    card.appendChild(optionsBtn);
    
    // Simple hover effect can stay or be CSS-based (prefer CSS)
  } else if (section.type === "artist") {
    img.src = item.artworkUrl || "images/Artist.webp";
  } else if (section.type === "playlist") {
    img.src = item.artworkUrl || item.coverImageUrl || "images/Playlist.webp";
  }

  img.alt = item.name || item.title;
  img.className = "album-img";
  imgDiv.appendChild(img);

  const nameDiv = document.createElement("div");
  nameDiv.className = "album-name-div";
  const name = document.createElement("div");
  name.className = "album-name";
  name.textContent = item.name || item.title;
  nameDiv.appendChild(name);

  card.appendChild(imgDiv);
  card.appendChild(nameDiv);

  if (section.type === "song") {
    const artist = document.createElement("div");
    artist.className = "artist-name";
    artist.textContent =
      item.artists && item.artists.length > 0
        ? item.artists.map(a => a.name).join(", ")
        : "Unknown Artist";
    card.appendChild(artist);
  }

  return card;
}

