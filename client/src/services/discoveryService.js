import api from './api';
import { mapDiscoverySection, mapArtistToUI, mapPlaylistToUI, mapSongToUI } from '../utils/mappers';

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

/**
 * Service to search for songs, artists, and playlists.
 */
export const search = async (query) => {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    const { songs, artists, playlists, topResult } = response.data;
    
    const sections = [];

    // 1. Map Top Result if it exists
    if (topResult) {
      let mappedTop = null;
      if (topResult.type === 'song') mappedTop = mapSongToUI(topResult);
      else if (topResult.type === 'artist') mappedTop = mapArtistToUI(topResult);
      else if (topResult.type === 'playlist') mappedTop = mapPlaylistToUI(topResult);

      if (mappedTop) {
        sections.push({
          title: 'Top Result',
          type: 'top',
          items: [{ ...mappedTop, resultType: topResult.type }]
        });
      }
    }
    
    // 2. Map other categories
    if (songs && songs.length > 0) {
      sections.push({ title: 'Songs', type: 'song', items: songs.map(mapSongToUI) });
    }

    if (artists && artists.length > 0) {
      sections.push({ title: 'Artists', type: 'artist', items: artists.map(mapArtistToUI) });
    }

    if (playlists && playlists.length > 0) {
      sections.push({ title: 'Playlists', type: 'playlist', items: playlists.map(mapPlaylistToUI) });
    }

    return sections;
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
};
