import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContractorJoinForm from '@/components/ContractorJoinForm';
import { getCurrentUserForJoin } from './actions';

export const metadata: Metadata = {
  title: 'Join as a Contractor | BrickQuote Pro',
  description: 'Join the BrickQuote Pro contractor marketplace and receive qualified bricklaying leads.',
  alternates: { canonical: 'https://brickquotepro.com/join' },
  robots: { index: false },
};

export default async function JoinPage() {
  const user = await getCurrentUserForJoin();

  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="container">
          <ContractorJoinForm
            existingUserId={user?.id}
            existingEmail={user?.email}
            existingName={[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
