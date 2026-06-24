import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContractorDashboard from '@/components/ContractorDashboard';

export const metadata: Metadata = {
  title: 'Contractor Dashboard | BrickQuote Pro',
  alternates: { canonical: 'https://brickquotepro.com/dashboard/contractor' },
  robots: { index: false },
};

export default async function ContractorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/contractor');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'contractor' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: contractor } = await supabase
    .from('contractors')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false });

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: serviceAreas } = await supabase
    .from('service_areas')
    .select('*')
    .eq('contractor_id', user.id);

  const { data: galleryImages } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('contractor_id', user.id);

  return (
    <>
      <Header />
      <ContractorDashboard
        contractor={contractor}
        leads={leads ?? []}
        subscription={subscription}
        serviceAreas={serviceAreas ?? []}
        galleryImages={galleryImages ?? []}
      />
      <Footer />
    </>
  );
}
