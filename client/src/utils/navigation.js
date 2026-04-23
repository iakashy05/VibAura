/**
 * Helper to reconstruct the selected data object from an ID.
 * Since the frontend is now API-driven, we only need the ID. The individual
 * page components (Artist.jsx, Playlist.jsx) will fetch their own full data
 * from the backend using this ID.
 * 
 * @param {string|number} id - The unique ID of the item.
 * @param {string} page - The page type.
 * @returns {object|null} - An object containing the ID, or null.
 */
export const findItemById = (id, page) => {
  if (!id) return null;
  return { id };
};
