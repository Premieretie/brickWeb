import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SignupForm from '@/components/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free BrickQuote Pro account to save quotes, request contractor quotes and manage your projects.',
  alternates: { canonical: 'https://brickquotepro.com/signup' },
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <SignupForm />
      </main>
      <Footer />
    </>
  );
}
