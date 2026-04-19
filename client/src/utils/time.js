/**
 * Formats seconds into M:SS or H:MM:SS format.
 * @param {number} time - Time in seconds.
 * @returns {string} - Formatted time string.
 */
export const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Calculates total duration of a list of tracks in hr/min format.
 * @param {Array} songs - List of song objects with { duration: "M:SS" }.
 * @returns {string} - Formatted duration string (e.g., "1 hr 20 min").
 */
export const calculateTotalDuration = (songs) => {
  if (!songs || songs.length === 0) return "0 min";
  
  let totalSeconds = 0;
  songs.forEach(song => {
    if (typeof song.duration === 'number') {
      totalSeconds += song.duration;
    } else if (typeof song.duration === 'string') {
      const parts = song.duration.split(':');
      if (parts.length === 2) {
        totalSeconds += (parseInt(parts[0]) * 60) + parseInt(parts[1]);
      }
    }
  });

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
};
