import { PlaylistService } from "../../services/playlistService.js";
import { getCurrentUser } from "../../auth/authService.js";

/**
 * Renders the modal to add a song to an existing library playlist.
 *
 * @async
 * @param {object} song - The song object to add
 */
export async function openAddToPlaylistModal(song) {
  console.log("Opening Add to Playlist Modal", song);
  const modal = document.getElementById('add-to-playlist-modal');
  const list = document.getElementById('add-to-playlist-list');
  const closeBtn = document.getElementById('close-add-to-playlist');

  if (!modal || !list) return;

  // Reset
  list.innerHTML = '<li style="padding:10px;">Loading...</li>';
  modal.style.display = 'flex';

  const close = () => modal.style.display = 'none';
  closeBtn.onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };

  try {
    const responseData = await PlaylistService.getUserLibrary();
    const playlists = responseData.libraryPlaylists || [];

    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    const myPlaylists = playlists.filter(p =>
      p.owner === currentUserId || (p.owner && p.owner._id === currentUserId)
    );

    list.innerHTML = '';
    if (myPlaylists.length === 0) {
      list.innerHTML = '<li style="padding:10px;">No playlists found. Create one first!</li>';
      return;
    }

    myPlaylists.forEach(playlist => {
      const li = document.createElement('li');
      li.className = 'playlist-selection-item';

      const exists = playlist.songs.some(s => s._id === song._id || s === song._id);

      li.innerHTML = `
                <img src="${playlist.coverImageUrl || 'images/Playlist.webp'}" alt="Cover">
                <div class="playlist-selection-info">
                    <span class="playlist-selection-title">${playlist.name}</span>
                    <span style="font-size:0.8rem; opacity:0.7;">${playlist.songs.length} songs</span>
                </div>
                ${exists ? '<span style="color:var(--color-accent); font-size:0.8rem;">Added</span>' : ''}
            `;

      if (!exists) {
        li.onclick = async () => {
          try {
            await PlaylistService.addSongToPlaylist(playlist._id, song._id);
            alert(`Added to ${playlist.name}`);
            close();
          } catch (err) {
            alert("Failed to add: " + err.message);
          }
        };
      }
      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = '<li style="padding:10px; color:red;">Error loading playlists</li>';
  }
}

/**
 * Opens the standalone modal to create a new playlist.
 */
export function openCreatePlaylistModal() {
  const modal = document.getElementById('create-playlist-modal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('playlist-name-input');
    if (input) setTimeout(() => input.focus(), 100);
  } else {
    console.error("Create Playlist Modal not found in DOM");
  }
}

// Make globally available for inline HTML onclick handlers
window.openCreatePlaylistModal = openCreatePlaylistModal;
window.openAddToPlaylistModal = openAddToPlaylistModal;
