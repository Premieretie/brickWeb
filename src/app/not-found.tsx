import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 144px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div>
          <div style={{ fontSize: '6rem', marginBottom: 16 }}>🧱</div>
          <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Page Not Found</h1>
          <p style={{ color: 'var(--text-light)', marginBottom: 32, maxWidth: 400 }}>
            This page doesn&apos;t exist. Head back to the calculator to get your quote.
          </p>
          <Link href="/quote" className="btn-primary">Get a Quote</Link>
          <span style={{ margin: '0 12px', color: 'var(--text-light)' }}>or</span>
          <Link href="/" className="btn-secondary">Go Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
