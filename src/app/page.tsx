import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BrickQuote Pro | Brick Fence & Wall Calculator Brisbane',
  alternates: { canonical: 'https://brickquotepro.com/' },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-background" />
          <div className="brick-pattern" />
          <div className="container">
            <div className="hero-content">
              <h1>
                Brisbane&apos;s <span className="highlight">Brick Fence</span> Quote Calculator
              </h1>
              <p className="hero-subtitle">
                Get an instant, accurate estimate for your brick fence, retaining wall or
                mailbox — no email required.
              </p>
              <div className="hero-cta">
                <Link href="/quote" className="btn-primary btn-large">
                  Get Free Quote
                </Link>
                <Link href="/measure" className="btn-secondary btn-large" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                  AR Measure Tool
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Quotes Generated</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Free to Use</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Project Types</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="project-types">
          <div className="container">
            <h2 className="section-title">What Are You Building?</h2>
            <p className="section-subtitle">Select your project type to get an instant price estimate.</p>
            <div className="types-grid">
              {[
                { title: 'Brick Fence', desc: 'Traditional double-skin brick fences with piers for privacy and security.', price: 'From $350/m' },
                { title: 'Brick Wall', desc: 'Solid brick walls for garden beds, feature walls and boundary lines.', price: 'From $280/m' },
                { title: 'Front Fence', desc: 'Street-facing fences with piers and feature finishes to boost kerb appeal.', price: 'From $400/m' },
                { title: 'Retaining Wall', desc: 'Engineered retaining walls for sloped blocks and erosion control.', price: 'From $450/m' },
                { title: 'Brick Mailbox', desc: 'Custom brick letterbox pillars to complement your fence or wall.', price: 'From $750' },
                { title: 'Mailbox + Fence', desc: 'Combined brick letterbox and fence package — save with a combined quote.', price: 'From $1,200' },
              ].map((item) => (
                <Link key={item.title} href="/quote" className="type-card">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span className="type-price">{item.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get your estimate in under 2 minutes.</p>
            <div className="steps">
              {[
                { n: '1', title: 'Choose Project', desc: 'Select your fence or wall type and material.' },
                { n: '2', title: 'Enter Dimensions', desc: 'Enter your length, height and number of piers.' },
                { n: '3', title: 'Instant Estimate', desc: 'Get a Budget, Typical or Premium price range instantly.' },
                { n: '4', title: 'Book a Bricklayer', desc: 'Submit your quote request to local Brisbane contractors.' },
              ].map((s, i) => (
                <div key={s.n} style={{ display: 'contents' }}>
                  <div className="step">
                    <div className="step-number">{s.n}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                  {i < 3 && <div className="step-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="how-to-use-section">
          <div className="container">
            <h2 className="section-title">Why Use BrickQuote Pro?</h2>
            <p className="section-subtitle">The fastest way to estimate your brickwork project in Brisbane.</p>
            <div className="how-to-use-grid">
              {[
                { title: 'No Email Required', desc: 'Get your estimate instantly — no signup, no spam, no waiting.' },
                { title: 'Live 3D Preview', desc: 'See your fence or wall in a real-time 3D view as you customise it.' },
                { title: 'Brisbane Prices', desc: 'Costs are calibrated for Brisbane, Ipswich, Logan and the Gold Coast.' },
                { title: 'AR Measure Tool', desc: 'Use your phone camera to measure your fence line with augmented reality.' },
                { title: 'PDF Download', desc: 'Save and share your quote as a PDF to show your builder or partner.' },
                { title: 'Connect with Contractors', desc: 'Submit your project and get matched with qualified local bricklayers.' },
              ].map((card) => (
                <div key={card.title} className="how-to-card">
                  <div className="how-to-number">✓</div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to get your quote?</h2>
              <p>It takes less than 2 minutes and it&apos;s completely free.</p>
              <Link href="/quote" className="btn-white btn-large btn-primary">
                Start the Calculator
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
