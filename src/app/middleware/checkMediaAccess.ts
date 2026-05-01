import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import AppError from '../errorHelper/AppError';
import status from 'http-status';
import { IRequestUser } from '../interfaces/req.user.interface';
import { PricingType, Role, SubscriptionStatus } from '../../generated/prisma/client';

export const checkMediaAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IRequestUser;
    const mediaId = (req.params.id || req.query.mediaId) as string;

    if (!mediaId) {
      throw new AppError(status.BAD_REQUEST, "Media ID is required");
    }

    // 1. Fetch Media Pricing info
    const media = await prisma.media.findUnique({
      where: { id: mediaId, isDeleted: false },
      select: { pricingType: true }
    });

    if (!media) {
      throw new AppError(status.NOT_FOUND, "Media not found");
    }

    // 2. If FREE, allow access
    if (media.pricingType === PricingType.FREE) {
      return next();
    }

    // 3. For PREMIUM, check User access
    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "You must be logged in to access premium content");
    }

    if ((user.role as string) === Role.ADMIN) {
      return next();
    }

    // Check for ACTIVE subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      }
    });

    if (activeSubscription) {
      return next();
    }

    // Check for individual PURCHASE (BUY or non-expired RENT)
    const validPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.userId,
        mediaId: mediaId,
        OR: [
          { purchaseType: 'BUY' },
          { 
            purchaseType: 'RENT',
            rentalExpiry: { gt: new Date() }
          }
        ]
      }
    });

    if (validPurchase) {
      return next();
    }

    // If no access found
    throw new AppError(status.FORBIDDEN, "You do not have access to this premium content. Please subscribe or purchase.");

  } catch (error) {
    next(error);
  }
};
