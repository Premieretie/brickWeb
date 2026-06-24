import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId || !plan || !subscriptionId || !customerId) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

      await admin.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      await admin
        .from('contractors')
        .update({ subscription_plan: plan, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    if (event.type === 'invoice.payment_failed') {
      const subscriptionId = (event.data.object as Stripe.Invoice).subscription as string;
      if (subscriptionId) {
        await admin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await admin
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
