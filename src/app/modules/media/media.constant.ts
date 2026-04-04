import { Prisma } from "../../../generated/prisma/client";

export const MediaSearchableFields = ['title', 'director', 'synopsis', 'slug', 'title', 'cast', 'genres', 'platforms', 'reviews', 'watchlistItems', 'purchases'];

export const MediaSortableFields = [
  'averageRating',
  'releaseYear',
  'viewCount',
  'createdAt',
  'title',
];

export const MediaFilterableFields = [
  'platform',
  'isFeatured',
  'isEditorPick',
  'averageRating',
  'viewCount',
  'mediaType',
  'pricingType',
  'releaseYear',
  'price',
  'rentalPrice',
  'rentalDays',
  'duration',
  'director',
  'cast',
  'genres',
  'platforms',
  'reviews',
  'watchlistItems',
  'purchases',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'isDeleted',
  'slug',
  'title',
];

export const mediaIncludeConfig: Partial<Record<keyof Prisma.MediaInclude, Prisma.MediaInclude[keyof Prisma.MediaInclude]>> = {
  platforms: {
    include: { platform: true },
  },
  reviews: {
    include: { user: true },
  },
  watchlistItems: true,
  purchases: true,
};
