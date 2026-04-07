import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { WatchlistService } from './watchlist.service';
import status from 'http-status';
import { IQueryParams } from '../../interfaces/query.interface';

const createWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await WatchlistService.createWatchlist(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: 'Watchlist created successfully',
    data: result,
  });
});

const getMyWatchlists = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await WatchlistService.getMyWatchlists(userId, req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Watchlists retrieved successfully',
    data: result,
  });
});

const getWatchlistById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  const result = await WatchlistService.getWatchlistById(userId, watchlistId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Watchlist retrieved successfully',
    data: result,
  });
});

const updateWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  const result = await WatchlistService.updateWatchlist(userId, watchlistId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Watchlist updated successfully',
    data: result,
  });
});

const deleteWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  await WatchlistService.deleteWatchlist(userId, watchlistId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Watchlist deleted successfully',
    data: null,
  });
});

const addItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  const result = await WatchlistService.addItem(userId, watchlistId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: 'Item added to watchlist successfully',
    data: result,
  });
});

const toggleItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  const result = await WatchlistService.toggleItem(userId, watchlistId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.action === 'added' ? 'Item added to watchlist' : 'Item removed from watchlist',
    data: result.data || { mediaId: result.mediaId },
  });
});

const removeItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const watchlistId = req.params.watchlistId as string;
  const itemId = req.params.itemId as string;
  const mediaId = req.params.mediaId as string;

  if (mediaId) {
    await WatchlistService.removeItem(userId, watchlistId, mediaId, 'media');
  } else {
    await WatchlistService.removeItem(userId, watchlistId, itemId, 'item');
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Item removed from watchlist successfully',
    data: null,
  });
});

export const WatchlistController = {
  createWatchlist,
  getMyWatchlists,
  getWatchlistById,
  updateWatchlist,
  deleteWatchlist,
  addItem,
  toggleItem,
  removeItem,
};
