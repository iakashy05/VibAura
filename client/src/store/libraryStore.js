import { create } from 'zustand';
import { 
  getLibrary, 
  toggleLikeSong, 
  togglePinPlaylist, 
  createPlaylist, 
  deletePlaylist,
  toggleLibraryPlaylist,
  togglePinArtist,
  toggleLibraryArtist
} from '../services/libraryService';
import { useUIStore } from './uiStore';

export const useLibraryStore = create((set, get) => ({
  // --- State ---
  playlists: [],
  pinnedPlaylists: [],
  pinnedArtists: [],
  likedSongs: [],
  artists: [],
  recentlyPlayed: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  // --- Actions ---

  // Reset Store (on logout)
  reset: () => set({
    playlists: [],
    pinnedPlaylists: [],
    pinnedArtists: [],
    likedSongs: [],
    artists: [],
    recentlyPlayed: [],
    isLoading: false,
    error: null,
    isInitialized: false
  }),

  // Seed store from backend (run once on app mount or login)
  fetchLibrary: async (force = false) => {
    // Avoid double fetching if already initialized
    if (get().isInitialized && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const data = await getLibrary();
      set({
        playlists: data.playlists,
        pinnedPlaylists: data.pinnedPlaylists,
        pinnedArtists: data.pinnedArtists,
        likedSongs: data.likedSongs,
        artists: data.artists,
        recentlyPlayed: data.recentlyPlayed,
        isLoading: false,
        isInitialized: true
      });
    } catch (err) {
      set({ error: 'Failed to load music library', isLoading: false });
      useUIStore.getState().showToast('Failed to load library', 'error');
    }
  },

  // Optimistic Liking
  toggleLikeSongOptimistic: async (song) => {
    const { likedSongs } = get();
    const songId = song.id || song._id;
    const isAlreadyLiked = likedSongs.some(s => (s.id || s._id) === songId);

    // Save previous state for rollback
    const previousLikedSongs = [...likedSongs];

    // Optimistic state change
    let nextLikedSongs;
    if (isAlreadyLiked) {
      nextLikedSongs = likedSongs.filter(s => (s.id || s._id) !== songId);
    } else {
      nextLikedSongs = [...likedSongs, song];
    }
    set({ likedSongs: nextLikedSongs });

    try {
      const res = await toggleLikeSong(songId);
      // Double check if backend response mismatches (e.g. backend thinks it's unliked but we liked)
      // res.liked is true/false.
      const match = res.liked === !isAlreadyLiked;
      if (!match) {
        // Correct to match backend authoritative state if somehow desynced
        if (res.liked) {
          set({ likedSongs: [...previousLikedSongs, song] });
        } else {
          set({ likedSongs: previousLikedSongs.filter(s => (s.id || s._id) !== songId) });
        }
      }
    } catch (err) {
      // Rollback on connection/server error
      set({ likedSongs: previousLikedSongs });
      useUIStore.getState().showToast('Failed to update liked songs', 'error');
    }
  },

  // Optimistic Pinning
  togglePinPlaylistOptimistic: async (playlistId) => {
    const { pinnedPlaylists, playlists } = get();
    const isPinned = pinnedPlaylists.some(p => p.id === playlistId);

    const previousPinned = [...pinnedPlaylists];

    let nextPinned;
    if (isPinned) {
      nextPinned = pinnedPlaylists.filter(p => p.id !== playlistId);
    } else {
      const playlistToPin = playlists.find(p => p.id === playlistId);
      if (!playlistToPin) return; // Cant pin if not in playlists
      nextPinned = [...pinnedPlaylists, playlistToPin];
    }
    set({ pinnedPlaylists: nextPinned });

    try {
      const res = await togglePinPlaylist(playlistId);
      const match = res.pinned === !isPinned;
      if (!match) {
        if (res.pinned) {
          const playlistToPin = playlists.find(p => p.id === playlistId);
          if (playlistToPin) set({ pinnedPlaylists: [...previousPinned, playlistToPin] });
        } else {
          set({ pinnedPlaylists: previousPinned.filter(p => p.id !== playlistId) });
        }
      }
    } catch (err) {
      set({ pinnedPlaylists: previousPinned });
      useUIStore.getState().showToast('Failed to toggle pin state', 'error');
    }
  },

  // Optimistic Playlist Creation
  createPlaylistOptimistic: async (title, description = '') => {
    const { playlists } = get();
    const tempId = `temp-${Date.now()}`;
    const tempPlaylist = {
      id: tempId,
      title,
      description,
      songs: [],
      cover: '',
      isPublic: true,
      creator: null
    };

    set({ playlists: [tempPlaylist, ...playlists] });

    try {
      const realPlaylist = await createPlaylist(title, description);
      // Replace temp with real playlist
      set((state) => ({
        playlists: state.playlists.map(p => p.id === tempId ? realPlaylist : p)
      }));
      useUIStore.getState().showToast('Playlist created!', 'success');
      return realPlaylist;
    } catch (err) {
      // Rollback
      set((state) => ({
        playlists: state.playlists.filter(p => p.id !== tempId)
      }));
      useUIStore.getState().showToast('Failed to create playlist', 'error');
      throw err;
    }
  },

  // Optimistic Playlist Deletion
  deletePlaylistOptimistic: async (playlistId) => {
    const { playlists, pinnedPlaylists } = get();
    const playlistToDelete = playlists.find(p => p.id === playlistId);

    const previousPlaylists = [...playlists];
    const previousPinned = [...pinnedPlaylists];

    set({
      playlists: playlists.filter(p => p.id !== playlistId),
      pinnedPlaylists: pinnedPlaylists.filter(p => p.id !== playlistId)
    });

    try {
      await deletePlaylist(playlistId);
    } catch (err) {
      // Rollback
      set({
        playlists: previousPlaylists,
        pinnedPlaylists: previousPinned
      });
      useUIStore.getState().showToast('Failed to delete playlist', 'error');
    }
  },

  // Optimistic Library Playlist Toggling (Adding/Removing other's playlists)
  toggleLibraryPlaylistOptimistic: async (playlist) => {
    const { playlists, pinnedPlaylists } = get();
    const playlistId = playlist.id || playlist._id;
    const isAdded = playlists.some(p => p.id === playlistId);

    const previousPlaylists = [...playlists];
    const previousPinned = [...pinnedPlaylists];

    let nextPlaylists;
    if (isAdded) {
      nextPlaylists = playlists.filter(p => p.id !== playlistId);
    } else {
      nextPlaylists = [playlist, ...playlists];
    }

    set({
      playlists: nextPlaylists,
      pinnedPlaylists: pinnedPlaylists.filter(p => p.id !== playlistId) // Always unpin if removed from library
    });

    try {
      const res = await toggleLibraryPlaylist(playlistId);
      const match = res.added === !isAdded;
      if (!match) {
        if (res.added) {
          set({ playlists: [playlist, ...previousPlaylists] });
        } else {
          set({
            playlists: previousPlaylists.filter(p => p.id !== playlistId),
            pinnedPlaylists: previousPinned
          });
        }
      }
    } catch (err) {
      set({
        playlists: previousPlaylists,
        pinnedPlaylists: previousPinned
      });
      useUIStore.getState().showToast('Failed to update library', 'error');
    }
  },

  // Helper action: Add song to playlist in store
  addSongToPlaylistInStore: (playlistId, song) => set((state) => ({
    playlists: state.playlists.map(p => {
      if (p.id === playlistId) {
        // Add if not already present
        const exists = p.songs.some(s => (s.id || s._id) === (song.id || song._id));
        return {
          ...p,
          songs: exists ? p.songs : [...p.songs, song]
        };
      }
      return p;
    }),
    pinnedPlaylists: state.pinnedPlaylists.map(p => {
      if (p.id === playlistId) {
        const exists = p.songs.some(s => (s.id || s._id) === (song.id || song._id));
        return {
          ...p,
          songs: exists ? p.songs : [...p.songs, song]
        };
      }
      return p;
    })
  })),

  // Helper action: Remove song from playlist in store
  removeSongFromPlaylistInStore: (playlistId, songId) => set((state) => ({
    playlists: state.playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => (s.id || s._id) !== songId)
        };
      }
      return p;
    }),
    pinnedPlaylists: state.pinnedPlaylists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => (s.id || s._id) !== songId)
        };
      }
      return p;
    })
  })),

  // Helper action: Update playlist metadata in store
  updatePlaylistMetadataInStore: (playlistId, title, description) => set((state) => {
    const updateFn = (p) => p.id === playlistId ? { ...p, title, description } : p;
    return {
      playlists: state.playlists.map(updateFn),
      pinnedPlaylists: state.pinnedPlaylists.map(updateFn)
    };
  }),

  // Optimistic Library Artist Toggling
  toggleLibraryArtistOptimistic: async (artist) => {
    const { artists, pinnedArtists } = get();
    const artistId = artist.id || artist._id;
    const isAdded = artists.some(a => (a.id || a._id) === artistId);

    const previousArtists = [...artists];
    const previousPinned = [...pinnedArtists];

    let nextArtists;
    if (isAdded) {
      nextArtists = artists.filter(a => (a.id || a._id) !== artistId);
    } else {
      nextArtists = [artist, ...artists];
    }

    set({
      artists: nextArtists,
      pinnedArtists: pinnedArtists.filter(a => (a.id || a._id) !== artistId) // Unpin if removed
    });

    try {
      const res = await toggleLibraryArtist(artistId);
      const match = res.added === !isAdded;
      if (!match) {
        if (res.added) {
          set({ artists: [artist, ...previousArtists] });
        } else {
          set({
            artists: previousArtists.filter(a => (a.id || a._id) !== artistId),
            pinnedArtists: previousPinned
          });
        }
      }
    } catch (err) {
      set({
        artists: previousArtists,
        pinnedArtists: previousPinned
      });
      useUIStore.getState().showToast('Failed to update library', 'error');
    }
  },

  // Optimistic Artist Pinning
  togglePinArtistOptimistic: async (artistId) => {
    const { pinnedArtists, artists } = get();
    const isPinned = pinnedArtists.some(a => (a.id || a._id) === artistId);

    const previousPinned = [...pinnedArtists];

    let nextPinned;
    if (isPinned) {
      nextPinned = pinnedArtists.filter(a => (a.id || a._id) !== artistId);
    } else {
      const artistToPin = artists.find(a => (a.id || a._id) === artistId);
      if (!artistToPin) return; // Can't pin if not in library
      nextPinned = [...pinnedArtists, artistToPin];
    }
    set({ pinnedArtists: nextPinned });

    try {
      const res = await togglePinArtist(artistId);
      const match = res.pinned === !isPinned;
      if (!match) {
        if (res.pinned) {
          const artistToPin = artists.find(a => (a.id || a._id) === artistId);
          if (artistToPin) set({ pinnedArtists: [...previousPinned, artistToPin] });
        } else {
          set({ pinnedArtists: previousPinned.filter(a => (a.id || a._id) !== artistId) });
        }
      }
    } catch (err) {
      set({ pinnedArtists: previousPinned });
      useUIStore.getState().showToast('Failed to toggle pin state', 'error');
    }
  }
}));
