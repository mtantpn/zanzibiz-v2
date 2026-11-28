import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  root: '.',
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'auth/login.html',
        signup: 'auth/signup.html',
        businessDashboard: 'business/dashboard.html',
        businessTopup: 'business/topup.html',
        adminDashboard: 'admin/dashboard.html',
        adminPayments: 'admin/payments.html',
        userProfile: 'user/profile.html',
        userSettings: 'user/settings.html',
        userLiked: 'user/liked.html',
        offline: 'public/offline.html',
        blog: 'blog.html',
        blogPost: 'blog-post.html',
        webstart: 'webstart.html',
        travelGuide: 'travel-guide.html',
        travelGuideFlights: 'travel-guide/flights-to-zanzibar.html',
        travelGuideWhereToStay: 'travel-guide/where-to-stay.html',
        travelGuideHotels: 'travel-guide/hotels.html',
        travelGuideTours: 'travel-guide/tours.html',
        travelGuideTransfers: 'travel-guide/airport-transfers.html',
        about: 'about.html',
        contact: 'contact.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        affiliate: 'affiliate.html',
        businessListing: 'business/listing.html',
        directoryIndex: 'directory/index.html',
        directoryCategory: 'directory/category.html',
      },
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js']
        }
      }
    },
    assetsInlineLimit: 0,
    copyPublicDir: true,
    cssMinify: true,
    reportCompressedSize: true
  },
  publicDir: 'public',
  server: {
    port: 3000,
    open: false
  }
});
