import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomerDashboard from '@/components/CustomerDashboard';

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  robots: { index: false },
};

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main className="dashboard-page">
        <div className="container">
          <CustomerDashboard
            profile={profile}
            quotes={quotes ?? []}
            leads={leads ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
