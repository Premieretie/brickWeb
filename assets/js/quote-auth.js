/**
 * Integrates the quote calculator with Supabase: save quotes and lead capture.
 */
(function() {
    'use strict';

    const sb = window.sb;
    if (!sb) return;

    const saveBtn = document.getElementById('supabase-save-quote');
    const leadLink = document.getElementById('lead-capture-link');
    const saveHint = document.getElementById('save-quote-hint');

    function getCurrentQuotePayload() {
        if (!window.BrickQuote) return null;
        const state = window.BrickQuote.getState();
        const quote = window.BrickQuote.getQuote();
        return {
            project_type: state.projectType,
            material: state.materialType,
            length: state.lengths?.reduce((a, b) => a + (parseFloat(b) || 0), 0) || 0,
            height: state.height,
            columns: state.columnCount,
            mailbox: state.mailboxType !== 'none',
            estimate: quote.totalAvg,
            quote_data_json: { ...state, quote }
        };
    }

    async function updateAuthState() {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            saveHint.textContent = 'Save this quote to your account to view it later or request contractor quotes.';
            saveBtn.textContent = 'Save to My Account';
            saveBtn.disabled = false;
        } else {
            saveHint.textContent = 'Log in or sign up to save quotes and request quotes from contractors.';
            saveBtn.textContent = 'Log in to Save';
            saveBtn.disabled = false;
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const { data: { session } } = await sb.auth.getSession();
            if (!session) {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
                return;
            }
            const payload = getCurrentQuotePayload();
            if (!payload) {
                UI.showToast('Quote not ready', 'error');
                return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            const { data, error } = await sb
                .from('quotes')
                .insert({ user_id: session.user.id, ...payload })
                .select()
                .single();
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save to My Account';
            if (error) {
                UI.showToast(error.message, 'error');
                return;
            }
            UI.showToast('Quote saved!', 'success');
            leadLink.href = '/lead-capture?quote=' + data.id;
        });
    }

    if (leadLink) {
        leadLink.href = '/lead-capture';
        leadLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const { data: { session } } = await sb.auth.getSession();
            if (!session) {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
                return;
            }
            const payload = getCurrentQuotePayload();
            if (!payload) return;
            const urlParams = new URLSearchParams(window.location.search);
            let quoteId = urlParams.get('quote');
            if (!quoteId) {
                const { data, error } = await sb
                    .from('quotes')
                    .insert({ user_id: session.user.id, ...payload })
                    .select()
                    .single();
                if (error) {
                    UI.showToast(error.message, 'error');
                    return;
                }
                quoteId = data.id;
            }
            window.location.href = '/lead-capture?quote=' + quoteId;
        });
    }

    updateAuthState();
    sb.auth.onAuthStateChange(() => updateAuthState());
})();
