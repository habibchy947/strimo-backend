import { Router } from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import { changeUserStatusSchema, updateUserProfileSchema } from './user.validation';
import { multerUpload } from '../../middleware/upload';

const router = Router();

router.get(
  '/',
  checkAuth(Role.ADMIN),
  UserController.getAllUser
);

router.patch(
  '/my-profile',
  checkAuth(Role.USER),
  multerUpload.single('profilePhoto'),
  validateRequest(updateUserProfileSchema),
  UserController.updateMyProfile
);

router.patch(
  '/:userId/status',
  checkAuth(Role.ADMIN),
  validateRequest(changeUserStatusSchema),
  UserController.changeUserStatus
);

router.delete(
  '/:userId',
  checkAuth(Role.ADMIN),
  UserController.softDeleteUser
);

export const UserRoutes = router;
