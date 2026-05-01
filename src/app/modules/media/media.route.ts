import { Router } from 'express';
import { MediaController } from './media.controller';
import { createMediaSchema, updateMediaSchema } from './media.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import { multerUpload } from '../../middleware/upload';

import { checkMediaAccess } from '../../middleware/checkMediaAccess';

const router = Router();

router.post(
  '/',
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "file", maxCount: 1 }, { name: "screenshots", maxCount: 2 }]),
  validateRequest(createMediaSchema),
  MediaController.createMedia
);

router.get('/', MediaController.getAllMedia);
router.get('/admin', checkAuth(Role.ADMIN), MediaController.getAllMediaByAdmin);
router.get('/single/:id', MediaController.getMediaById);
router.get('/play/:id', checkAuth(Role.USER, Role.ADMIN), checkMediaAccess, MediaController.playMedia);
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
