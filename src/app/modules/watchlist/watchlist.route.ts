import { Router } from 'express';
import { WatchlistController } from './watchlist.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import { createWatchlistSchema, updateWatchlistSchema, addWatchlistItemSchema } from './watchlist.validation';

const router = Router();

// Create a new watchlist
router.post(
  '/',
  checkAuth(Role.USER),
  validateRequest(createWatchlistSchema),
  WatchlistController.createWatchlist
);

// Get all my watchlists
router.get(
  '/',
  checkAuth(Role.USER),
  WatchlistController.getMyWatchlists
);

// Get a single watchlist by ID
router.get(
  '/:watchlistId',
  checkAuth(Role.USER),
  WatchlistController.getWatchlistById
);

// Update watchlist name
router.patch(
  '/:watchlistId',
  checkAuth(Role.USER),
  validateRequest(updateWatchlistSchema),
  WatchlistController.updateWatchlist
);

// Delete a watchlist
router.delete(
  '/:watchlistId',
  checkAuth(Role.USER),
  WatchlistController.deleteWatchlist
);

// Add a media item to a watchlist
router.post(
  '/:watchlistId/items',
  checkAuth(Role.USER),
  validateRequest(addWatchlistItemSchema),
  WatchlistController.addItem
);

// Toggle a media item in a watchlist
router.post(
  '/:watchlistId/items/toggle',
  checkAuth(Role.USER),
  validateRequest(addWatchlistItemSchema),
  WatchlistController.toggleItem
);

// Remove an item from a watchlist (by itemId)
router.delete(
  '/:watchlistId/items/:itemId',
  checkAuth(Role.USER),
  WatchlistController.removeItem
);

// Remove an item from a watchlist (by mediaId)
router.delete(
  '/:watchlistId/items/media/:mediaId',
  checkAuth(Role.USER),
  WatchlistController.removeItem
);

export const WatchlistRoutes = router;
