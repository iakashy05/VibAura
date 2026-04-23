import api from './api';
import { mapSongToUI, mapPlaylistToUI } from '../utils/mappers';

/**
 * Service to manage the user's library.
 */
export const getLibrary = async () => {
  try {
    const response = await api.get('/library');
    return {
      playlists: response.data.playlists.map(mapPlaylistToUI),
      likedSongs: response.data.likedSongs.map(mapSongToUI)
    };
  } catch (error) {
    console.error('❌ Failed to fetch library:', error.message);
    throw error;
  }
};

export const toggleLikeSong = async (songId) => {
  try {
    const response = await api.post(`/library/songs/${songId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to toggle song like:', error.message);
    throw error;
  }
};

export const toggleLibraryPlaylist = async (playlistId) => {
  try {
    const response = await api.post(`/library/playlists/${playlistId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to toggle playlist library:', error.message);
    throw error;
  }
};
