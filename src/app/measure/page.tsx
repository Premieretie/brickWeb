import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ARMeasureClient from '@/components/ARMeasureClient';

export const metadata: Metadata = {
  title: 'AR Smart Measure Tool',
  description:
    'Measure your fence line with AR, camera, or manual entry. Works on iOS and Android. Results load directly into the quote calculator.',
  alternates: { canonical: 'https://brickquotepro.com/measure' },
};

export default function MeasurePage() {
  return (
    <>
      <Header />
      <main>
        <ARMeasureClient />
      </main>
      <Footer />
    </>
  );
}
