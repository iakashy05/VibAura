import { mapSongToUI } from './songMapper';

/**
 * Maps database playlist objects to the format expected by the React UI components.
 */
export const mapPlaylistToUI = (playlist) => {
  if (!playlist) return null;

  return {
    id: playlist._id,
    title: playlist.title || playlist.name, // Support both new 'title' and old 'name'
    subtitle: '', // Clean look
    image: playlist.cover || playlist.coverImageUrl || 'https://placehold.co/400x400/6367FF/FFFFFF?text=Playlist',
    songs: playlist.songs?.map(mapSongToUI) || []
  };
};

