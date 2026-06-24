import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Account | BrickQuote Pro',
  robots: { index: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  switch (profile?.role) {
    case 'admin':
      redirect('/dashboard/admin');
    case 'contractor':
      redirect('/dashboard/contractor');
    default:
      redirect('/dashboard/customer');
  }
}
