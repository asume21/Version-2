import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set. Billing endpoints will be unavailable.");
}

// Only instantiate when the key is present to avoid runtime errors
export const stripe: Stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY)
  // Safe because all stripe usages in routes are guarded by isStripeEnabled()
  : ({} as unknown as Stripe);

export function isStripeEnabled() {
  return !!STRIPE_KEY;
}
