import { prisma } from '../../lib/prisma';
import { ICreateMediaPayload, IMediaFilterQuery, IUpdateMediaPayload } from './media.interface';
import { slugify } from '../../utils/slugify';
import { MediaFilterableFields, mediaIncludeConfig, MediaSearchableFields } from './media.constant';
import { Media, Prisma } from '../../../generated/prisma/client';
import { Genre } from '../../../generated/prisma/enums';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';

const createMedia = async (payload: ICreateMediaPayload) => {
  const baseSlug = slugify(payload.title);
  let slug = baseSlug;
  let counter = 1;

  // Handle unique slug generation properly
  while (await prisma.media.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create the record
  const newMedia = await prisma.media.create({
    data: {
      ...payload,
      slug,
      genres: payload.genres ? (payload.genres as Genre[]) : undefined,
    },
  });

  return newMedia;
};

const getAllMedia = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Media, Prisma.MediaWhereInput, Prisma.MediaInclude>(prisma.media, query, {
    searchableFields: MediaSearchableFields,
    filterableFields: MediaFilterableFields,
  })

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({
      platforms: {
        include: { platform: true },
      },
      reviews: {
        include: { user: true },
      },
      watchlistItems: true,
      purchases: true,
    })
    .sort()
    .dynamicInclude(mediaIncludeConfig)
    .paginate()
    .fields()
    .execute();

  return result;
};

const getMediaById = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id, isDeleted: false },
    include: {
      platforms: {
        include: { platform: true },
      },
      reviews: {
        include: { user: true },
      },
      watchlistItems: true,
      purchases: true,
    },
  });

  if(media) {
    // Increment view async (no need to await to block response)
    prisma.media.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  return media;
};

const getMediaBySlug = async (slug: string) => {
  const media = await prisma.media.findUnique({
    where: { slug, isDeleted: false },
    include: {
      platforms: {
        include: { platform: true },
      },
      reviews: {
        include: { user: true },
      },
      watchlistItems: true,
      purchases: true,
    },
  });

  if (media) {
    // Increment view async (no need to await to block response)
    prisma.media.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  return media;
};

const updateMedia = async (id: string, payload: IUpdateMediaPayload) => {
  const isMediaExist = await prisma.media.findUnique({
    where: { id, isDeleted: false },
  });

  if(!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  let updateData: Prisma.MediaUpdateInput = { 
    ...payload, 
    genres: payload.genres ? (payload.genres as Genre[]) : undefined 
  };

  if (payload.title) {
    updateData.slug = slugify(payload.title); // Simple re-slug, careful of duplicates in real prod
  }

  const updatedMedia = await prisma.media.update({
    where: { id },
    data: updateData,
  });

  return updatedMedia;
};

const softDeleteMedia = async (id: string) => {
  const isMediaExist = await prisma.media.findUnique({
    where: { id, isDeleted: false },
  });

  if(!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  const result = await prisma.media.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  return result;
};

export const MediaService = {
  createMedia,
  getAllMedia,
  getMediaBySlug,
  updateMedia,
  softDeleteMedia,
  getMediaById,
};
