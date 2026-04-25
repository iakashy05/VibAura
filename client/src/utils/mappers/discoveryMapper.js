import { mapSongToUI } from './songMapper';
import { mapArtistToUI } from './artistMapper';
import { mapPlaylistToUI } from './playlistMapper';

/**
 * Maps a discovery section from the backend to the UI list.
 * Uses the specific entity mappers based on the section type.
 */
export const mapDiscoverySection = (section) => {
  const mappers = {
    song: mapSongToUI,
    artist: mapArtistToUI,
    playlist: mapPlaylistToUI
  };

  const mapper = mappers[section.type];
  
  if (!mapper) return section; // Fallback if no mapper found

  return {
    ...section,
    items: section.items?.map(mapper) || []
  };
};

