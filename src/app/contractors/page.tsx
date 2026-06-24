import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Find a Bricklayer | BrickQuote Pro',
  description: 'Browse licensed bricklayers, fence builders, and retaining wall contractors in Brisbane.',
  alternates: { canonical: 'https://brickquotepro.com/contractors' },
};

export default async function ContractorsPage() {
  const supabase = await createClient();

  const { data: contractors } = await supabase
    .from('contractors')
    .select('*, service_areas(suburb), reviews(rating)')
    .eq('approval_status', 'approved')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  const contractorsWithRatings = (contractors ?? []).map((c: any) => {
    const reviews = c.reviews || [];
    const avgRating = reviews.length
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;
    return {
      ...c,
      review_count: reviews.length,
      average_rating: Math.round(avgRating * 10) / 10,
    };
  });

  return (
    <>
      <Header />
      <main className="contractors-page">
        <div className="container">
          <div className="contractors-header">
            <h1>Find a bricklayer in Brisbane</h1>
            <p>Browse licensed and reviewed contractors. Request a quote through any profile.</p>
          </div>

          {contractorsWithRatings.length === 0 ? (
            <div className="empty-state">
              <p>No approved contractors yet. Check back soon or <Link href="/join">apply to join</Link>.</p>
            </div>
          ) : (
            <div className="contractors-grid">
              {contractorsWithRatings.map((contractor) => (
                <Link
                  key={contractor.id}
                  href={`/contractors/${contractor.slug}`}
                  className="contractor-card"
                >
                  <div className="contractor-card-header">
                    {contractor.logo_url ? (
                      <Image
                        src={contractor.logo_url}
                        alt={contractor.business_name}
                        width={64}
                        height={64}
                        className="contractor-logo"
                      />
                    ) : (
                      <div className="contractor-logo-placeholder">{contractor.business_name.charAt(0)}</div>
                    )}
                    <div>
                      <h2>{contractor.business_name}</h2>
                      {contractor.review_count > 0 && (
                        <p className="contractor-rating">
                          {'★'.repeat(Math.round(contractor.average_rating))}
                          {'☆'.repeat(5 - Math.round(contractor.average_rating))}
                          <span> ({contractor.review_count})</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="contractor-description">
                    {contractor.description || 'Licensed bricklaying contractor serving Brisbane.'}
                  </p>
                  <div className="contractor-meta">
                    <span>{(contractor.service_areas || []).map((a: { suburb: string }) => a.suburb).join(', ')}</span>
                    <span className="contractor-plan">{contractor.subscription_plan}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
