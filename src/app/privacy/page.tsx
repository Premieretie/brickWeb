import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | BrickQuote Pro',
  description: 'Privacy policy for BrickQuote Pro users.',
  alternates: { canonical: 'https://brickquotepro.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="seo-page">
        <div className="container">
          <div className="seo-hero">
            <h1>Privacy Policy</h1>
            <p className="seo-lead">Last updated: June 2026</p>
          </div>

          <div className="seo-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email, phone number, address, and project details. We also collect data about how you use our website.</p>
          </div>

          <div className="seo-section">
            <h2>2. How We Use Information</h2>
            <p>We use your information to provide our services, match leads with contractors, process payments, improve our platform, and communicate with you.</p>
          </div>

          <div className="seo-section">
            <h2>3. Sharing Information</h2>
            <p>Customer lead information is shared with approved contractors to obtain quotes. Contractor information is shared publicly in our directory. We do not sell personal information to third parties.</p>
          </div>

          <div className="seo-section">
            <h2>4. Payment Information</h2>
            <p>Payments are processed securely by Stripe. We do not store your full payment card details on our servers.</p>
          </div>

          <div className="seo-section">
            <h2>5. Cookies and Analytics</h2>
            <p>We use cookies and analytics tools to understand website usage and improve user experience. You can manage cookie preferences through your browser settings.</p>
          </div>

          <div className="seo-section">
            <h2>6. Data Security</h2>
            <p>We use industry-standard security measures, including encryption and secure hosting, to protect your data. However, no online service is completely secure.</p>
          </div>

          <div className="seo-section">
            <h2>7. Your Rights</h2>
            <p>You can request access to, correction of, or deletion of your personal information by contacting us. We will respond to requests in accordance with applicable law.</p>
          </div>

          <div className="seo-section">
            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
          </div>

          <div className="seo-section">
            <h2>9. Contact</h2>
            <p>For privacy-related questions, contact us at privacy@brickquotepro.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
