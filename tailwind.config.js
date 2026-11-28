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
    './directory/**/*.html',
    './travel-guide/**/*.html',
    './src/**/*.{js,css}',
    // Server-rendered page bodies (business, guide) use Tailwind classes too
    './netlify/functions/**/*.mts',
  ],
  theme: {
    extend: {
      colors: {
        // ── Main site palette (index, business, auth, user, blog) ──────────
        'primary':          '#1D2427',
        'primary-light':    '#2E3A3F',
        'primary-dark':     '#111618',
        'secondary':        '#1D2427',
        'secondary-light':  '#2E3A3F',
        'secondary-dark':   '#111618',
        'accent':           '#0A6A94',
        'accent-light':     '#FFE08A',
        'accent-dark':      '#08577A',
        'brand-orange':     '#FFC72C',
        'brand-teal':       '#0A6A94',
        'brand-blue':       '#0A6A94',
        'brand-green':      '#1A7F45',
        'brand-gray':       '#1D2427',
        'warm-white':       '#FFFFFF',
        'ivory':            '#FFFFFF',
        'sand':             '#F7F7F7',
        'navy':             '#1D2427',
        'gold':             '#FFC72C',
        'coral':            '#D93025',
        'success':          '#1A7F45',
        'warning':          '#B45309',
        'error':            '#D93025',
        'info':             '#0A6A94',
        'ink':              '#1D2427',
        'zyellow':          '#FFC72C',
        'zyellow-dark':     '#F2B705',
        'link':             '#0A6A94',
        'wa':               '#1A7F45',
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
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
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
