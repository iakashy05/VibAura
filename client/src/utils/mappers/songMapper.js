/**
 * Maps database song objects to the format expected by the React UI components.
 */
export const mapSongToUI = (song) => {
  if (!song) return null;
  
  return {
    id: song._id,
    title: song.title,
    // Handle multi-artist logic for titles
    subtitle: Array.isArray(song.artists) 
      ? song.artists.map(a => a.name).join(', ') 
      : (song.artist || 'Unknown Artist'),
    image: song.artworkUrl || 'https://placehold.co/400x400/6367FF/FFFFFF?text=Aura',
    url: song.fileUrl,
    duration: song.duration,
    album: song.album || 'Single',
    artists: song.artists // Keep full objects for rich detail views
  };
};

