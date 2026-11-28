import { supabase } from './supabase.js';

/**
 * Injects a full-screen loading overlay and hides page content until auth
 * is verified. Called synchronously as early as possible in each protected page.
 *
 * @param {'any'|'business'|'admin'} requiredRole
 *   'any'      — must be signed in, any user type allowed
 *   'business' — must be signed in AND user_type === 'business'
 *   'admin'    — must be signed in AND user_type === 'admin'
 *
 * @returns {Promise<{user, profile}>} Resolves with the verified user and profile,
 *   or never returns (redirects away before resolving).
 */
export async function requireAuth(requiredRole = 'any') {
    // Hide page content immediately — overlay is already injected via inline
    // script in each HTML file before this module even loads.
    const overlay = document.getElementById('__auth_overlay');

    try {
        // getSession() reads from localStorage — fast, no network round-trip.
        // We follow up with getUser() for server-side token validation.
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            redirectToLogin();
            return;
        }

        // Validate token server-side (catches expired/revoked tokens)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            redirectToLogin();
            return;
        }

        // For role-gated pages, fetch the profile
        if (requiredRole !== 'any') {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, user_type, email')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError || !profile) {
                redirectToLogin();
                return;
            }

            if (requiredRole === 'admin' && profile.user_type !== 'admin') {
                redirectAccessDenied('Admin access required.');
                return;
            }

            if (requiredRole === 'business' && profile.user_type !== 'business') {
                redirectAccessDenied('Business account required.');
                return;
            }

            revealPage(overlay);
            return { user, profile };
        }

        // 'any' — authenticated, no role restriction
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, user_type, email')
            .eq('id', user.id)
            .maybeSingle();

        revealPage(overlay);
        return { user, profile: profile || {} };

    } catch {
        redirectToLogin();
    }
}

function revealPage(overlay) {
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.15s ease';
        setTimeout(() => overlay.remove(), 160);
    }
    document.documentElement.style.removeProperty('overflow');
}

function redirectToLogin() {
    window.location.replace('../auth/login.html');
}

function redirectAccessDenied(message) {
    // Pass message via sessionStorage so index.html can display it once
    sessionStorage.setItem('accessDeniedMessage', message);
    window.location.replace('../index.html');
}
