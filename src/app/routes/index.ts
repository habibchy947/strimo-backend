import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { MediaRoutes } from '../modules/media/media.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { CommentRoutes } from '../modules/comment/comment.route';
import { UserRoutes } from '../modules/user/user.route';
import { WatchlistRoutes } from '../modules/watchlist/watchlist.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/media", MediaRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/comments", CommentRoutes);
router.use("/users", UserRoutes);
router.use("/watchlists", WatchlistRoutes);
router.use("/payments", PaymentRoutes);

export const IndexRoutes = router;