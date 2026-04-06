import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { UserService } from './user.service';
import status from 'http-status';
import { IQueryParams } from '../../interfaces/query.interface';
import { IRequestUser } from '../../interfaces/req.user.interface';

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUser(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.userId;
  const { status: newStatus } = req.body;
  
  await UserService.changeUserStatus(id as string, newStatus, req.user as IRequestUser);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `User status changed to ${newStatus.toLowerCase()} successfully`,
    data: null,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const payload = { ...req.body };

  // If a profile photo was uploaded via multer/Cloudinary, use its URL
  if (req.file?.path) {
    payload.image = req.file.path;
  }

  const result = await UserService.updateMyProfile(userId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.userId;

  await UserService.softDeleteUser(id as string, req.user as IRequestUser);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

export const UserController = {
  getAllUser,
  changeUserStatus,
  updateMyProfile,
  softDeleteUser,
};
