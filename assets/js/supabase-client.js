/**
 * Supabase client initialisation.
 * Expects window.ENV to be set by /config.js loaded before this script.
 * NEVER put the service role key in this file.
 */
(function() {
    'use strict';

    if (typeof supabase === 'undefined') {
        throw new Error('Supabase JS library not loaded. Include https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.0/dist/umd/supabase.min.js before this script.');
    }

    const env = window.ENV || {};
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
        console.warn('Supabase environment variables not loaded. Auth/database features will not work.');
    }

    const sb = supabase.createClient(
        env.SUPABASE_URL || '',
        env.SUPABASE_PUBLISHABLE_KEY || ''
    );

    window.sb = sb;
})();
