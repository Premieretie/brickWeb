import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | BrickQuote Pro',
  alternates: { canonical: 'https://brickquotepro.com/dashboard/admin' },
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: contractors } = await supabase
    .from('contractors')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <AdminDashboard
        profiles={profiles ?? []}
        contractors={contractors ?? []}
        leads={leads ?? []}
        subscriptions={subscriptions ?? []}
      />
      <Footer />
    </>
  );
}
