'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QuoteState } from '@/lib/pricing';

function projectTypeLabel(projectType: string): string {
  const labels: Record<string, string> = {
    'brick-fence': 'Brick Fence',
    'block-fence': 'Block Fence',
    'brick-wall': 'Brick Wall',
    'retaining-wall': 'Retaining Wall',
    'mailbox': 'Mailbox',
    'mailbox-fence': 'Mailbox + Fence',
    'boundary-wall': 'Boundary Wall',
    'front-fence': 'Front Fence',
    'brick-piers': 'Brick Piers',
  };
  return labels[projectType] || projectType;
}

export async function submitLead(
  quoteState: QuoteState,
  quoteResult: { totalAvg: number; totalMin: number; totalMax: number; materialName: string },
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const suburb = formData.get('suburb') as string;
  const notes = formData.get('notes') as string;

  if (!name || !email) {
    return { success: false, error: 'Name and email are required.' };
  }

  try {
    const admin = createAdminClient();
    let quoteId: string | null = null;

    // Save quote if user is authenticated
    if (user) {
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .insert({
          user_id: user.id,
          project_type: projectTypeLabel(quoteState.projectType),
          material: quoteResult.materialName,
          length: quoteState.lengths.reduce((a, b) => a + b, 0),
          height: quoteState.height,
          columns: quoteState.columnCount,
          mailbox: quoteState.mailboxType !== 'none',
          estimate: quoteResult.totalAvg,
          quote_data_json: quoteState as unknown as Record<string, unknown>,
        })
        .select('id')
        .single();

      if (quoteError) {
        return { success: false, error: quoteError.message };
      }

      quoteId = quote.id;
    }

    // Create lead
    const { data: lead, error: leadError } = await admin
      .from('leads')
      .insert({
        customer_id: user?.id || null,
        quote_id: quoteId,
        name,
        email,
        phone: phone || null,
        address: address || null,
        suburb: suburb || null,
        project_type: projectTypeLabel(quoteState.projectType),
        estimate: quoteResult.totalAvg,
        message: notes || null,
      })
      .select('id')
      .single();

    if (leadError) {
      return { success: false, error: leadError.message };
    }

    return { success: true, leadId: lead.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

export async function saveQuote(
  quoteState: QuoteState,
  quoteResult: { totalAvg: number; materialName: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to save quotes.' };
  }

  try {
    const { data, error } = await supabase.from('quotes').insert({
      user_id: user.id,
      project_type: projectTypeLabel(quoteState.projectType),
      material: quoteResult.materialName,
      length: quoteState.lengths.reduce((a, b) => a + b, 0),
      height: quoteState.height,
      columns: quoteState.columnCount,
      mailbox: quoteState.mailboxType !== 'none',
      estimate: quoteResult.totalAvg,
      quote_data_json: quoteState as unknown as Record<string, unknown>,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
