import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services, ServicePageData } from '@/lib/seo/services';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug];
  if (!service) return { title: 'Service Not Found' };
  return {
    title: service.metaTitle,
    description: service.description,
    alternates: { canonical: `https://brickquotepro.com/services/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service: ServicePageData | undefined = services[slug];
  if (!service) notFound();

  return (
    <>
      <Header />
      <main className="seo-page">
        <div className="container">
          <div className="seo-hero">
            <h1>{service.title}</h1>
            <p className="seo-lead">{service.description}</p>
            <div className="seo-cta">
              <Link href="/quote" className="btn-primary">Get an instant quote</Link>
              <Link href="/contractors" className="btn-secondary">Find a bricklayer</Link>
            </div>
          </div>

          <section className="seo-section">
            <h2>What is a {service.title.split(' ')[0].toLowerCase()} {service.title.split(' ').slice(1, 2).join(' ').toLowerCase()}?</h2>
            <p>{service.whatIs}</p>
          </section>

          <section className="seo-section">
            <h2>Benefits</h2>
            <ul className="seo-list">
              {service.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </section>

          <section className="seo-section">
            <h2>Average cost in Brisbane</h2>
            <p>{service.averageCost}</p>
          </section>

          <section className="seo-section">
            <h2>Frequently asked questions</h2>
            <div className="seo-faqs">
              {service.faqs.map((faq, idx) => (
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
