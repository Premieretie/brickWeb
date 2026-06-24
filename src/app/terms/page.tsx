import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | BrickQuote Pro',
  description: 'Terms of service for using BrickQuote Pro.',
  alternates: { canonical: 'https://brickquotepro.com/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="seo-page">
        <div className="container">
          <div className="seo-hero">
            <h1>Terms of Service</h1>
            <p className="seo-lead">Last updated: June 2026</p>
          </div>

          <div className="seo-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By using BrickQuote Pro, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </div>

          <div className="seo-section">
            <h2>2. Service Description</h2>
            <p>BrickQuote Pro provides an online marketplace connecting homeowners and businesses seeking bricklaying, fencing, and retaining wall services with licensed contractors.</p>
          </div>

          <div className="seo-section">
            <h2>3. User Accounts</h2>
            <p>Users must provide accurate information when creating an account. You are responsible for keeping your account credentials secure.</p>
          </div>

          <div className="seo-section">
            <h2>4. Contractor Listings</h2>
            <p>Contractors must hold valid licences and insurance for the services they offer. BrickQuote Pro reserves the right to approve, suspend, or remove contractor listings at any time.</p>
          </div>

          <div className="seo-section">
            <h2>5. Leads and Quotes</h2>
            <p>Leads submitted by customers are shared with approved contractors. BrickQuote Pro does not guarantee that every lead will result in a contract or quote.</p>
          </div>

          <div className="seo-section">
            <h2>6. Payments and Subscriptions</h2>
            <p>Contractor subscriptions are billed through Stripe. Payments are non-refundable unless required by law. Subscriptions renew automatically unless cancelled.</p>
          </div>

          <div className="seo-section">
            <h2>7. Limitation of Liability</h2>
            <p>BrickQuote Pro is not a party to any contract between customers and contractors. We are not liable for the quality, timing, or outcome of any work performed.</p>
          </div>

          <div className="seo-section">
            <h2>8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </div>

          <div className="seo-section">
            <h2>9. Contact</h2>
            <p>For questions about these terms, contact us at support@brickquotepro.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
