import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { CommentService } from './comment.service';
import status from 'http-status';
import { IQueryParams } from '../../interfaces/query.interface';

const addComment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.reviewId as string;
  const userId = req.user.userId;

  const result = await CommentService.addComment(id, userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: result.comment,
  });
});

const getAllComments = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getAllComments(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllCommentsByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getAllCommentsByAdmin(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.commentId as string;

  const result = await CommentService.getCommentById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});

const getMyComments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await CommentService.getMyComments(userId, req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'My comments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.commentId as string;
  const userId = req.user.userId;

  const result = await CommentService.updateComment(id, userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const changeCommentStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.commentId as string;
  
  const result = await CommentService.changeCommentStatus(id, req.body.status);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comment status changed successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.commentId as string;
  const userId = req.user.userId;
  const userRole = req.user.role;

  await CommentService.deleteComment(id, userId, userRole);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

export const CommentController = {
  addComment,
  getAllComments,
  getAllCommentsByAdmin,
  getCommentById,
  getMyComments,
  updateComment,
  changeCommentStatus,
  deleteComment,
};
