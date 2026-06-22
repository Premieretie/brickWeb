import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteCalculator from '@/components/QuoteCalculator';

export const metadata: Metadata = {
  title: 'Brick Fence Calculator — Instant Quote',
  description:
    'Get an instant brick fence, retaining wall or mailbox quote. Enter your dimensions and get a Budget, Typical or Premium price range. No signup required.',
  alternates: { canonical: 'https://brickquotepro.com/quote' },
};

export default function QuotePage() {
  return (
    <>
      <Header />
      <main>
        <QuoteCalculator />
      </main>
      <Footer />
    </>
  );
}
