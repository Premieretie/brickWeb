import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your BrickQuote Pro account to save quotes and manage your projects.',
  alternates: { canonical: 'https://brickquotepro.com/login' },
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
