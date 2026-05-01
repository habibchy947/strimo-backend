import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { PaymentService } from './payment.service';
import status from 'http-status';
import { envVars } from '../../../config/env';
import { stripe } from '../../../config/stripe.config';

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PaymentService.createCheckoutSession(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: 'Checkout session created successfully',
    data: result,
  });
});

// const handlerStripeWebHookEvent = catchAsync(async (req: Request, res: Response) => {
//   const signature = req.headers['stripe-signature'] as string;
//   const result = await PaymentService.handleWebhook(signature, req.body);

//   res.status(status.OK).json(result);
// });


const handlerStripeWebHookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing stripe signature or webhook secret");
      return res.status(status.BAD_REQUEST).json({ message: "Missing stripe signature or webhook secret" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      console.error("Error processing Stripe webhook :", error)
      return res.status(status.BAD_REQUEST).json({ message: "Error processing Stripe webhook" })
    }

    try {
      const result = await PaymentService.handlerStripeWebHookEvent(event);
      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stripe webhook event handled successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error handling stripe webhook event", error);
      sendResponse(res, {
        httpStatusCode: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error handling stripe webhook event"
      });
    }

  })

export const PaymentController = {
  createCheckoutSession,
  handlerStripeWebHookEvent
};
