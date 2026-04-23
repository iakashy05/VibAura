import searchService from '../services/searchService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to handle search requests.
 */
class SearchController {
  /**
   * GET /api/v1/search?q=<query>
   */
  search = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await searchService.searchAll(q);
    res.json(results);
  });
}

export default new SearchController();
