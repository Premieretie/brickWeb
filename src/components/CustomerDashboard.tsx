'use client';

import Link from 'next/link';
import type { Quote as QuoteType, Lead as LeadType, Profile as ProfileType } from '@/lib/types';

interface Props {
  profile: ProfileType | null;
  quotes: QuoteType[];
  leads: LeadType[];
}

export default function CustomerDashboard({ profile, quotes, leads }: Props) {
  const leadStatusLabels: Record<string, string> = {
    new: 'New',
    assigned: 'Assigned',
    contacted: 'Contacted',
    quoted: 'Quoted',
    won: 'Won',
    lost: 'Lost',
  };
  return (
    <>
      <div className="dashboard-header">
        <h1>Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}</h1>
        <p>Manage your saved quotes and project leads.</p>
      </div>
      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <nav>
            <Link href="/dashboard/customer" className="active">Overview</Link>
            <Link href="/account">Account</Link>
            <Link href="/quote">New Quote</Link>
          </nav>
        </aside>
        <div className="dashboard-main">
          <div className="stats-grid">
            <div className="stat-card">
              <span>Saved Quotes</span>
              <strong>{quotes.length}</strong>
            </div>
            <div className="stat-card">
              <span>Submitted Leads</span>
              <strong>{leads.length}</strong>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Saved Quotes</h2>
            {quotes.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>
                No saved quotes yet. <Link href="/quote">Start a quote</Link>.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Project</th>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Material</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Estimate</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id}>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{q.project_type}</td>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{q.material}</td>
                      <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        ${q.estimate?.toLocaleString() || '-'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {new Date(q.created_at).toLocaleDateString('en-AU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-card" style={{ marginTop: 24 }}>
            <h2>Submitted Leads</h2>
            {leads.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>
                No submitted leads yet. <Link href="/quote">Get a quote and submit a lead</Link>.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Project</th>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Suburb</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Estimate</th>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{lead.project_type}</td>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{lead.suburb || '-'}</td>
                      <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        ${lead.estimate?.toLocaleString() || '-'}
                      </td>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className={`status-badge status-${lead.status}`}>{leadStatusLabels[lead.status]}</span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {new Date(lead.created_at).toLocaleDateString('en-AU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
