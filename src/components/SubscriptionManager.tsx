'use client';

import { useState } from 'react';
import { planDetails } from '@/lib/stripe';

interface Props {
  currentPlan: string;
  subscriptionStatus: string;
}

export default function SubscriptionManager({ currentPlan, subscriptionStatus }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function manageBilling() {
    setLoading('portal');
    setError('');
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  }

  async function subscribe(plan: string) {
    setLoading(plan);
    setError('');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Subscription</h1>
        <p className="dashboard-subtitle">
          Current plan: <strong>{planDetails[currentPlan]?.name || currentPlan}</strong>
          {' · '}
          Billing status: <strong>{subscriptionStatus}</strong>
        </p>
        {subscriptionStatus === 'active' && (
          <button
            className="btn-secondary"
            onClick={manageBilling}
            disabled={loading === 'portal'}
            style={{ marginTop: 12 }}
          >
            {loading === 'portal' ? 'Opening…' : 'Manage billing'}
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="plans-grid">
        {Object.entries(planDetails).map(([plan, details]) => {
          const isCurrent = currentPlan === plan;
          const isActive = isCurrent && subscriptionStatus === 'active';

          return (
            <div key={plan} className={`plan-card ${isCurrent ? 'current' : ''}`}>
              <h2>{details.name}</h2>
              <div className="plan-price">
                <strong>${details.price}</strong>
                <span>/month</span>
              </div>
              <p className="plan-description">{details.description}</p>
              <ul className="plan-features">
                <li>Directory listing</li>
                <li>Photo gallery</li>
                <li>{details.leads === -1 ? 'Unlimited premium leads' : `${details.leads} premium leads per month`}</li>
                {plan === 'professional' && <li>Priority listing</li>}
                {plan === 'premium' && <li>Featured placement</li>}
              </ul>
              {isActive ? (
                <button className="btn-secondary btn-block" disabled>
                  Current plan
                </button>
              ) : (
                <button
                  className="btn-primary btn-block"
                  onClick={() => subscribe(plan)}
                  disabled={loading === plan}
                >
                  {loading === plan ? 'Redirecting…' : `Subscribe to ${details.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
