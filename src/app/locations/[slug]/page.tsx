import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locations, LocationPageData } from '@/lib/seo/locations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(locations).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = locations[slug];
  if (!location) return { title: 'Location Not Found' };
  return {
    title: location.metaTitle,
    description: location.description,
    alternates: { canonical: `https://brickquotepro.com/locations/${slug}` },
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location: LocationPageData | undefined = locations[slug];
  if (!location) notFound();

  return (
    <>
      <Header />
      <main className="seo-page">
        <div className="container">
          <div className="seo-hero">
            <h1>Brick Fence Cost {location.name}</h1>
            <p className="seo-lead">{location.description}</p>
            <div className="seo-cta">
              <Link href="/quote" className="btn-primary">Get an instant quote</Link>
              <Link href="/contractors" className="btn-secondary">Find a {location.name} bricklayer</Link>
            </div>
          </div>

          <section className="seo-section">
            <h2>Brick fencing in {location.name}</h2>
            <p>{location.intro}</p>
          </section>

          <section className="seo-section">
            <h2>Popular services in {location.name}</h2>
            <ul className="seo-list">
              {location.popularServices.map((service, idx) => (
                <li key={idx}>{service}</li>
              ))}
            </ul>
          </section>

          <section className="seo-section">
            <h2>Average cost in {location.name}</h2>
            <p>{location.averageCost}</p>
          </section>

          <section className="seo-section">
            <h2>Why use BrickQuote Pro in {location.name}?</h2>
            <p>{location.whyChoose}</p>
          </section>

          <section className="seo-section">
            <h2>Frequently asked questions</h2>
            <div className="seo-faqs">
              {location.faqs.map((faq, idx) => (
                <div key={idx} className="seo-faq">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
