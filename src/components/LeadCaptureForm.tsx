'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitLead } from '@/app/quote/actions';
import type { QuoteState } from '@/lib/pricing';

interface Props {
  quoteState: QuoteState;
  quoteResult: { totalAvg: number; totalMin: number; totalMax: number; materialName: string };
}

export default function LeadCaptureForm({ quoteState, quoteResult }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitLead(quoteState, quoteResult, formData);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error || 'Submission failed. Please try again.');
    }
  }

  if (done) {
    return (
      <div className="lead-capture-success">
        <div className="success-icon">✓</div>
        <h3>Your request is submitted</h3>
        <p>
          A licensed bricklayer will contact you shortly. We have sent your estimate of{' '}
          <strong>${quoteResult.totalAvg.toLocaleString()}</strong> to our admin team for review.
        </p>
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="lead-capture-form">
      <h3>Ready to receive real quotes?</h3>
      <p className="lead-capture-subtitle">
        Submit your estimate to qualified bricklayers in Brisbane. Free, no obligation.
      </p>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="leadName">Full name</label>
          <input id="leadName" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="form-group">
          <label htmlFor="leadEmail">Email</label>
          <input id="leadEmail" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="leadPhone">Phone</label>
          <input id="leadPhone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="form-group">
          <label htmlFor="leadAddress">Address</label>
          <input id="leadAddress" name="address" type="text" autoComplete="street-address" />
        </div>
        <div className="form-group">
          <label htmlFor="leadSuburb">Suburb</label>
          <input id="leadSuburb" name="suburb" type="text" autoComplete="address-level2" />
        </div>
        <div className="form-group">
          <label htmlFor="leadNotes">Notes</label>
          <textarea id="leadNotes" name="notes" rows={3} placeholder="Any specific requirements or timing?" />
        </div>
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Submitting…' : 'Get real quotes'}
        </button>
      </form>
    </div>
  );
}
