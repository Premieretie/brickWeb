import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscriptionManager from '@/components/SubscriptionManager';

export const metadata: Metadata = {
  title: 'Subscription | Contractor Dashboard | BrickQuote Pro',
  alternates: { canonical: 'https://brickquotepro.com/dashboard/contractor/subscription' },
  robots: { index: false },
};

export default async function ContractorSubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/contractor/subscription');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'contractor' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: contractor } = await supabase
    .from('contractors')
    .select('subscription_plan')
    .eq('user_id', user.id)
    .single();

  return (
    <>
      <Header />
      <main className="dashboard-page">
        <div className="container">
          <SubscriptionManager
            currentPlan={contractor?.subscription_plan || 'starter'}
            subscriptionStatus={subscription?.status || 'inactive'}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
