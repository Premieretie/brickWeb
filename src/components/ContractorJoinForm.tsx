'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitContractorApplication } from '@/app/join/actions';

interface Props {
  existingUserId?: string;
  existingEmail?: string;
  existingName?: string;
}

export default function ContractorJoinForm({ existingUserId, existingEmail, existingName }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (existingUserId) {
      formData.append('existingUserId', existingUserId);
    }

    const result = await submitContractorApplication(formData);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error || 'Submission failed. Please try again.');
    }
  }

  if (done) {
    return (
      <div className="auth-card">
        <h1>Application submitted</h1>
        <p className="auth-subtitle">
          Thank you for joining BrickQuote Pro. Your contractor profile is under review and will be approved by an admin shortly.
        </p>
        <Link href="/" className="btn-primary btn-block" style={{ marginTop: 24 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const [firstName, lastName] = existingName ? existingName.split(' ') : ['', ''];

  return (
    <div className="auth-card">
      <h1>Join as a contractor</h1>
      <p className="auth-subtitle">List your bricklaying business and receive qualified leads.</p>
      {error && <p style={{ color: 'var(--danger, #e53e3e)', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="businessName">Business name</label>
          <input id="businessName" name="businessName" type="text" required autoComplete="organization" />
        </div>
        <div className="form-group">
          <label htmlFor="contactName">Contact name</label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            required
            autoComplete="name"
            defaultValue={existingName || ''}
          />
        </div>
        <div className="form-group">
          <label htmlFor="abn">ABN</label>
          <input id="abn" name="abn" type="text" autoComplete="off" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={existingEmail || ''}
            readOnly={!!existingEmail}
          />
        </div>
        {!existingUserId && (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="form-group">
          <label htmlFor="website">Website (optional)</label>
          <input id="website" name="website" type="url" autoComplete="url" placeholder="https://example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="description">About your business</label>
          <textarea id="description" name="description" rows={4} placeholder="Tell homeowners about your experience..." />
        </div>
        <div className="form-group">
          <label htmlFor="serviceAreas">Service areas (comma separated)</label>
          <input
            id="serviceAreas"
            name="serviceAreas"
            type="text"
            placeholder="Brisbane, Ipswich, Logan"
          />
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
      <div className="auth-links">
        <p>Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
