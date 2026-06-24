'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContractorApprovalStatus } from '@/lib/types';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', user: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden', user: null };
  }

  return { error: null, user };
}

export async function approveContractor(contractorId: string, status: ContractorApprovalStatus) {
  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createAdminClient();
  const { error } = await admin
    .from('contractors')
    .update({ approval_status: status, updated_at: new Date().toISOString() })
    .eq('id', contractorId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function assignLead(leadId: string, contractorId: string) {
  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createAdminClient();

  // Verify contractor is approved and active
  const { data: contractor } = await admin
    .from('contractors')
    .select('id, user_id, approval_status, is_active')
    .eq('id', contractorId)
    .single();

  if (!contractor || contractor.approval_status !== 'approved' || !contractor.is_active) {
    return { success: false, error: 'Contractor is not approved or active.' };
  }

  const { error } = await admin
    .from('leads')
    .update({
      contractor_id: contractor.user_id,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteLead(leadId: string) {
  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createAdminClient();
  const { error } = await admin.from('leads').delete().eq('id', leadId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function setUserRole(userId: string, role: 'customer' | 'contractor' | 'admin') {
  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function addAdminNote(leadId: string, notes: string) {
  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createAdminClient();
  const { error } = await admin
    .from('leads')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
