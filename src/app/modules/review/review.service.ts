import { prisma } from '../../lib/prisma';
import { Prisma, Review } from '../../../generated/prisma/client';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';
import { reviewFilterableFields, reviewSearchableFields } from './review.constant';
import { ReviewStatus, Role } from '../../../generated/prisma/enums';
import { ICreateReviewPayload, IUpdateReviewPayload } from './review.interface';

// create review
const createReview = async (userId: string, payload: ICreateReviewPayload) => {
  // Check if media exists
  const media = await prisma.media.findUnique({
    where: { id: payload.mediaId, isDeleted: false, isPublished: true },
  });

  if (!media) {
    throw new AppError(status.NOT_FOUND, 'Media not found');
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_mediaId: {
        userId,
        mediaId: payload.mediaId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(status.CONFLICT, 'You have already reviewed this media. You can update your existing review instead.');
  }

  const review = await prisma.review.create({
    data: {
      ...payload,
      userId,
    }
  });

  return review;
};

// get all reviews
const getAllReviews = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Review, Prisma.ReviewWhereInput, Prisma.ReviewInclude>(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ status: ReviewStatus.APPROVED })
    .include({
      user: {
        select: { id: true, name: true, image: true }
      },
      media: {
        select: { id: true, title: true, posterUrl: true }
      },
      likes: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      comments: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      _count: {
        select: { likes: true, comments: true }
      }
    })
    .sort()
    .paginate()
    .fields()
    .execute();
  return result;
};

const getAllReviewsByAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Review, Prisma.ReviewWhereInput, Prisma.ReviewInclude>(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      user: {
        select: { id: true, name: true, image: true }
      },
      media: {
        select: { id: true, title: true, posterUrl: true }
      },
      likes: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      comments: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      _count: {
        select: { likes: true, comments: true }
      }
    })
    .sort()
    .paginate()
    .fields()
    .execute();
  return result;
};

// get my reviews
const getMyReviews = async (userId: string) => {
  const review = await prisma.review.findMany({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      media: {
        select: { id: true, title: true, posterUrl: true }
      },
      likes: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      comments: {
        select: {
          id: true,
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      _count: {
        select: { likes: true, comments: true }
      }
    },
  });

  return review;
};

// update review
const updateReview = async (id: string, userId: string, userRole: string, payload: IUpdateReviewPayload) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, 'Review not found');
  }

  if (review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You do not have permission to update this review');
  }

  const result = await prisma.$transaction(async(tx)=> {
    const updatedReview = await tx.review.update({
      where: { id },
      data: payload,
    })

    // update average rating
    if (review.status === ReviewStatus.APPROVED) {
      const { _avg, _count } = await tx.review.aggregate({
        where: { mediaId: review.mediaId, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.media.update({
        where: { id: review.mediaId },
        data: {
          averageRating: _avg.rating || 0,
          totalRatings: _count.rating || 0,
          totalReviews: _count.rating || 0,
        },
      });
    }

    return updatedReview;
  })

  return result;
};

// change review status
const changeReviewStatus = async (id: string, newStatus: ReviewStatus) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, 'Review not found');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id },
      data: { status: newStatus },
    });

    // Update average rating
    const { _avg, _count } = await tx.review.aggregate({
      where: { mediaId: review.mediaId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalReviews = await tx.review.count({
      where: { mediaId: review.mediaId, status: ReviewStatus.APPROVED },
    });

    await tx.media.update({
      where: { id: review.mediaId },
      data: {
        averageRating: _avg.rating || 0,
        totalRatings: _count.rating || 0,
        totalReviews: totalReviews,
      },
    });

    return updatedReview;
  });

  return result;
};

// delete review
const deleteReview = async (id: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, 'Review not found');
  }

  const isOwner = review.userId === userId;
  const isAdmin = userRole === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError(status.FORBIDDEN, 'You do not have permission to delete this review');
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: { id },
    });

    // Update average rating
    const { _avg, _count } = await tx.review.aggregate({
      where: { mediaId: review.mediaId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.media.update({
      where: { id: review.mediaId },
      data: {
        averageRating: _avg.rating || 0,
        totalRatings: _count.rating || 0,
        totalReviews: _count.rating || 0,
      },
    });

    return deletedReview;
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getAllReviewsByAdmin,
  getMyReviews,
  updateReview,
  changeReviewStatus,
  deleteReview,
};
