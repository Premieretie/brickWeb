/**
 * Adds account / login links to the global header based on auth state.
 */
(function() {
    'use strict';

    async function updateHeader() {
        const nav = document.querySelector('.main-header .main-nav');
        if (!nav) return;

        // Remove any previously injected auth links
        nav.querySelectorAll('.auth-link').forEach(el => el.remove());

        let session = null;
        try {
            const { data } = await window.sb.auth.getSession();
            session = data?.session;
        } catch (e) {
            console.warn('Auth header: session check failed', e);
        }

        if (session) {
            let profile = null;
            try {
                const { data } = await window.sb
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                profile = data;
            } catch (e) {
                console.warn('Auth header: profile fetch failed', e);
            }

            const dashboardHref = profile?.role === 'contractor'
                ? '/dashboard/contractor'
                : profile?.role === 'admin'
                    ? '/dashboard/admin'
                    : '/dashboard/customer';

            const profileIcon = document.createElement('a');
            profileIcon.className = 'auth-link profile-icon';
            profileIcon.href = dashboardHref;
            profileIcon.setAttribute('aria-label', 'Account');
            profileIcon.title = 'Account';
            profileIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            nav.insertBefore(profileIcon, nav.lastElementChild);

            const logoutLink = document.createElement('a');
            logoutLink.className = 'auth-link';
            logoutLink.href = '#';
            logoutLink.textContent = 'Log out';
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                if (window.Auth?.signOut) {
                    await window.Auth.signOut();
                } else {
                    await window.sb.auth.signOut();
                }
                window.location.href = '/';
            });
            nav.insertBefore(logoutLink, nav.lastElementChild);
        } else {
            const loginLink = document.createElement('a');
            loginLink.className = 'auth-link';
            loginLink.href = '/login';
            loginLink.textContent = 'Log in';
            nav.insertBefore(loginLink, nav.lastElementChild);

            const signupLink = document.createElement('a');
            signupLink.className = 'auth-link';
            signupLink.href = '/signup';
            signupLink.textContent = 'Sign up';
            nav.insertBefore(signupLink, nav.lastElementChild);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateHeader);
    } else {
        updateHeader();
    }

    if (window.sb && window.sb.auth && window.sb.auth.onAuthStateChange) {
        window.sb.auth.onAuthStateChange(() => updateHeader());
    }
})();
