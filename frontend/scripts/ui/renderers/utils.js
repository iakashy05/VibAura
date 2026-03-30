/**
 * Shared utilities for UI renderers.
 */

export const getContentArea = () => document.getElementById("album-sections");

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
