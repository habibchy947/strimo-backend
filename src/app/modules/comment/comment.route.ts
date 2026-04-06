import { Router } from 'express';
import { CommentController } from './comment.controller';
import { createCommentSchema, changeCommentStatusSchema, updateCommentSchema } from './comment.validation';
import { validateRequest } from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post(
  '/:reviewId',
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createCommentSchema),
  CommentController.addComment
);

router.get('/', CommentController.getAllComments);

router.get('/admin/all/cmnts', checkAuth(Role.ADMIN), CommentController.getAllCommentsByAdmin);

router.get('/:commentId', CommentController.getCommentById);

router.get('/my-comments/me', checkAuth(Role.USER, Role.ADMIN), CommentController.getMyComments);

router.patch(
  '/:commentId',
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(updateCommentSchema),
  CommentController.updateComment
);

router.patch(
  '/:commentId/status',
  checkAuth(Role.ADMIN),
  validateRequest(changeCommentStatusSchema),
  CommentController.changeCommentStatus
);

router.delete(
  '/:commentId',
  checkAuth(Role.USER, Role.ADMIN),
  CommentController.deleteComment
);

export const CommentRoutes = router;
