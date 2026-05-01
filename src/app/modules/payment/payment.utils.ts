import Stripe from 'stripe';
import { envVars } from '../../../config/env';

export const stripe = new Stripe(envVars.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia', // Use latest stable version or user's preference
});
