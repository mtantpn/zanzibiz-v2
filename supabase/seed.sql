/*
  # Seed Data for ZanziFind

  Creates:
  - 3 users (regular, business, admin)
  - Dummy listings across all categories
  - Sample reviews and favorites
*/

-- Note: These users must be created in Supabase Auth first
-- Then we can reference them here by their UUIDs

-- After creating users in Supabase Auth dashboard, update their profiles:
-- User 1: user@user.com (Regular User) - Replace with actual UUID
-- User 2: biz@biz.com (Business User) - Replace with actual UUID
-- User 3: superuser@superuser.com (Admin) - Replace with actual UUID

-- INSERT USERS MANUALLY THROUGH SUPABASE AUTH DASHBOARD FIRST!
-- Instructions:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" > "Create new user"
-- 3. Create these 3 users:
--    - Email: user@user.com, Password: password123
--    - Email: biz@biz.com, Password: password123
--    - Email: superuser@superuser.com, Password: password123
-- 4. Get their UUIDs and replace in the queries below

-- Example: Update user types (replace UUIDs with actual ones from your auth.users table)
-- UPDATE profiles SET user_type = 'user' WHERE email = 'user@user.com';
-- UPDATE profiles SET user_type = 'business' WHERE email = 'biz@biz.com';
-- UPDATE profiles SET user_type = 'admin' WHERE email = 'superuser@superuser.com';

-- Create business profile for biz@biz.com
-- INSERT INTO business_profiles (user_id, business_name, business_type, description, token_balance, verified)
-- SELECT id, 'Zanzi Tours & Adventures', 'tour', 'Premier tour operator in Zanzibar', 99999, true
-- FROM profiles WHERE email = 'biz@biz.com';

-- DUMMY LISTINGS
-- These can be inserted directly

-- Get business_id for biz@biz.com user
DO $$
DECLARE
  biz_user_id uuid;
  biz_business_id uuid;
BEGIN
  -- This will work after you create the business profile
  SELECT user_id INTO biz_user_id FROM profiles WHERE email = 'biz@biz.com' LIMIT 1;
  SELECT id INTO biz_business_id FROM business_profiles WHERE user_id = biz_user_id LIMIT 1;

  IF biz_business_id IS NOT NULL THEN
    -- JOBS Category
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, images) VALUES
    (biz_business_id, 'Hotel Receptionist Needed', 'hotel-receptionist-needed', 'Seeking friendly receptionist for beachfront hotel. Must speak English and Swahili.', 'jobs', 'hospitality', 'nungwi', '+255 777 123 456', 'jobs@zanzijobs.com', 'active', '["https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"]'),
    (biz_business_id, 'Tour Guide - Stone Town', 'tour-guide-stone-town', 'Experienced tour guide wanted for historical Stone Town tours.', 'jobs', 'tourism', 'stone-town', '+255 777 123 457', 'guide@stonetown.com', 'active', '["https://images.pexels.com/photos/1367267/pexels-photo-1367267.jpeg"]'),
    (biz_business_id, 'Chef de Partie - Fine Dining', 'chef-de-partie', 'Upscale restaurant seeks skilled chef. Italian cuisine experience preferred.', 'jobs', 'food-service', 'stone-town', '+255 777 123 458', 'hr@finedining.com', 'active', '["https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg"]'),
    (biz_business_id, 'Dive Instructor', 'dive-instructor', 'PADI certified dive instructor needed for busy dive center in Nungwi.', 'jobs', 'water-sports', 'nungwi', '+255 777 123 459', 'dive@nungwi.com', 'active', '["https://images.pexels.com/photos/1007023/pexels-photo-1007023.jpeg"]');

    -- EVENTS Category
    INSERT INTO listings (business_id, title, slug, description, category, location, phone, email, status, price, images) VALUES
    (biz_business_id, 'Full Moon Beach Party', 'full-moon-beach-party', 'Monthly full moon party at Kendwa Beach. Live DJ, bonfires, and beach vibes.', 'events', 'kendwa', '+255 777 234 567', 'party@kendwa.com', 'featured', 15000, '["https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg"]'),
    (biz_business_id, 'Zanzibar Food Festival', 'zanzibar-food-festival', 'Annual food festival showcasing local and international cuisine.', 'events', 'stone-town', '+255 777 234 568', 'food@festival.com', 'active', 20000, '["https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg"]'),
    (biz_business_id, 'Cultural Music Night', 'cultural-music-night', 'Traditional Taarab music performance at Old Fort.', 'events', 'stone-town', '+255 777 234 569', 'culture@zanzibar.com', 'active', 10000, '["https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg"]'),
    (biz_business_id, 'Sunset Yoga Session', 'sunset-yoga-session', 'Weekly sunset yoga on the beach. All levels welcome.', 'events', 'paje', '+255 777 234 570', 'yoga@paje.com', 'active', 5000, '["https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg"]');

    -- BUSINESS - Restaurants
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images, features) VALUES
    (biz_business_id, 'The Rock Restaurant', 'the-rock-restaurant', 'Iconic restaurant on a rock in the Indian Ocean. Fresh seafood and stunning views.', 'business', 'restaurants', 'michanvi-pingwe', '+255 777 345 678', '+255 777 345 678', 'featured', 35000, '["https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg"]', '["Seafood", "Ocean View", "WiFi"]'),
    (biz_business_id, 'Lukmaan Restaurant', 'lukmaan-restaurant', 'Authentic Zanzibari cuisine in the heart of Stone Town. Family recipes passed down generations.', 'business', 'restaurants', 'stone-town', '+255 777 345 679', '+255 777 345 679', 'boosted', 15000, '["https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg"]', '["Local Cuisine", "Outdoor Seating", "Halal"]'),
    (biz_business_id, 'Emerson Spice Tea House', 'emerson-spice-tea-house', 'Rooftop restaurant with panoramic Stone Town views. Fusion cuisine.', 'business', 'restaurants', 'stone-town', '+255 777 345 680', '+255 777 345 680', 'active', 40000, '["https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg"]', '["Rooftop", "Fine Dining", "Sunset Views"]'),
    (biz_business_id, 'Forodhani Night Market', 'forodhani-night-market', 'Famous night food market. Street food, fresh juice, and local specialties.', 'business', 'restaurants', 'stone-town', '+255 777 345 681', '+255 777 345 681', 'active', 5000, '["https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg"]', '["Street Food", "Budget Friendly", "Local Experience"]');

    -- BUSINESS - Clubs & Bars
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, status, images, features) VALUES
    (biz_business_id, 'Kendwa Rocks Beach Bar', 'kendwa-rocks-beach-bar', 'Beachfront bar with live music, DJ sets, and the best sunset views.', 'business', 'clubs', 'kendwa', '+255 777 456 789', 'active', '["https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg"]', '["Live Music", "Beach Bar", "Cocktails"]'),
    (biz_business_id, 'Clubbers Zanzibar', 'clubbers-zanzibar', 'Premier nightclub in Nungwi. International DJs and themed parties.', 'business', 'clubs', 'nungwi', '+255 777 456 790', 'active', '["https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg"]', '["Nightclub", "DJ", "Dance Floor"]'),
    (biz_business_id, 'Mnazi Bay Lounge', 'mnazi-bay-lounge', 'Sophisticated cocktail lounge with ocean breeze and chill vibes.', 'business', 'clubs', 'stone-town', '+255 777 456 791', 'active', '["https://images.pexels.com/photos/941864/pexels-photo-941864.jpeg"]', '["Cocktails", "Lounge", "Live Jazz"]');

    -- BUSINESS - Taxi Services
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images) VALUES
    (biz_business_id, 'Zanzi Express Taxi', 'zanzi-express-taxi', '24/7 taxi service across Zanzibar. Airport transfers and island tours.', 'business', 'taxi', 'stone-town', '+255 777 567 890', '+255 777 567 890', 'active', 30000, '["https://images.pexels.com/photos/376729/pexels-photo-376729.jpeg"]'),
    (biz_business_id, 'North Coast Transfers', 'north-coast-transfers', 'Reliable transfers to northern beaches. Fixed rates, no haggling.', 'business', 'taxi', 'nungwi', '+255 777 567 891', '+255 777 567 891', 'active', 50000, '["https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg"]'),
    (biz_business_id, 'Stone Town Taxis', 'stone-town-taxis', 'Local taxi service. Professional drivers who know the island.', 'business', 'taxi', 'stone-town', '+255 777 567 892', '+255 777 567 892', 'active', 25000, '["https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg"]');

    -- AUTOMOTIVE
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, price, images) VALUES
    (biz_business_id, 'Zanzibar Car Rentals', 'zanzibar-car-rentals', 'Self-drive and chauffeur car hire. Wide range of vehicles.', 'automotive', 'car-rental', 'stone-town', '+255 777 678 901', 'rent@zanzicars.com', 'active', 100000, '["https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg"]'),
    (biz_business_id, 'Motorbike Adventures', 'motorbike-adventures', 'Rent scooters and motorbikes to explore the island at your pace.', 'automotive', 'bike-rental', 'paje', '+255 777 678 902', 'bikes@zanzi.com', 'active', 40000, '["https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg"]'),
    (biz_business_id, 'Auto Garage Zanzibar', 'auto-garage-zanzibar', 'Professional car repairs and maintenance. All makes and models.', 'automotive', 'repair', 'stone-town', '+255 777 678 903', 'garage@zanzi.com', 'active', 0, '["https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg"]');

    -- ACTIVITIES - Water Sports
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images, features) VALUES
    (biz_business_id, 'Paje Kite School', 'paje-kite-school', 'Learn kitesurfing in the perfect conditions of Paje Beach. IKO certified instructors.', 'activities', 'surfing', 'paje', '+255 777 789 012', '+255 777 789 012', 'featured', 150000, '["https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg"]', '["Kitesurfing", "Lessons", "Equipment Rental"]'),
    (biz_business_id, 'Mnemba Island Diving', 'mnemba-island-diving', 'Spectacular diving around Mnemba Atoll. See dolphins, turtles, and reef sharks.', 'activities', 'diving', 'nungwi', '+255 777 789 013', '+255 777 789 013', 'boosted', 180000, '["https://images.pexels.com/photos/1007023/pexels-photo-1007023.jpeg"]', '["Scuba Diving", "Snorkeling", "PADI"]'),
    (biz_business_id, 'Dhow Sailing Adventures', 'dhow-sailing-adventures', 'Traditional dhow sailing trips. Sunset cruises and full-day excursions.', 'activities', 'boat-trips', 'stone-town', '+255 777 789 014', '+255 777 789 014', 'active', 120000, '["https://images.pexels.com/photos/1654489/pexels-photo-1654489.jpeg"]', '["Dhow Cruise", "Sunset", "BBQ"]'),
    (biz_business_id, 'Safari Blue Tour', 'safari-blue-tour', 'Full-day boat trip to sandbanks and lagoons. Includes lunch and snorkeling.', 'activities', 'boat-trips', 'fumba', '+255 777 789 015', '+255 777 789 015', 'featured', 100000, '["https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg"]', '["Boat Trip", "Snorkeling", "Seafood Lunch"]');

    -- ACTIVITIES - Land Activities
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, status, price, images) VALUES
    (biz_business_id, 'Jozani Forest Tour', 'jozani-forest-tour', 'Guided tour of Jozani Forest. See rare red colobus monkeys.', 'activities', 'hiking', 'jozani', '+255 777 890 123', 'active', 30000, '["https://images.pexels.com/photos/1681660/pexels-photo-1681660.jpeg"]'),
    (biz_business_id, 'Spice Farm Experience', 'spice-farm-experience', 'Discover Zanzibar's spice heritage. Interactive farm tour with tasting.', 'activities', 'tours', 'kizimbani', '+255 777 890 124', 'active', 40000, '["https://images.pexels.com/photos/955935/pexels-photo-955935.jpeg"]'),
    (biz_business_id, 'Quad Biking Zanzibar', 'quad-biking-zanzibar', 'Thrilling quad bike tours through villages and countryside.', 'activities', 'adventure', 'paje', '+255 777 890 125', 'active', 80000, '["https://images.pexels.com/photos/2526127/pexels-photo-2526127.jpeg"]');

    -- USEFUL INFO
    INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, images) VALUES
    (biz_business_id, 'Zanzibar Tourist Information Center', 'zanzibar-tourist-info', 'Free tourist information, maps, and advice. Located at the Old Fort.', 'useful-info', 'tourist-info', 'stone-town', '+255 777 901 234', 'info@zanzibar.gov', 'active', '["https://images.pexels.com/photos/434645/pexels-photo-434645.jpeg"]'),
    (biz_business_id, 'Currency Exchange - Stone Town', 'currency-exchange-stone-town', 'Fair rates for currency exchange. USD, EUR, GBP accepted.', 'useful-info', 'services', 'stone-town', '+255 777 901 235', 'forex@zanzi.com', 'active', '["https://images.pexels.com/photos/164573/pexels-photo-164573.jpeg"]'),
    (biz_business_id, 'Zanzibar Medical Center', 'zanzibar-medical-center', '24/7 medical center with English-speaking doctors.', 'useful-info', 'healthcare', 'stone-town', '+255 777 901 236', 'medical@zanzi.com', 'active', '["https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg"]'),
    (biz_business_id, 'Police Station - Stone Town', 'police-station-stone-town', 'Main police station. Emergency services available 24/7.', 'useful-info', 'emergency', 'stone-town', '+255 777 901 237', 'police@zanzibar.gov', 'active', '["https://images.pexels.com/photos/8112171/pexels-photo-8112171.jpeg"]');

    -- SHORT STAY ACCOMMODATION
    INSERT INTO listings (business_id, title, slug, description, category, location, phone, email, website, whatsapp, status, price, images, features) VALUES
    (biz_business_id, 'Zanzi Resort Beach Hotel', 'zanzi-resort-beach-hotel', 'Luxury beachfront resort with infinity pool, spa, and fine dining.', 'accommodation', 'nungwi', '+255 777 012 345', 'info@zanziresort.com', 'www.zanziresort.com', '+255 777 012 345', 'featured', 350000, '["https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"]', '["Beach Access", "Pool", "Spa", "Restaurant", "WiFi"]'),
    (biz_business_id, 'Paje Palms Boutique Hotel', 'paje-palms-boutique', 'Small boutique hotel steps from the beach. Intimate and charming.', 'accommodation', 'paje', '+255 777 012 346', 'stay@pajepalms.com', 'www.pajepalms.com', '+255 777 012 346', 'boosted', 180000, '["https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg"]', '["Boutique", "Beach View", "Breakfast Included", "WiFi"]'),
    (biz_business_id, 'Emerson on Hurumzi', 'emerson-on-hurumzi', 'Boutique hotel in restored historic building. Rooftop restaurant with stunning views.', 'accommodation', 'stone-town', '+255 777 012 347', 'reservations@emersonzanzibar.com', 'www.emersonzanzibar.com', '+255 777 012 347', 'active', 280000, '["https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"]', '["Historic Building", "Rooftop Dining", "Central Location"]'),
    (biz_business_id, 'Kendwa Rocks Hotel', 'kendwa-rocks-hotel', 'Beachfront hotel with beach bar and water sports center.', 'accommodation', 'kendwa', '+255 777 012 348', 'info@kendwarocks.com', 'www.kendwarocks.com', '+255 777 012 348', 'active', 220000, '["https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"]', '["Beach Bar", "Water Sports", "Dive Center", "WiFi"]'),
    (biz_business_id, 'Sunset Bungalows Paje', 'sunset-bungalows-paje', 'Budget-friendly beach bungalows. Perfect for backpackers and kite surfers.', 'accommodation', 'paje', '+255 777 012 349', 'hello@sunsetbungalows.com', '', '+255 777 012 349', 'active', 80000, '["https://images.pexels.com/photos/460537/pexels-photo-460537.jpeg"]', '["Budget", "Beach Access", "Social Atmosphere"]'),
    (biz_business_id, 'Stone Town Heritage Guesthouse', 'stone-town-heritage-guesthouse', 'Charming guesthouse in the heart of Stone Town. Walking distance to all attractions.', 'accommodation', 'stone-town', '+255 777 012 350', 'stay@heritagehouse.com', '', '+255 777 012 350', 'active', 120000, '["https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg"]', '["Central Location", "Traditional Architecture", "Breakfast"]');
  END IF;
END $$;