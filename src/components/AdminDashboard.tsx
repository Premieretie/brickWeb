'use client';

import { useState } from 'react';
import {
  approveContractor,
  assignLead,
  setUserRole,
  addAdminNote,
} from '@/app/dashboard/admin/actions';
import type { Profile, Contractor, Lead, Subscription } from '@/lib/types';

interface Props {
  profiles: Profile[];
  contractors: Contractor[];
  leads: Lead[];
  subscriptions: Subscription[];
}

const leadStatusLabels: Record<string, string> = {
  new: 'New',
  assigned: 'Assigned',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

export default function AdminDashboard({ profiles, contractors, leads, subscriptions }: Props) {
  const [activeTab, setActiveTab] = useState<'leads' | 'contractors' | 'users' | 'subscriptions'>('leads');
  const [leadList, setLeadList] = useState(leads);
  const [contractorList, setContractorList] = useState(contractors);
  const [profileList, setProfileList] = useState(profiles);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const approvedContractors = contractorList.filter((c) => c.approval_status === 'approved');
  const pendingContractors = contractorList.filter((c) => c.approval_status === 'pending');
  const totalRevenue = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan === 'premium' ? 199 : s.plan === 'professional' ? 99 : 49), 0);

  async function handleApprove(contractorId: string, status: 'approved' | 'rejected') {
    setLoading(contractorId);
    setError('');
    const result = await approveContractor(contractorId, status);
    setLoading(null);

    if (result.success) {
      setContractorList((prev) =>
        prev.map((c) => (c.id === contractorId ? { ...c, approval_status: status } : c))
      );
    } else {
      setError(result.error || 'Failed to update contractor');
    }
  }

  async function handleAssign(leadId: string, contractorId: string) {
    if (!contractorId) return;
    setLoading(leadId);
    setError('');
    const result = await assignLead(leadId, contractorId);
    setLoading(null);

    if (result.success) {
      setLeadList((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? { ...lead, status: 'assigned', contractor_id: approvedContractors.find((c) => c.id === contractorId)?.user_id || null }
            : lead
        )
      );
    } else {
      setError(result.error || 'Failed to assign lead');
    }
  }

  async function handleRoleChange(userId: string, role: 'customer' | 'contractor' | 'admin') {
    setLoading(userId);
    setError('');
    const result = await setUserRole(userId, role);
    setLoading(null);

    if (result.success) {
      setProfileList((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
    } else {
      setError(result.error || 'Failed to update role');
    }
  }

  async function handleNote(leadId: string) {
    const notes = window.prompt('Enter admin notes for this lead:');
    if (notes === null) return;

    setLoading(leadId);
    setError('');
    const result = await addAdminNote(leadId, notes);
    setLoading(null);

    if (result.success) {
      setLeadList((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, notes } : lead)));
    } else {
      setError(result.error || 'Failed to save note');
    }
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="stats-row">
            <div className="stat-card"><strong>{leads.length}</strong><span>Leads</span></div>
            <div className="stat-card"><strong>{contractors.length}</strong><span>Contractors</span></div>
            <div className="stat-card"><strong>{profiles.length}</strong><span>Users</span></div>
            <div className="stat-card"><strong>${totalRevenue}</strong><span>MRR</span></div>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="dashboard-tabs">
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>
            Leads
          </button>
          <button className={activeTab === 'contractors' ? 'active' : ''} onClick={() => setActiveTab('contractors')}>
            Contractors
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={activeTab === 'subscriptions' ? 'active' : ''} onClick={() => setActiveTab('subscriptions')}>
            Subscriptions
          </button>
        </div>

        {activeTab === 'leads' && (
          <div className="dashboard-section">
            <h2>Lead Management</h2>
            {leadList.length === 0 ? (
              <p>No leads yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Suburb</th>
                      <th>Project</th>
                      <th>Estimate</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Assigned</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadList.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.name}<br /><small>{lead.email}</small></td>
                        <td>{lead.suburb || '-'}</td>
                        <td>{lead.project_type || '-'}</td>
                        <td>{lead.estimate ? `$${lead.estimate.toLocaleString()}` : '-'}</td>
                        <td>{lead.lead_score}</td>
                        <td>{leadStatusLabels[lead.status]}</td>
                        <td>
                          {approvedContractors.find((c) => c.user_id === lead.contractor_id)?.business_name || (
                            <select
                              value=""
                              onChange={(e) => handleAssign(lead.id, e.target.value)}
                              disabled={loading === lead.id}
                            >
                              <option value="">Assign to...</option>
                              {approvedContractors.map((c) => (
                                <option key={c.id} value={c.id}>{c.business_name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>
                          <button className="btn-sm" onClick={() => handleNote(lead.id)} disabled={loading === lead.id}>
                            Notes
                          </button>
                          {lead.notes && <span className="note-dot" title={lead.notes}>•</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contractors' && (
          <div className="dashboard-section">
            <h2>Contractor Approvals</h2>
            {pendingContractors.length === 0 ? <p>No pending contractors.</p> : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>Business</th><th>Contact</th><th>Email</th><th>Suburb</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingContractors.map((c) => (
                      <tr key={c.id}>
                        <td>{c.business_name}</td>
                        <td>{c.contact_name || '-'}</td>
                        <td>{c.email}</td>
                        <td>{c.slug || '-'}</td>
                        <td>{c.approval_status}</td>
                        <td>
                          <button className="btn-sm btn-success" onClick={() => handleApprove(c.id, 'approved')} disabled={loading === c.id}>
                            Approve
                          </button>{' '}
                          <button className="btn-sm btn-danger" onClick={() => handleApprove(c.id, 'rejected')} disabled={loading === c.id}>
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 style={{ marginTop: 32 }}>All Contractors</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Business</th><th>Plan</th><th>Status</th><th>Featured</th></tr></thead>
                <tbody>
                  {contractorList.map((c) => (
                    <tr key={c.id}>
                      <td>{c.business_name}</td>
                      <td>{c.subscription_plan}</td>
                      <td>{c.approval_status}</td>
                      <td>{c.is_featured ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dashboard-section">
            <h2>User Management</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Change Role</th></tr></thead>
                <tbody>
                  {profileList.map((p) => (
                    <tr key={p.id}>
                      <td>{p.email}</td>
                      <td>{[p.first_name, p.last_name].filter(Boolean).join(' ') || '-'}</td>
                      <td>{p.role}</td>
                      <td>
                        <select value={p.role} onChange={(e) => handleRoleChange(p.id, e.target.value as any)} disabled={loading === p.id}>
                          <option value="customer">Customer</option>
                          <option value="contractor">Contractor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="dashboard-section">
            <h2>Subscriptions</h2>
            {subscriptions.length === 0 ? <p>No subscriptions yet.</p> : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Period End</th></tr></thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.user_id}</td>
                        <td>{s.plan}</td>
                        <td>{s.status}</td>
                        <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
