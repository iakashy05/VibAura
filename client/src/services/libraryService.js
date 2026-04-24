import api from './api';
import { mapSongToUI, mapPlaylistToUI, mapArtistToUI } from '../utils/mappers';

/**
 * Service to manage the user's library.
 */
export const getLibrary = async () => {
  try {
    const response = await api.get('/library');
    return {
      playlists: response.data.playlists.map(mapPlaylistToUI),
      pinnedPlaylists: (response.data.pinnedPlaylists || []).map(mapPlaylistToUI),
      likedSongs: response.data.likedSongs.map(mapSongToUI),
      artists: (response.data.artists || []).map(mapArtistToUI),
      recentlyPlayed: (response.data.recentlyPlayed || []).map(mapSongToUI)
    };
  } catch (error) {
    console.error('❌ Failed to fetch library:', error.message);
    throw error;
  }
};

export const logPlayHistory = async (songId) => {
  try {
    const response = await api.post('/library/history', { songId });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to log play history:', error.message);
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

export const toggleLibraryArtist = async (artistId) => {
  try {
    const response = await api.post(`/library/artists/${artistId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to toggle artist library:', error.message);
    throw error;
  }
};

export const togglePinPlaylist = async (playlistId) => {
  try {
    const response = await api.post(`/library/playlists/${playlistId}/pin`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to toggle pin:', error.message);
    throw error;
  }
};

export const createPlaylist = async (title, description = '') => {
  try {
    const response = await api.post('/playlists', { title, description });
    return mapPlaylistToUI(response.data);
  } catch (error) {
    console.error('❌ Failed to create playlist:', error.message);
    throw error;
  }
};

export const updatePlaylist = async (playlistId, data) => {
  try {
    const response = await api.put(`/playlists/${playlistId}`, data);
    return mapPlaylistToUI(response.data);
  } catch (error) {
    console.error('❌ Failed to update playlist:', error.message);
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const response = await api.delete(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete playlist:', error.message);
    throw error;
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add song to playlist:', error.message);
    throw error;
  }
};
