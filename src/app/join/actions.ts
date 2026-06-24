'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Contractor, ServiceArea } from '@/lib/types';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export interface JoinResult {
  success: boolean;
  error?: string;
  contractorId?: string;
}

export async function submitContractorApplication(
  formData: FormData
): Promise<JoinResult> {
  const businessName = formData.get('businessName') as string;
  const contactName = formData.get('contactName') as string;
  const abn = formData.get('abn') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const website = formData.get('website') as string;
  const description = formData.get('description') as string;
  const password = formData.get('password') as string;
  const serviceAreasRaw = formData.get('serviceAreas') as string;
  const existingUserId = formData.get('existingUserId') as string | null;

  if (!businessName || !email) {
    return { success: false, error: 'Business name and email are required.' };
  }

  if (!existingUserId && !password) {
    return { success: false, error: 'Password is required for new accounts.' };
  }

  const admin = createAdminClient();
  let userId = existingUserId;

  try {
    if (!userId) {
      // Create a new user with admin privileges
      const { data: userData, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'contractor',
          first_name: contactName?.split(' ')[0] || '',
          last_name: contactName?.split(' ').slice(1).join(' ') || '',
        },
      });

      if (createError || !userData.user) {
        return { success: false, error: createError?.message || 'Failed to create user account.' };
      }

      userId = userData.user.id;
    }

    // Ensure the user has a profile with contractor role
    const { error: profileUpsertError } = await admin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        role: 'contractor',
        first_name: contactName?.split(' ')[0] || null,
        last_name: contactName?.split(' ').slice(1).join(' ') || null,
        phone: phone || null,
      });

    if (profileUpsertError) {
      return { success: false, error: profileUpsertError.message };
    }

    // Create contractor profile
    const slug = generateSlug(businessName);
    const { data: contractorData, error: contractorError } = await admin
      .from('contractors')
      .insert({
        user_id: userId,
        business_name: businessName,
        contact_name: contactName || null,
        abn: abn || null,
        email,
        phone: phone || null,
        website: website || null,
        description: description || null,
        slug,
        subscription_plan: 'starter',
        approval_status: 'pending',
        is_active: true,
      })
      .select('id')
      .single();

    if (contractorError || !contractorData) {
      return { success: false, error: contractorError?.message || 'Failed to create contractor profile.' };
    }

    // Create service areas
    const serviceAreas = serviceAreasRaw
      ? serviceAreasRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (serviceAreas.length > 0) {
      const { error: serviceAreaError } = await admin
        .from('service_areas')
        .insert(
          serviceAreas.map((suburb) => ({
            contractor_id: userId,
            suburb,
          }))
        );

      if (serviceAreaError) {
        return { success: false, error: serviceAreaError.message };
      }
    }

    return { success: true, contractorId: contractorData.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

export async function getCurrentUserForJoin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('id', user.id)
    .single();

  return profile;
}
