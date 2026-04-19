import api from './api';
import { mapDiscoverySection, mapArtistToUI, mapPlaylistToUI } from '../utils/mappers';

/**
 * Service to fetch dynamic homepage content.
 */
export const getDiscoveryData = async () => {
  try {
    const response = await api.get('/discovery');
    return response.data.map(mapDiscoverySection);
  } catch (error) {
    console.error('❌ Failed to load discovery data:', error.message);
    throw error;
  }
};

/**
 * Service to fetch full Artist details including their song list.
 */
export const getArtistDetails = async (id) => {
  try {
    const response = await api.get(`/artists/${id}`);
    return mapArtistToUI(response.data);
  } catch (error) {
    console.error('❌ Failed to load artist details:', error.message);
    throw error;
  }
};

/**
 * Service to fetch full Playlist details including tracklist.
 */
export const getPlaylistDetails = async (id) => {
  try {
    const response = await api.get(`/playlists/${id}`);
    return mapPlaylistToUI(response.data);
  } catch (error) {
    console.error('❌ Failed to load playlist details:', error.message);
    throw error;
  }
};
