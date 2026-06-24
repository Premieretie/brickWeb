'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateLeadStatus } from '@/app/dashboard/contractor/actions';
import type { Contractor, Lead, Subscription, ServiceArea, GalleryImage } from '@/lib/types';

interface Props {
  contractor: Contractor | null;
  leads: Lead[];
  subscription: Subscription | null;
  serviceAreas: ServiceArea[];
  galleryImages: GalleryImage[];
}

const leadStatusLabels: Record<string, string> = {
  new: 'New',
  assigned: 'Assigned',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

export default function ContractorDashboard({ contractor, leads, subscription }: Props) {
  const [activeTab, setActiveTab] = useState<'leads' | 'profile'>('leads');
  const [leadList, setLeadList] = useState(leads);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleStatusChange(leadId: string, newStatus: string) {
    setLoadingLeadId(leadId);
    setError('');
    const result = await updateLeadStatus(leadId, newStatus as Lead['status']);
    setLoadingLeadId(null);

    if (result.success) {
      setLeadList((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus as Lead['status'] } : lead))
      );
    } else {
      setError(result.error || 'Failed to update lead status');
    }
  }

  if (!contractor) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="auth-card" style={{ marginTop: 40 }}>
            <h1>Contractor profile not found</h1>
            <p>Your contractor application may still be pending approval.</p>
            <Link href="/join" className="btn-primary btn-block" style={{ marginTop: 24 }}>
              Apply to be a contractor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = contractor.approval_status === 'approved';

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>{contractor.business_name}</h1>
            <p className="dashboard-subtitle">
              Plan: <strong>{contractor.subscription_plan.charAt(0).toUpperCase() + contractor.subscription_plan.slice(1)}</strong>
              {' · '}
              Status: <strong>{contractor.approval_status.charAt(0).toUpperCase() + contractor.approval_status.slice(1)}</strong>
              {subscription && (
                <>
                  {' · '}Billing: <strong>{subscription.status}</strong>
                </>
              )}
            </p>
            <Link href="/dashboard/contractor/subscription" className="btn-secondary" style={{ marginTop: 12 }}>
              Manage subscription
            </Link>
          </div>
          {!isApproved && (
            <div className="notice notice-warning">
              Your profile is under review. You will receive leads after admin approval.
            </div>
          )}
        </div>

        <div className="dashboard-tabs">
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>
            Leads ({leadList.length})
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
        </div>

        {activeTab === 'leads' && (
          <div className="dashboard-section">
            {error && <p className="error-message">{error}</p>}
            {leadList.length === 0 ? (
              <p>No leads assigned yet. Leads will appear here once an admin assigns them to you.</p>
            ) : (
              <div className="leads-grid">
                {leadList.map((lead) => (
                  <div key={lead.id} className="lead-card">
                    <div className="lead-card-header">
                      <h3>{lead.name}</h3>
                      <span className={`status-badge status-${lead.status}`}>{leadStatusLabels[lead.status]}</span>
                    </div>
                    <div className="lead-card-body">
                      <p><strong>Project:</strong> {lead.project_type || 'N/A'}</p>
                      <p><strong>Suburb:</strong> {lead.suburb || 'N/A'}</p>
                      <p><strong>Estimate:</strong> {lead.estimate ? `$${lead.estimate.toLocaleString()}` : 'N/A'}</p>
                      <p><strong>Score:</strong> {lead.lead_score}/100</p>
                      <p><strong>Phone:</strong> {lead.phone || 'N/A'}</p>
                      <p><strong>Email:</strong> {lead.email}</p>
                      {lead.message && <p className="lead-message">{lead.message}</p>}
                    </div>
                    <div className="lead-card-footer">
                      <label htmlFor={`status-${lead.id}`}>Update status</label>
                      <select
                        id={`status-${lead.id}`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={loadingLeadId === lead.id}
                      >
                        {Object.entries(leadStatusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dashboard-section">
            <h2>Profile details</h2>
            <dl className="profile-list">
              <div><dt>Business name</dt><dd>{contractor.business_name}</dd></div>
              <div><dt>Contact name</dt><dd>{contractor.contact_name || 'N/A'}</dd></div>
              <div><dt>ABN</dt><dd>{contractor.abn || 'N/A'}</dd></div>
              <div><dt>Phone</dt><dd>{contractor.phone || 'N/A'}</dd></div>
              <div><dt>Website</dt><dd>{contractor.website ? <a href={contractor.website} target="_blank" rel="noopener noreferrer">{contractor.website}</a> : 'N/A'}</dd></div>
              <div><dt>About</dt><dd>{contractor.description || 'N/A'}</dd></div>
            </dl>
            <p className="text-muted">Profile editing will be available in a future update.</p>
          </div>
        )}
      </div>
    </div>
  );
}
