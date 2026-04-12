/**
 * Shared utilities for UI renderers.
 */

export const getContentArea = () => document.getElementById("album-sections");

/**
 * Clears view-specific styles, classes, and listeners before rendering a new page.
 * Ensures a clean slate for layout and padding.
 */
export function clearViewStyles() {
  const contentArea = getContentArea();
  if (contentArea) {
    const scrollContainer = contentArea.parentElement;
    if (scrollContainer) {
      if (scrollContainer.classList.contains("no-padding")) {
        scrollContainer.classList.remove("no-padding");
      }
      if (scrollContainer.style.background) scrollContainer.style.background = "";
      if (scrollContainer.style.backgroundColor) scrollContainer.style.backgroundColor = "";
      scrollContainer.onscroll = null;
    }
    if (contentArea.style.backgroundColor) contentArea.style.backgroundColor = "";
  }

  const classesToRemove = [
    "playlist-view-active",
    "artist-page-active",
    "search-page-active",
    "library-page-active"
  ].filter(cls => document.body.classList.contains(cls));

  if (classesToRemove.length > 0) {
    document.body.classList.remove(...classesToRemove);
  }
}

/**
 * Sorts songs based on criteria.
 */
export function sortSongs(songs, criteria) {
  if (!songs || !Array.isArray(songs)) return [];
  const sorted = [...songs];

  switch (criteria) {
    case 'title':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'artist':
      return sorted.sort((a, b) => {
        const artistA = (a.artists && a.artists[0] ? a.artists[0].name : '');
        const artistB = (b.artists && b.artists[0] ? b.artists[0].name : '');
        return artistA.localeCompare(artistB);
      });
    case 'album':
      return sorted.sort((a, b) => (a.album || '').localeCompare(b.album || ''));
    case 'recents':
    default:
      return sorted;
  }
}

/**
 * Extracts dominant color from an image URL.
 */
export async function getDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      resolve({ r, g, b });
    };
    img.onerror = () => resolve({ r: 80, g: 80, b: 80 }); // Default gray
  });
}

/**
 * Returns appropriate text color (white or black) based on background brightness.
 */
export function getContrastColor(r, g, b) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
