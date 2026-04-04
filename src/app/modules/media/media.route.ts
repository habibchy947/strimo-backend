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
  checkAuth(Role.USER),
  multerUpload.single("file"),
  validateRequest(createMediaSchema),
  MediaController.createMedia
);

router.get('/', MediaController.getAllMedia);
router.get('/single/:id', MediaController.getMediaById);
router.get('/:slug', MediaController.getMediaBySlug);

router.patch(
  '/:id',
  checkAuth(Role.USER),
  multerUpload.single("file"),
  validateRequest(updateMediaSchema),
  MediaController.updateMedia
);

router.delete('/:id', checkAuth(Role.USER), MediaController.softDeleteMedia);

export const MediaRoutes = router;
