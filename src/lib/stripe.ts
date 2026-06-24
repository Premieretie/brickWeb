import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return stripeClient;
}

export const planPriceIds: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export const planDetails: Record<string, { name: string; price: number; leads: number; description: string }> = {
  starter: {
    name: 'Starter',
    price: 49,
    leads: 10,
    description: 'Directory listing, gallery, and up to 10 premium leads per month.',
  },
  professional: {
    name: 'Professional',
    price: 99,
    leads: 25,
    description: 'Priority listing, verified badge, and up to 25 premium leads per month.',
  },
  premium: {
    name: 'Premium',
    price: 199,
    leads: -1,
    description: 'Featured placement, unlimited leads, and priority support.',
  },
};
