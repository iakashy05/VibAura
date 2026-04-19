import HomePageSection from '../models/HomePageSection.js';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Playlist from '../models/Playlist.js';
import { debug, error } from '../utils/logger.js';

/**
 * Service to build the dynamic homepage layout.
 */
class DiscoveryService {
  /**
   * Fetches the homepage structure and populates sections with real data.
   */
  async getHomepagePayload() {
    try {
      // 1. Get configuration for sections from the DB
      const sections = await HomePageSection.find({ isActive: true })
        .sort({ order: 1 })
        .lean();

      const payload = [];

      // 2. Define how to fetch data for each section type
      const fetchers = {
        song: async (config) => {
          const query = config.category ? { category: config.category } : { isFeatured: true };
          return await Song.find(query)
            .populate('artists')
            .limit(config.limit || 10)
            .lean();
        },
        artist: async (config) => {
          return await Artist.find(config.category ? { category: config.category } : { isFeatured: true })
            .limit(config.limit || 6)
            .lean();
        },
        playlist: async (config) => {
          return await Playlist.find(config.category ? { category: config.category } : {})
            .limit(config.limit || 6)
            .lean();
        }
      };

      // 3. Build the actual sections
      if (sections.length > 0) {
        for (const section of sections) {
          const fetcher = fetchers[section.type];
          if (fetcher) {
            const items = await fetcher(section);
            if (items.length > 0) {
              payload.push({
                id: section._id,
                title: section.title,
                type: section.type,
                items: items
              });
            }
          }
        }
      } else {
        // --- 4. Fallback: If DB sections are empty, build a default layout ---
        debug('No HomePageSections found. Building fallback layout.');
        
        const featuredSongs = await Song.find({ isFeatured: true })
          .populate('artists')
          .limit(10)
          .lean();
          
        if (featuredSongs.length > 0) {
          payload.push({
            id: 'legacy-featured',
            title: 'Featured Today',
            type: 'song',
            items: featuredSongs
          });
        }

        const topArtists = await Artist.find({ isFeatured: true })
          .limit(6)
          .lean();

        if (topArtists.length > 0) {
          payload.push({
            id: 'legacy-artists',
            title: 'Top Artists',
            type: 'artist',
            items: topArtists
          });
        }
      }

      return payload;
    } catch (err) {
      error('DiscoveryService failed:', err.message);
      throw err;
    }
  }
}

export default new DiscoveryService();
