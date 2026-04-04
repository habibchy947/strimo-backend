import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { MediaRoutes } from '../modules/media/media.route';

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/media", MediaRoutes);

export const IndexRoutes = router;