/**
 * Supabase authentication helpers and role-aware guards.
 */
(function() {
    'use strict';

    const sb = window.sb;
    if (!sb) {
        throw new Error('Supabase client not initialised. Load supabase-client.js first.');
    }

    const REDIRECT_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

    async function signUp(email, password, metadata = {}) {
        return sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: metadata.first_name || '',
                    last_name: metadata.last_name || '',
                    role: metadata.role || 'customer'
                },
                emailRedirectTo: `${REDIRECT_ORIGIN}/account`
            }
        });
    }

    async function signIn(email, password) {
        return sb.auth.signInWithPassword({ email, password });
    }

    async function signOut() {
        return sb.auth.signOut();
    }

    async function resetPassword(email) {
        return sb.auth.resetPasswordForEmail(email, {
            redirectTo: `${REDIRECT_ORIGIN}/reset-password`
        });
    }

    async function updatePassword(password) {
        return sb.auth.updateUser({ password });
    }

    async function getSession() {
        const { data, error } = await sb.auth.getSession();
        return { session: data?.session, error };
    }

    async function getUser() {
        const { data, error } = await sb.auth.getUser();
        return { user: data?.user, error };
    }

    async function getProfile() {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return { profile: null, error: new Error('Not authenticated') };
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        return { profile: data, error };
    }

    function onAuthStateChange(callback) {
        return sb.auth.onAuthStateChange(callback);
    }

    async function requireAuth(allowedRoles = []) {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        const { data: profile } = await sb.from('profiles').select('role').eq('id', session.user.id).single();
        if (!profile) {
            window.location.href = '/login';
            return null;
        }
        if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
            window.location.href = '/account';
            return null;
        }
        return { session, profile };
    }

    async function requireGuest() {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            window.location.href = '/account';
        }
    }

    async function updateProfile(updates) {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return { data: null, error: new Error('Not authenticated') };
        return sb.from('profiles').update(updates).eq('id', session.user.id).select().single();
    }

    window.Auth = {
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        getSession,
        getUser,
        getProfile,
        onAuthStateChange,
        requireAuth,
        requireGuest,
        updateProfile
    };
})();
