import { mapSongToUI } from './songMapper';

/**
 * Maps database artist objects to the format expected by the React UI components.
 */
export const mapArtistToUI = (artist) => {
  if (!artist) return null;

  return {
    id: artist._id,
    title: artist.name,
    subtitle: '', // Minimalist aesthetic
    image: artist.artworkUrl || 'https://placehold.co/400x400/E5E7EB/1E1E1E?text=Artist',
    songs: artist.songs?.map(mapSongToUI) || []
  };
};

