import { prisma } from '../../lib/prisma';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';
import { ICreateWatchlist, IAddWatchlistItem } from './watchlist.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { Prisma, Watchlist } from '../../../generated/prisma/client';
import { watchlistFilterableFields, watchlistSearchableFields } from './watchlist.constant';
import { IQueryParams } from '../../interfaces/query.interface';

// create a new watchlist
const createWatchlist = async (userId: string, payload: ICreateWatchlist) => {
  const name = payload.name || 'My Watchlist';

  // Check for duplicate name for this user
  const existingWatchlist = await prisma.watchlist.findFirst({
    where: { userId, name },
  });

  if (existingWatchlist) {
    throw new AppError(status.CONFLICT, `You already have a watchlist named "${name}"`);
  }

  const result = await prisma.watchlist.create({
    data: {
      name,
      userId,
    },
    include: {
      items: {
        include: { media: { select: { id: true, title: true, posterUrl: true, mediaType: true, pricingType: true, genres: true } } },
      },
    },
  });

  return result;
};

// get all watchlists for the logged-in user
const getMyWatchlists = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Watchlist, Prisma.WatchlistWhereInput, Prisma.WatchlistInclude>(prisma.watchlist, query, {
    searchableFields: watchlistSearchableFields,
    filterableFields: watchlistFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ userId })
    .include({
      items: {
        include: {
          media: {
            select: {
              id: true,
              title: true,
              slug: true,
              posterUrl: true,
              streamingUrl: true,
              trailerUrl: true,
              mediaType: true,
              releaseYear: true,
              averageRating: true,
              pricingType: true,
              genres: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
      _count: { select: { items: true } },
    })
    .sort()
    .paginate()
    .fields()
    .execute();
  return result;
};

// get a single watchlist by id (only if the user owns it)
const getWatchlistById = async (userId: string, watchlistId: string) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
    include: {
      items: {
        include: {
          media: {
            select: {
              id: true,
              title: true,
              slug: true,
              posterUrl: true,
              mediaType: true,
              releaseYear: true,
              director: true,
              averageRating: true,
              pricingType: true,
              genres: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
      _count: { select: { items: true } },
    },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  return watchlist;
};

// update watchlist name
const updateWatchlist = async (userId: string, watchlistId: string, payload: { name: string }) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  if (watchlist.name === payload.name) {
    throw new AppError(status.BAD_REQUEST, 'Watchlist already has this name');
  }

  const result = await prisma.watchlist.update({
    where: { id: watchlistId },
    data: { name: payload.name },
  });

  return result;
};

// delete a watchlist (cascades to items)
const deleteWatchlist = async (userId: string, watchlistId: string) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  await prisma.watchlist.delete({
    where: { id: watchlistId },
  });
};

// add a media item to a watchlist
const addItem = async (userId: string, watchlistId: string, payload: IAddWatchlistItem) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  // verify media exists and is published
  const media = await prisma.media.findUnique({
    where: { id: payload.mediaId, isDeleted: false, isPublished: true },
  });

  if (!media) {
    throw new AppError(status.NOT_FOUND, 'Media not found or unavailable');
  }

  // check for duplicate (unique constraint: watchlistId + mediaId)
  const existingItem = await prisma.watchlistItem.findUnique({
    where: {
      watchlistId_mediaId: {
        watchlistId,
        mediaId: payload.mediaId,
      },
    },
  });

  if (existingItem) {
    throw new AppError(status.CONFLICT, 'This media is already in your watchlist');
  }

  const result = await prisma.watchlistItem.create({
    data: {
      watchlistId,
      mediaId: payload.mediaId,
    },
    include: {
      media: {
        select: { id: true, title: true, posterUrl: true, mediaType: true },
      },
    },
  });

  return result;
};

// toggle a media item in a watchlist
const toggleItem = async (userId: string, watchlistId: string, payload: IAddWatchlistItem) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  // check if item already exists
  const existingItem = await prisma.watchlistItem.findUnique({
    where: {
      watchlistId_mediaId: {
        watchlistId,
        mediaId: payload.mediaId,
      },
    },
  });

  if (existingItem) {
    // Remove if exists
    await prisma.watchlistItem.delete({
      where: { id: existingItem.id },
    });
    return { action: 'removed', mediaId: payload.mediaId };
  } else {
    // Add if not exists
    // verify media exists and is published
    const media = await prisma.media.findUnique({
      where: { id: payload.mediaId, isDeleted: false, isPublished: true },
    });

    if (!media) {
      throw new AppError(status.NOT_FOUND, 'Media not found or unavailable');
    }

    const result = await prisma.watchlistItem.create({
      data: {
        watchlistId,
        mediaId: payload.mediaId,
      },
      include: {
        media: {
          select: { id: true, title: true, posterUrl: true, mediaType: true },
        },
      },
    });

    return { action: 'added', data: result };
  }
};

// remove a media item from a watchlist (by itemId or mediaId)
const removeItem = async (userId: string, watchlistId: string, id: string, idType: 'item' | 'media' = 'item') => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
  });

  if (!watchlist) {
    throw new AppError(status.NOT_FOUND, 'Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have access to this watchlist');
  }

  let item;
  if (idType === 'item') {
    item = await prisma.watchlistItem.findUnique({
      where: { id, watchlistId },
    });
  } else {
    item = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_mediaId: {
          watchlistId,
          mediaId: id,
        },
      },
    });
  }

  if (!item) {
    throw new AppError(status.NOT_FOUND, 'Item not found in this watchlist');
  }

  await prisma.watchlistItem.delete({
    where: { id: item.id },
  });
};

export const WatchlistService = {
  createWatchlist,
  getMyWatchlists,
  getWatchlistById,
  updateWatchlist,
  deleteWatchlist,
  addItem,
  toggleItem,
  removeItem,
};
