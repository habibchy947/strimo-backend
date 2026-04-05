import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { ReviewService } from './review.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  // If req.user is undefined (public route), userRole is undefined
  const userRole = req.user?.role;
  const result = await ReviewService.getAllReviews(req.query as IQueryParams, userRole);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;  
  const result = await ReviewService.getMyReviews(userId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const result = await ReviewService.updateReview(id, userId, userRole, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const changeReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  const result = await ReviewService.changeReviewStatus(id, req.body.status);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Review status changed successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user.userId;
  const userRole = req.user.role;

  await ReviewService.deleteReview(id, userId, userRole);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getMyReviews,
  updateReview,
  changeReviewStatus,
  deleteReview,
};
