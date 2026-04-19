import { albums, artists } from '../data/mockData';

/**
 * Finds a specific artist or playlist/album by ID.
 * @param {string|number} id - The unique ID of the item.
 * @param {string} page - The page type ('artist' or 'playlist').
 * @returns {object|null} - The found item or null.
 */
export const findItemById = (id, page) => {
  if (!id) return null;
  const numId = parseInt(id);
  
  if (page === 'artist') {
    return artists.find(a => a.id === numId);
  }
  
  if (page === 'playlist') {
    return (
      albums.featured.find(a => a.id === numId) || 
      albums.newReleases.find(a => a.id === numId)
    );
  }
  
  return null;
};
