import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { MediaRoutes } from '../modules/media/media.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { CommentRoutes } from '../modules/comment/comment.route';
import { UserRoutes } from '../modules/user/user.route';
import { WatchlistRoutes } from '../modules/watchlist/watchlist.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { PurchaseRoutes } from '../modules/purchase/purchase.route';
import { StatsRoutes } from '../modules/stats/stats.route';

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/media", MediaRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/comments", CommentRoutes);
router.use("/users", UserRoutes);
router.use("/watchlists", WatchlistRoutes);
router.use("/payments", PaymentRoutes);
router.use("/purchases", PurchaseRoutes);
router.use("/stats", StatsRoutes);

export const IndexRoutes = router;