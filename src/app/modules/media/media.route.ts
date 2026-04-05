import { Router } from 'express';
import { MediaController } from './media.controller';
import { createMediaSchema, updateMediaSchema } from './media.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import { multerUpload } from '../../middleware/upload';

const router = Router();

router.post(
  '/',
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "file", maxCount: 1 }, { name: "screenshots", maxCount: 2 }]),
  validateRequest(createMediaSchema),
  MediaController.createMedia
);

router.get('/', MediaController.getAllMedia);
router.get('/single/:id', MediaController.getMediaById);
router.get('/:slug', MediaController.getMediaBySlug);

router.patch(
  '/:id',
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "file", maxCount: 1 }, { name: "screenshots", maxCount: 2 }]),
  validateRequest(updateMediaSchema),
  MediaController.updateMedia
);

router.delete('/:id', checkAuth(Role.ADMIN), MediaController.softDeleteMedia);

export const MediaRoutes = router;
