import { PaymentType, PurchaseType, SubscriptionPlan } from "../../../generated/prisma/client";


export interface ICheckoutPayload {
  userId: string;
  type: PaymentType;
  plan?: SubscriptionPlan;
  mediaId?: string;
  purchaseType?: PurchaseType;
}

export interface IStripeMetadata {
  userId: string;
  type: PaymentType;
  plan?: SubscriptionPlan;
  mediaId?: string;
  purchaseType?: PurchaseType;
}
