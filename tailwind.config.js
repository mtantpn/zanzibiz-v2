/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './auth/**/*.html',
    './admin/**/*.html',
    './business/**/*.html',
    './user/**/*.html',
    './public/**/*.html',
    './lib/**/*.js',
    './admin/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // ── Main site palette (index, business, auth, user, blog) ──────────
        'primary':          '#1B3A4B',
        'primary-light':    '#2A5570',
        'primary-dark':     '#0F2535',
        'secondary':        '#1B3A4B',
        'secondary-light':  '#2A5570',
        'secondary-dark':   '#0F2535',
        'accent':           '#C8892A',
        'accent-light':     '#F0C878',
        'accent-dark':      '#A87020',
        'brand-orange':     '#C8892A',
        'brand-teal':       '#2A8C8A',
        'brand-blue':       '#1B3A4B',
        'brand-green':      '#2A8C8A',
        'brand-gray':       '#1C2B3A',
        'warm-white':       '#FAF7F2',
        'ivory':            '#FAF7F2',
        'sand':             '#F5EFE5',
        'navy':             '#1B3A4B',
        'gold':             '#C8892A',
        'coral':            '#D4603A',
        'success':          '#2A8C8A',
        'warning':          '#C8892A',
        'error':            '#D4603A',
        'info':             '#1B3A4B',
        // ── Admin dashboard palette ────────────────────────────────────────
        'admin-green':      '#22C55E',
        'admin-orange':     '#FB923C',
        'admin-blue':       '#5B9BD5',
        'admin-teal':       '#0891B2',
        'admin-gray':       '#4A4A4A',
        'admin-white':      '#FDFEFE',
        // payments.html uses these keys directly as brand-*
        // so we also alias them as brand-* for admin pages only via a
        // separate set so the class names still resolve
        // (admin/dashboard uses brand-green:#22C55E, payments uses different values)
        // Both sets are included; Tailwind generates all, pages use the right ones.
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body':    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans':    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
