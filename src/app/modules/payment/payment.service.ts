import { prisma } from '../../lib/prisma';
import { ICheckoutPayload, IStripeMetadata } from './payment.interface';
import { stripe } from './payment.utils';
import { envVars } from '../../../config/env';
import AppError from '../../errorHelper/AppError';
import status from 'http-status';
import Stripe from 'stripe';
import { IRequestUser } from '../../interfaces/req.user.interface';
import { PurchaseType, SubscriptionPlan } from '../../../generated/prisma/enums';
import { generateInvoicePdfBuffer, IInvoiceData } from '../../utils/pdf.utils';
import { uploadFileToCloudinary } from '../../utils/cloudinary';
import { sendEmail } from '../../utils/email';

const createCheckoutSession = async (payload: ICheckoutPayload, existingUser: IRequestUser) => {
  const { type, plan, mediaId, purchaseType } = payload;

  // 1. Validate User
  const user = await prisma.user.findUnique({ where: { id: existingUser.userId } });
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }

  // 2. Prepare Session Config
  let stripeCustomerId = user.stripeCustomerId;

  // Create Stripe Customer if not exists
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: existingUser.userId },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: existingUser.userId },
      data: { stripeCustomerId },
    });
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
    line_items: [],
    metadata: {
      userId: existingUser.userId,
      type,
    } as any,
  };

  // 3. Subscription Flow
  if (type === 'SUBSCRIPTION') {
    if (!plan) throw new AppError(status.BAD_REQUEST, 'Plan is required for subscription');

    // Check for existing active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: existingUser.userId, status: 'ACTIVE' },
    });
    if (existingSub) throw new AppError(status.BAD_REQUEST, 'User already has an active subscription');

    const priceId = plan === SubscriptionPlan.MONTHLY ? envVars.STRIPE_MONTHLY_PRICE_ID : envVars.STRIPE_YEARLY_PRICE_ID;

    sessionConfig.mode = 'subscription';
    sessionConfig.line_items?.push({ price: priceId, quantity: 1 });
    sessionConfig.metadata!.plan = plan;
  }

  // 4. Purchase Flow
  else if (type === 'PURCHASE') {
    if (!mediaId || !purchaseType) {
      throw new AppError(status.BAD_REQUEST, 'MediaId and PurchaseType are required for purchase');
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new AppError(status.NOT_FOUND, 'Media not found');

    // Check if already purchased (non-rental)
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: existingUser.userId,
        mediaId,
        purchaseType: 'BUY'
      },
    });
    if (existingPurchase) throw new AppError(status.BAD_REQUEST, 'You already own this media');

    // If renting, check if there's an active rental
    if (purchaseType === 'RENT') {
      const activeRental = await prisma.purchase.findFirst({
        where: {
          userId: existingUser.userId,
          mediaId,
          purchaseType: 'RENT',
          rentalExpiry: { gt: new Date() }
        }
      });
      if (activeRental) throw new AppError(status.BAD_REQUEST, 'You already have an active rental for this media');
    }

    const price = purchaseType === 'BUY' ? media.price : media.rentalPrice;

    sessionConfig.mode = 'payment';
    sessionConfig.line_items?.push({
      price_data: {
        currency: 'bdt',
        product_data: {
          name: `${purchaseType === 'BUY' ? 'Buy' : 'Rent'}: ${media.title}`,
          images: media.posterUrl ? [media.posterUrl] : [],
        },
        unit_amount: Math.round(price * 100), // convert to cents
      },
      quantity: 1,
    });
    sessionConfig.metadata!.mediaId = mediaId;
    sessionConfig.metadata!.purchaseType = purchaseType;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(sessionConfig);
  } catch (error: any) {
    // Handle the case where the customer ID in our DB no longer exists in Stripe
    if (error.code === 'resource_missing' && error.param === 'customer') {
      // 1. Create a fresh customer
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: existingUser.userId },
      });

      // 2. Update the DB with the new ID
      await prisma.user.update({
        where: { id: existingUser.userId },
        data: { stripeCustomerId: newCustomer.id },
      });

      // 3. Retry the session creation with the new ID
      sessionConfig.customer = newCustomer.id;
      session = await stripe.checkout.sessions.create(sessionConfig);
    } else {
      throw error;
    }
  }

  return { url: session.url };
};

const generateAndUploadInvoice = async (paymentId: string) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        subscription: true,
        purchase: {
          include: {
            media: true,
          },
        },
      },
    });
    console.log(payment);

    if (!payment) return;

    let itemName = 'Service';
    if (payment.subscription) {
      itemName = `Subscription: ${payment.subscription.plan}`;
    } else if (payment.purchase?.media) {
      itemName = `${payment.purchase.purchaseType}: ${payment.purchase.media.title}`;
    }

    const invoiceData: IInvoiceData = {
      transactionId: payment.transactionId || payment.id,
      paidAt: payment?.paidAt || new Date(),
      customerName: payment.user.name || 'Customer',
      customerEmail: payment.user.email,
      amount: payment.amount,
      currency: payment.currency,
      itemName,
      itemType: payment.subscriptionId ? 'SUBSCRIPTION' : 'PURCHASE',
    };

    const pdfBuffer = await generateInvoicePdfBuffer(invoiceData);
    const uploadResult = await uploadFileToCloudinary(pdfBuffer, `invoice-${invoiceData.transactionId}.pdf`);
    console.log("uploadResult", uploadResult);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { invoiceUrl: uploadResult.secure_url },
    });

    await sendEmail({
      to: payment.user.email,
      subject: `Your Invoice for ${itemName}`,
      templateName: 'invoice',
      templateData: {
        name: payment.user.name || 'Customer',
        itemName,
        amount: payment.amount,
        currency: payment.currency.toUpperCase(),
        transactionId: invoiceData.transactionId,
        invoiceUrl: uploadResult.secure_url,
      },
      attachments: [{
        filename: `invoice-${invoiceData.transactionId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
  } catch (error) {
    console.error('Error generating/uploading/sending invoice PDF:', error);
  }
};

// const handleWebhook = async (signature: string, rawBody: Buffer) => {
//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       envVars.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err: any) {
//     throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
//   }

//   switch (event.type) {
//     case 'checkout.session.completed': {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const metadata = session.metadata as unknown as IStripeMetadata;

//       const userId = metadata.userId;
//       const amount = session.amount_total ? session.amount_total / 100 : 0;
//       const transactionId = session.payment_intent as string || session.id;

//       if (metadata.type === 'SUBSCRIPTION') {
//         await prisma.$transaction(async (tx) => {
//           // Deactivate old subscriptions if any
//           await tx.subscription.updateMany({
//             where: { userId, status: 'ACTIVE' },
//             data: { status: 'INACTIVE', updatedAt: new Date() }
//           });

//           // Create new subscription
//           const subscription = await tx.subscription.create({
//             data: {
//               userId,
//               plan: metadata.plan as SubscriptionPlan,
//               status: 'ACTIVE',
//               stripeSubscriptionId: session.subscription as string,
//             }
//           });

//           // Create payment record
//           const payment = await tx.payment.create({
//             data: {
//               userId,
//               amount,
//               status: 'COMPLETED',
//               transactionId,
//               subscriptionId: subscription.id,
//               paidAt: new Date(),
//             }
//           });

//           // Generate and upload invoice
//           generateAndUploadInvoice(payment.id);
//         });
//       } else if (metadata.type === 'PURCHASE') {
//         const media = await prisma.media.findUnique({ where: { id: metadata.mediaId } });
//         const rentalDays = media?.rentalDays || 7;

//         await prisma.$transaction(async (tx) => {
//           const purchase = await tx.purchase.create({
//             data: {
//               userId,
//               mediaId: metadata.mediaId!,
//               purchaseType: metadata.purchaseType as PurchaseType,
//               price: amount,
//               rentalExpiry: metadata.purchaseType === 'RENT'
//                 ? new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000)
//                 : null
//             }
//           });

//           const payment = await tx.payment.create({
//             data: {
//               userId,
//               amount,
//               status: 'COMPLETED',
//               transactionId,
//               purchaseId: purchase.id,
//               paidAt: new Date(),
//             }
//           });

//           // Generate and upload invoice
//           generateAndUploadInvoice(payment.id);
//         });
//       }
//       break;
//     }

//     case 'invoice.payment_succeeded': {
//       // API Version 2026-03-25.dahlia might have different type definitions than the SDK v22.0.1
//       // We cast to any to access subscription and payment_intent safely at runtime
//       const invoice = event.data.object as any;
//       const subscriptionId = invoice.subscription as string;

//       if (subscriptionId) {
//         const dbSubscription = await prisma.subscription.findUnique({
//           where: { stripeSubscriptionId: subscriptionId }
//         });

//         if (dbSubscription) {
//           const payment = await prisma.payment.create({
//             data: {
//               userId: dbSubscription.userId,
//               amount: invoice.amount_paid / 100,
//               status: 'COMPLETED',
//               transactionId: (invoice.payment_intent as string) || (invoice.id as string),
//               subscriptionId: dbSubscription.id,
//               paidAt: new Date(),
//             }
//           });

//           generateAndUploadInvoice(payment.id);
//         }
//       }
//       break;
//     }

//     case 'customer.subscription.deleted': {
//       const subscription = event.data.object as Stripe.Subscription;
//       await prisma.subscription.updateMany({
//         where: { stripeSubscriptionId: subscription.id },
//         data: { status: 'CANCELLED', updatedAt: new Date() }
//       });
//       break;
//     }
//   }

//   return { received: true };
// };


const handlerStripeWebHookEvent = async (event: Stripe.Event) => {
  // Idempotency Check: Prevent processing the same event multiple times (handles P2028 contention)
  const existingPayment = await prisma.payment.findUnique({
    where: { stripeEventId: event.id }
  });

  if (existingPayment) {
    console.log(`Webhook event ${event.id} already processed. Skipping.`);
    return { message: `Webhook event ${event.id} already processed` };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata;
      if (!metadata) {
        throw new AppError(status.BAD_REQUEST, "Metadata is required");
      }
      const userId = metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      const transactionId = session.payment_intent as string || session.id;

      if (metadata.type === 'SUBSCRIPTION') {
        const paymentId = await prisma.$transaction(async (tx) => {
          // Deactivate old subscriptions if any
          await tx.subscription.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'INACTIVE', updatedAt: new Date() }
          });

          // Create new subscription
          const subscription = await tx.subscription.create({
            data: {
              userId,
              plan: metadata.plan as SubscriptionPlan,
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
            }
          });

          // Create payment record
          const payment = await tx.payment.create({
            data: {
              userId,
              amount,
              status: 'COMPLETED',
              stripeEventId: event.id,
              transactionId,
              subscriptionId: subscription.id,
              paidAt: new Date(),
            }
          });

          return payment.id;
        });

        // Generate and upload invoice
        generateAndUploadInvoice(paymentId);
      } else if (metadata.type === 'PURCHASE') {
        const media = await prisma.media.findUnique({ where: { id: metadata.mediaId } });
        const rentalDays = media?.rentalDays || 7;

        const paymentId = await prisma.$transaction(async (tx) => {
          const purchase = await tx.purchase.create({
            data: {
              userId,
              mediaId: metadata.mediaId!,
              purchaseType: metadata.purchaseType as PurchaseType,
              price: amount,
              rentalExpiry: metadata.purchaseType === 'RENT'
                ? new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000)
                : null
            }
          });

          const payment = await tx.payment.create({
            data: {
              userId,
              amount,
              status: 'COMPLETED',
              stripeEventId: event.id,
              transactionId,
              purchaseId: purchase.id,
              paidAt: new Date(),
            }
          });

          return payment.id;
        });

        // Generate and upload invoice
        generateAndUploadInvoice(paymentId);
      }
      break;
    };
    case 'invoice.payment_succeeded': {
      // API Version 2026-03-25.dahlia might have different type definitions than the SDK v22.0.1
      // We cast to any to access subscription and payment_intent safely at runtime
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;
      if (subscriptionId) {
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId }
        });

        if (dbSubscription) {
          const payment = await prisma.payment.create({
            data: {
              userId: dbSubscription.userId,
              amount: invoice.amount_paid / 100,
              status: 'COMPLETED',
              transactionId: (invoice.payment_intent as string) || (invoice.id as string),
              subscriptionId: dbSubscription.id,
              paidAt: new Date(),
            }
          });

          generateAndUploadInvoice(payment.id);
        }
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'CANCELLED', updatedAt: new Date() }
      });
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session ${session.id} expired. Marking associated payment as failed`);
      break;
    };
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(`Payment intent ${session.id} failed. Marking associated payment as failed`);
      break;
    };
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook event ${event.id} processed successfully` }
}

export const PaymentService = {
  createCheckoutSession,
  // handleWebhook,
  handlerStripeWebHookEvent
};
