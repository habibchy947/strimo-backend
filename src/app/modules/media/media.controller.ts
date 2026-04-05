import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { MediaService } from './media.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createMedia = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  const newScreenshots = files?.['screenshots']?.map(file => file.path) || [];

  const payload = {
    ...req.body,
    posterUrl: files?.['file']?.[0]?.path,
  };
  
  if (newScreenshots.length > 0) {
    payload.screenshots = newScreenshots;
  }
  const result = await MediaService.createMedia(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Media created successfully',
    data: result,
  });
});

const getAllMedia = catchAsync(async (req: Request, res: Response) => {
  // Pass query completely to QueryBuilder
  const result = await MediaService.getAllMedia(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Media retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMediaById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await MediaService.getMediaById(id);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Details retrieved successfully',
    data: result,
  });
});

const getMediaBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const result = await MediaService.getMediaBySlug(slug);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Details retrieved successfully',
    data: result,
  });
});

const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  // Safely parse old screenshots if provided by frontend
  let existingScreenshots: string[] = [];
  let updateScreenshots = false;
  if (req.body.screenshots !== undefined) {
    updateScreenshots = true;
    try {
      existingScreenshots = typeof req.body.screenshots === 'string' ? JSON.parse(req.body.screenshots) : req.body.screenshots;
      if (!Array.isArray(existingScreenshots)) existingScreenshots = [req.body.screenshots];
    } catch {
      existingScreenshots = req.body.screenshots.split(',').map((s: string) => s.trim());
    }
  }

  const newScreenshots = files?.['screenshots']?.map(file => file.path) || [];
  if (newScreenshots.length > 0) updateScreenshots = true;

  const payload = {
    ...req.body,
  };

  if (files?.['file']?.[0]?.path) {
    payload.posterUrl = files['file'][0].path;
  }
  
  if (updateScreenshots) {
    payload.screenshots = [...existingScreenshots, ...newScreenshots];
  }

  const result = await MediaService.updateMedia(id, payload);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Media updated successfully',
    data: result,
  });
});

const softDeleteMedia = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await MediaService.softDeleteMedia(id);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Media deleted successfully',
    data: null,
  });
});

export const MediaController = {
  createMedia,
  getAllMedia,
  getMediaBySlug,
  updateMedia,
  softDeleteMedia,
  getMediaById,
};
