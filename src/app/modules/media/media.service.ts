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
import { deleteFileFromCloudinary } from '../../utils/cloudinary';

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

const getAllMediaByAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Media, Prisma.MediaWhereInput, Prisma.MediaInclude>(prisma.media, query, {
    searchableFields: MediaSearchableFields,
    filterableFields: MediaFilterableFields,
  })

  const result = await queryBuilder
    .search()
    .filter()
    .include({
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

const getAllMedia = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Media, Prisma.MediaWhereInput, Prisma.MediaInclude>(prisma.media, query, {
    searchableFields: MediaSearchableFields,
    filterableFields: MediaFilterableFields,
  })

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false, isPublished: true })
    .include({
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
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { });
  }

  return media;
};

const getMediaBySlug = async (slug: string) => {
  const media = await prisma.media.findUnique({
    where: { slug, isDeleted: false },
    include: {
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
    }).catch(() => { });
  }

  return media;
};

const updateMedia = async (id: string, payload: IUpdateMediaPayload) => {
  const isMediaExist = await prisma.media.findUnique({
    where: { id, isDeleted: false },
  });

  if (!isMediaExist) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  let updateData: Prisma.MediaUpdateInput = {
    ...payload,
    genres: payload.genres ? (payload.genres as Genre[]) : undefined
  };

  // Delete the old poster if a completely new one was uploaded
  if (payload.posterUrl && isMediaExist.posterUrl && payload.posterUrl !== isMediaExist.posterUrl) {
    await deleteFileFromCloudinary(isMediaExist.posterUrl).catch(() => {});
  }

  // Delete old screenshots if they were removed/updated
  if (payload.screenshots !== undefined) {
    const oldScreenshots = isMediaExist.screenshots || [];
    const newScreenshots = payload.screenshots;
    
    // Find URLs that exist in the old database but were NOT passed in the current payload
    const removedScreenshots = oldScreenshots.filter(url => !newScreenshots.includes(url));
    
    // Fire deletions asynchronously to avoid blocking the update response unnessarily
    removedScreenshots.forEach(url => deleteFileFromCloudinary(url).catch(() => {}));
  }

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

  if (!isMediaExist) {
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
  getAllMediaByAdmin
};
