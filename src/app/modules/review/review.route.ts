import { Router } from 'express';
import { ReviewController } from './review.controller';
import { createReviewSchema, updateReviewSchema, changeReviewStatusSchema } from './review.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post(
  '/',
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

// Anyone can view APPROVED reviews publicly (handled automatically in service)
router.get('/', ReviewController.getAllReviews);

router.get('/admin/all', checkAuth(Role.ADMIN), ReviewController.getAllReviewsByAdmin);

router.get('/my-reviews', checkAuth(Role.USER, Role.ADMIN), ReviewController.getMyReviews);

router.patch(
  '/:id',
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

router.patch(
  '/:id/status',
  checkAuth(Role.ADMIN),
  validateRequest(changeReviewStatusSchema),
  ReviewController.changeReviewStatus
);

router.delete('/:id', checkAuth(Role.USER, Role.ADMIN), ReviewController.deleteReview);

export const ReviewRoutes = router;
