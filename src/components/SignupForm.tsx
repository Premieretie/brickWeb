'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'customer' | 'contractor'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="auth-card">
        <h1>Check your email</h1>
        <p className="auth-subtitle">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className="btn-primary btn-block" style={{ marginTop: 24 }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Create account</h1>
      <p className="auth-subtitle">Free to join. No credit card required.</p>
      {error && <p style={{ color: 'var(--danger, #e53e3e)', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" type="text" value={firstName} required onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" type="text" value={lastName} required onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} required minLength={8} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>I am a</label>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {(['customer', 'contractor'] as const).map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div className="auth-links">
        <p>Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
