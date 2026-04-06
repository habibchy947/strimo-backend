import { prisma } from '../../lib/prisma';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';
import { Prisma, Comment } from '../../../generated/prisma/client';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { commentSearchableFields, commentFilterableFields } from './comment.constant';
import { CommentStatus, ReviewStatus, Role } from '../../../generated/prisma/enums';
import { ICreateCommentPayload, IUpdateCommentPayload } from './comment.interface';

// add comment
const addComment = async (reviewId: string, userId: string, payload: ICreateCommentPayload) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId, status: ReviewStatus.APPROVED },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, 'Review not found');
  }

  if (payload.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: payload.parentId, isDeleted: false, status: CommentStatus.APPROVED },
    });
    if (!parentComment) {
      throw new AppError(status.NOT_FOUND, 'Parent comment not found');
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content: payload.content,
        parentId: payload.parentId,
        userId,
        reviewId,
      },
    });

    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: { commentsCount: { increment: 1 } },
    });

    return { comment, review: updatedReview };
  });

  return result;
};

// get all comments
const getAllComments = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Comment, Prisma.CommentWhereInput, Prisma.CommentInclude>(prisma.comment, query, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields,
  });

  const baseWhere: Prisma.CommentWhereInput = { isDeleted: false, parentId: null, status: CommentStatus.APPROVED };

  const result = await queryBuilder
    .search()
    .filter()
    .where(baseWhere)
    .include({
      user: {
        select: { id: true, name: true, image: true },
      },
      replies: {
        where: { isDeleted: false, status: CommentStatus.APPROVED },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          }
        }
      }
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
};

// get all comments by admin
const getAllCommentsByAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Comment, Prisma.CommentWhereInput, Prisma.CommentInclude>(prisma.comment, query, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields,
  });

  const baseWhere: Prisma.CommentWhereInput = { parentId: null };

  const result = await queryBuilder
    .search()
    .filter()
    .where(baseWhere)
    .include({
      user: {
        select: { id: true, name: true, image: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          }
        }
      }
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
};

// get comment by id
const getCommentById = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      replies: {
        where: { isDeleted: false, status: CommentStatus.APPROVED },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          }
        }
      }
    }
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, 'Comment not found');
  }

  return comment;
};

// get my comments
const getMyComments = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Comment, Prisma.CommentWhereInput, Prisma.CommentInclude>(prisma.comment, query, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ userId, isDeleted: false })
    .include({
      user: {
        select: { id: true, name: true, image: true },
      },
      review: {
        select: {
          id: true,
          media: { select: { id: true, title: true, posterUrl: true } }
        }
      },
      parent: {
        select: {
          id: true,
          content: true,
          user: { select: { id: true, name: true } }
        }
      }
    })
    .sort()
    .paginate()
    .fields()
    .execute();

  return result;
}

// update comment
const updateComment = async (commentId: string, userId: string, payload: IUpdateCommentPayload) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
  });

  if (!comment) throw new AppError(status.NOT_FOUND, 'Comment not found');

  if (comment.userId !== userId) throw new AppError(status.FORBIDDEN, 'You do not have permission to update this comment');

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: payload.content },
  });

  return updatedComment;
};

// change comment status
const changeCommentStatus = async (commentId: string, newStatus: CommentStatus) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
  });

  if (!comment) throw new AppError(status.NOT_FOUND, 'Comment not found');

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { status: newStatus },
  });

  return updatedComment;
};

// delete comment
const deleteComment = async (commentId: string, userId: string, userRole: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, isDeleted: false },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, 'Comment not found');
  }

  const isOwner = comment.userId === userId;
  const isAdmin = userRole === Role.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError(status.FORBIDDEN, 'You do not have permission to delete this comment');
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedComment = await tx.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    await tx.review.update({
      where: { id: comment.reviewId },
      data: { commentsCount: { decrement: 1 } },
    });

    return deletedComment;
  });

  return result;
};

export const CommentService = {
  addComment,
  getAllComments,
  getAllCommentsByAdmin,
  getCommentById,
  getMyComments,
  updateComment,
  changeCommentStatus,
  deleteComment,
};
