import { Router } from 'express';
import { PurchaseController } from './purchase.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.get(
  '/my-purchases',
  checkAuth(Role.USER, Role.ADMIN),
  PurchaseController.getMyPurchases
);

router.get(
  '/',
  checkAuth(Role.ADMIN),
  PurchaseController.getAllPurchases
);

export const PurchaseRoutes = router;
