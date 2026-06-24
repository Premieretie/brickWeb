import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contractor Agreement | BrickQuote Pro',
  description: 'Agreement for contractors using the BrickQuote Pro marketplace.',
  alternates: { canonical: 'https://brickquotepro.com/contractor-agreement' },
  robots: { index: false },
};

export default function ContractorAgreementPage() {
  return (
    <>
      <Header />
      <main className="seo-page">
        <div className="container">
          <div className="seo-hero">
            <h1>Contractor Agreement</h1>
            <p className="seo-lead">This agreement outlines the terms for contractors listed on BrickQuote Pro.</p>
          </div>

          <div className="seo-section">
            <h2>1. Eligibility</h2>
            <p>To be listed on BrickQuote Pro, contractors must hold a valid trade licence, appropriate insurance, and any registrations required by Australian law.</p>
          </div>

          <div className="seo-section">
            <h2>2. Approval Process</h2>
            <p>All contractor applications are reviewed by BrickQuote Pro. We may approve, reject, or suspend accounts at our discretion. Approval does not guarantee leads.</p>
          </div>

          <div className="seo-section">
            <h2>3. Lead Subscription</h2>
            <p>Contractors must maintain an active subscription to receive premium leads. The number of leads included depends on the selected plan. Additional leads may be available depending on availability.</p>
          </div>

          <div className="seo-section">
            <h2>4. Conduct and Responsiveness</h2>
            <p>Contractors must respond to leads promptly and professionally. Failure to respond may result in reduced lead allocation or account suspension.</p>
          </div>

          <div className="seo-section">
            <h2>5. Customer Quotes and Contracts</h2>
            <p>All pricing, contracts, and work performed are between the contractor and the customer. BrickQuote Pro is not responsible for the outcome of any job.</p>
          </div>

          <div className="seo-section">
            <h2>6. Content and Reviews</h2>
            <p>Contractors are responsible for the accuracy of their profile information. Reviews are submitted by customers and may not be removed unless they violate our policies.</p>
          </div>

          <div className="seo-section">
            <h2>7. Fees and Payments</h2>
            <p>Subscription fees are processed through Stripe. Fees are non-refundable except where required by law. Contractors are responsible for their own taxes and insurance.</p>
          </div>

          <div className="seo-section">
            <h2>8. Termination</h2>
            <p>Either party may terminate the agreement. BrickQuote Pro may suspend or remove a contractor for breaches of this agreement or poor customer feedback.</p>
          </div>

          <div className="seo-section">
            <h2>9. Contact</h2>
            <p>For questions about this agreement, contact us at contractors@brickquotepro.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
