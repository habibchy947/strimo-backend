import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { Role } from '../../../generated/prisma/client';
import { checkAuth } from '../../middleware/checkAuth';

const router = Router();

// Create checkout session (Protected - Requires authentication)
router.post(
  '/create-checkout-session',
  checkAuth(Role.USER, Role.ADMIN),
  PaymentController.createCheckoutSession
);

export const PaymentRoutes = router;
