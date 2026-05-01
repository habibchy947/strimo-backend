import { Request, Response } from 'express';
import { PurchaseService } from './purchase.service';
import status from 'http-status';
import { IRequestUser } from '../../interfaces/req.user.interface';
import { sendResponse } from '../../shared/sendResponse';
import { catchAsync } from '../../shared/catchAsync';
import { IQueryParams } from '../../interfaces/query.interface';

const getMyPurchases = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PurchaseService.getMyPurchases(user.userId, req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'My purchases fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getAllPurchases = catchAsync(async (req: Request, res: Response) => {
  const result = await PurchaseService.getAllPurchases(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'All purchases fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const PurchaseController = {
  getMyPurchases,
  getAllPurchases,
};
