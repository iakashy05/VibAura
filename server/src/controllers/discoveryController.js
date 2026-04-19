import discoveryService from '../services/discoveryService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to handle discovery/homepage requests.
 */
class DiscoveryController {
  /**
   * GET /api/v1/discovery
   */
  getHomepage = asyncHandler(async (req, res) => {
    const payload = await discoveryService.getHomepagePayload();
    res.json(payload);
  });
}

export default new DiscoveryController();
