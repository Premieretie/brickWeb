import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: contractor } = await supabase
    .from('contractors')
    .select('business_name, description')
    .eq('slug', slug)
    .eq('approval_status', 'approved')
    .single();

  if (!contractor) {
    return { title: 'Contractor Not Found | BrickQuote Pro' };
  }

  return {
    title: `${contractor.business_name} | BrickQuote Pro`,
    description: contractor.description || `${contractor.business_name} is a licensed bricklaying contractor on BrickQuote Pro.`,
    alternates: { canonical: `https://brickquotepro.com/contractors/${slug}` },
  };
}

export default async function ContractorProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: contractor } = await supabase
    .from('contractors')
    .select('*, service_areas(*), gallery_images(*), reviews(*)')
    .eq('slug', slug)
    .eq('approval_status', 'approved')
    .eq('is_active', true)
    .single();

  if (!contractor) {
    notFound();
  }

  const reviews = contractor.reviews || [];
  const averageRating = reviews.length
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;
  const roundedRating = Math.round(averageRating * 10) / 10;

  return (
    <>
      <Header />
      <main className="contractor-profile-page">
        <div className="container">
          <div className="contractor-profile-header">
            {contractor.logo_url ? (
              <Image
                src={contractor.logo_url}
                alt={contractor.business_name}
                width={100}
                height={100}
                className="contractor-profile-logo"
              />
            ) : (
              <div className="contractor-profile-logo-placeholder">{contractor.business_name.charAt(0)}</div>
            )}
            <div>
              <h1>{contractor.business_name}</h1>
              {reviews.length > 0 && (
                <p className="contractor-profile-rating">
                  {'★'.repeat(Math.round(roundedRating))}
                  {'☆'.repeat(5 - Math.round(roundedRating))}
                  <span> {roundedRating} out of 5 ({reviews.length} reviews)</span>
                </p>
              )}
              <p className="contractor-meta-line">
                {contractor.years_experience ? `${contractor.years_experience} years experience · ` : ''}
                {contractor.insurance_verified ? 'Insurance verified · ' : ''}
                {contractor.subscription_plan === 'premium' ? 'Premium contractor' : 'Verified contractor'}
              </p>
            </div>
          </div>

          <div className="contractor-profile-grid">
            <div className="contractor-profile-main">
              <section className="profile-section">
                <h2>About</h2>
                <p>{contractor.description || 'No business description provided.'}</p>
              </section>

              {(contractor.gallery_images || []).length > 0 && (
                <section className="profile-section">
                  <h2>Gallery</h2>
                  <div className="gallery-grid">
                    {contractor.gallery_images.map((img: { id: string; url: string; caption: string | null }) => (
                      <div key={img.id} className="gallery-item">
                        <Image src={img.url} alt={img.caption || 'Project photo'} width={300} height={160} />
                        {img.caption && <p>{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {reviews.length > 0 && (
                <section className="profile-section">
                  <h2>Reviews</h2>
                  <div className="reviews-list">
                    {reviews.map((review: { id: string; rating: number; title: string | null; content: string | null; created_at: string }) => (
                      <div key={review.id} className="review-card">
                        <p className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </p>
                        {review.title && <h4>{review.title}</h4>}
                        {review.content && <p>{review.content}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="contractor-profile-sidebar">
              <div className="sidebar-card">
                <h3>Contact</h3>
                {contractor.phone && <p><strong>Phone:</strong> {contractor.phone}</p>}
                {contractor.email && <p><strong>Email:</strong> {contractor.email}</p>}
                {contractor.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={contractor.website} target="_blank" rel="noopener noreferrer">{contractor.website}</a>
                  </p>
                )}
                {contractor.abn && <p><strong>ABN:</strong> {contractor.abn}</p>}

                <h3 style={{ marginTop: 24 }}>Service Areas</h3>
                <p>{(contractor.service_areas || []).map((a: { suburb: string }) => a.suburb).join(', ')}</p>

                <a href="/quote" className="btn-primary btn-block" style={{ marginTop: 24 }}>
                  Request a quote
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
