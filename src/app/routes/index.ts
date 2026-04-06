import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { MediaRoutes } from '../modules/media/media.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { CommentRoutes } from '../modules/comment/comment.route';

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/media", MediaRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/comments", CommentRoutes);

export const IndexRoutes = router;