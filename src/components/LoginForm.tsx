'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <div className="auth-card">
      <h1>Log in</h1>
      <p className="auth-subtitle">Welcome back to BrickQuote Pro</p>
      {error && <p style={{ color: 'var(--danger, #e53e3e)', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email} required autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" value={password} required autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="auth-links">
        <p><Link href="/forgot-password">Forgot your password?</Link></p>
        <p>Don&apos;t have an account? <Link href="/signup">Sign up free</Link></p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="auth-card"><p>Loading…</p></div>}>
      <LoginFormInner />
    </Suspense>
  );
}
