'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LeadStatus } from '@/lib/types';

export async function updateLeadStatus(leadId: string, status: LeadStatus, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Contractor can only update leads assigned to them
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('contractor_id')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    return { success: false, error: 'Lead not found' };
  }

  if (lead.contractor_id !== user.id) {
    return { success: false, error: 'Not authorized to update this lead' };
  }

  const update: { status: LeadStatus; notes?: string; updated_at?: string } = { status };
  if (notes !== undefined) update.notes = notes;

  const { error } = await supabase
    .from('leads')
    .update(update)
    .eq('id', leadId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateContractorProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const businessName = formData.get('businessName') as string;
  const contactName = formData.get('contactName') as string;
  const phone = formData.get('phone') as string;
  const website = formData.get('website') as string;
  const description = formData.get('description') as string;
  const yearsExperience = formData.get('yearsExperience') as string;

  const { error } = await supabase
    .from('contractors')
    .update({
      business_name: businessName,
      contact_name: contactName,
      phone,
      website,
      description,
      years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
