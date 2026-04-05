import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { MediaRoutes } from '../modules/media/media.route';
import { ReviewRoutes } from '../modules/review/review.route';

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/media", MediaRoutes);
router.use("/reviews", ReviewRoutes);

export const IndexRoutes = router;