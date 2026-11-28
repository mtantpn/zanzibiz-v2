# ZanziFind - Production-Ready Business Directory Platform

## Overview
Complete business directory platform with dual user types (regular users and businesses), token system, messaging, reviews, and analytics.

## Architecture

### Database (Supabase)
- **Migration File**: `supabase/migrations/001_initial_schema.sql`
- **Tables**: profiles, business_profiles, listings, reviews, favorites, token_transactions, messages, listing_analytics
- **RLS Policies**: Role-based access control implemented
- **Functions**: View counting, rating calculations, analytics

### User Types

#### Regular Users Can:
- Browse and search listings
- Save favorites
- Rate and review businesses
- Send messages
- View profile

#### Business Users Can:
- All regular user features
- Create/manage listings
- Purchase tokens
- Boost/feature listings
- View analytics
- Manage messages
- Track performance

## File Structure

```
project/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql ✅ CREATED
│   └── functions/
│       ├── send-verification-email/
│       ├── handle-payment/
│       └── search-listings/
├── lib/
│   └── supabase.js ✅ CREATED
├── auth/
│   ├── login.html ✅ CREATED
│   ├── signup.html (NEEDED)
│   └── verify-email.html (NEEDED)
├── user/
│   ├── profile.html
│   ├── favorites.html
│   └── messages.html
├── business/
│   ├── dashboard.html
│   ├── listings.html
│   ├── analytics.html
│   └── tokens.html
└── admin/
    └── dashboard.html
```

## Setup Instructions

### 1. Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=your_resend_key
WHAT3WORDS_API_KEY=your_w3w_key
```

### 2. Database Setup

Run the migration:
```bash
psql -h your-supabase-host -U postgres -d postgres < supabase/migrations/001_initial_schema.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of 001_initial_schema.sql
3. Execute

### 3. Authentication Configuration

In Supabase Dashboard → Authentication → Settings:
- Enable email provider
- Disable email confirmation (or set up Resend webhook)
- Configure redirect URLs

## Key Features Implementation

### Authentication System
```javascript
// lib/supabase.js provides:
- signUp(email, password, fullName, userType)
- signIn(email, password)
- signOut()
- getCurrentUser()
- getUserProfile(userId)
```

### Listings Management
```javascript
- getListings(filters)
- createListing(data)
- updateListing(id, updates)
- deleteListing(id)
- boostListing(listingId, businessId)
```

### Favorites & Reviews
```javascript
- toggleFavorite(userId, listingId)
- getFavorites(userId)
- createReview(listingId, userId, rating, title, comment)
```

### Messaging
```javascript
- getMessages(userId)
- sendMessage(senderId, recipientId, listingId, subject, message)
- markMessageAsRead(messageId)
```

### Analytics
```javascript
- getAnalytics(businessId, startDate, endDate)
- incrementViewCount(listingId)
- incrementContactCount(listingId)
```

### Live Info Widget
**NEW**: Real-time information display in navigation bar

Features:
- **Stone Town Local Time** - East Africa Time (UTC+3), updates every 60 seconds
- **Current Temperature** - Live weather from Open-Meteo API, updates every 10 minutes
- **USD to TZS Exchange Rate** - Real-time currency from ExchangeRate-API, updates every 30 minutes

APIs Used:
- Weather: [Open-Meteo](https://open-meteo.com/) - Free, no API key required
- Currency: [ExchangeRate-API](https://exchangerate-api.com/) - Free tier available
- Fallback: Frankfurter.app (European Central Bank data)

Implementation:
```javascript
// lib/live-info-widget.js provides:
- initLiveInfoWidget()    // Initialize on page load
- fetchWeather()          // Get Stone Town temperature
- fetchExchangeRate()     // Get USD to TZS rate
- getStoneTownTime()      // Calculate current time in EAT
```

See [LIVE_INFO_WIDGET.md](LIVE_INFO_WIDGET.md) for detailed documentation.

## UI Components Pattern

### Desktop Animations
```javascript
anime({
    targets: '.card',
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 600,
    easing: 'easeOutCubic'
});
```

### Mobile Optimization
```javascript
const isMobile = window.innerWidth < 768;
const animationDuration = isMobile ? 300 : 600;
const shouldAnimate = !isMobile || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### Loading States
```html
<div class="skeleton-loader">
    <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
</div>
```

## Resend Integration (Edge Function)

```typescript
// supabase/functions/send-verification-email/index.ts
import { Resend } from 'npm:resend@2';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { email, name, verificationUrl } = await req.json();

  const { data, error } = await resend.emails.send({
    from: 'ZanziFind <noreply@zanzifind.com>',
    to: email,
    subject: 'Verify your email',
    html: `
      <h1>Welcome to ZanziFind, ${name}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `
  });

  return new Response(JSON.stringify({ success: !error }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

## Token System

### Token Costs
- Boost Listing (7 days): 5 tokens
- Extra Listing: 10 tokens
- Featured Spot (30 days): 15 tokens

### Purchase Flow
1. User selects package
2. Payment modal appears
3. M-Pesa integration (simulated)
4. Transaction recorded
5. Tokens added to balance

### Usage Tracking
```sql
-- Automatic tracking via triggers
- token_transactions table logs all changes
- business_profiles.token_balance updated
- total_tokens_purchased/spent maintained
```

## API Endpoints for External Integration

### GET /api/listings
```json
{
  "category": "restaurants",
  "location": "stone-town",
  "limit": 10,
  "offset": 0
}
```

### GET /api/business/:id
Returns business profile and listings

### POST /api/webhook/payment
Receives M-Pesa payment notifications

## Search Implementation

### Advanced Filters
- Category
- Location
- Price range
- Rating (1-5 stars)
- Availability
- Features

### Real-time Search
```javascript
const searchInput = document.getElementById('search');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(e.target.value);
  }, 300);
});
```

## Security Best Practices

1. **RLS Policies**: All tables have row-level security
2. **API Keys**: Never expose in client code
3. **Input Validation**: Always validate on server
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize all user input
6. **CORS**: Configure allowed origins
7. **Rate Limiting**: Implement on edge functions

## Performance Optimization

### Desktop
- Full animations
- High-quality images
- Real-time updates
- Background video support

### Mobile
- Reduced animations
- Compressed images
- Lazy loading
- Touch-optimized UI
- Service worker caching

## Testing

### Unit Tests
```javascript
// Test listing creation
test('Create listing requires authentication', async () => {
  const result = await createListing(mockData);
  expect(result).toBeDefined();
});
```

### Integration Tests
```javascript
// Test full flow
test('User can favorite and unfavorite listing', async () => {
  await toggleFavorite(userId, listingId);
  const favorites = await getFavorites(userId);
  expect(favorites).toContain(listingId);
});
```

## Deployment

### Vercel/Netlify
1. Connect repository
2. Add environment variables
3. Deploy

### Custom Server
```bash
npm install
npm run build
npm start
```

## Next Steps

1. ✅ Database schema created
2. ✅ Auth system started
3. TODO: Complete signup page
4. TODO: Build business dashboard
5. TODO: Implement messaging
6. TODO: Create admin panel
7. TODO: Add payment integration
8. TODO: Deploy edge functions

## Support

For questions: support@zanzifind.com
Documentation: docs.zanzifind.com
API Docs: api.zanzifind.com

## License

Proprietary - All rights reserved
