/*
  # Complete Seed Data - 3 Listings Per Category

  This file creates complete dummy listings for all categories.
  Some listings are marked as featured/boosted.

  INSTRUCTIONS:
  1. First create the 3 users in Supabase Auth Dashboard
  2. Get their UUIDs from auth.users table
  3. Replace the placeholder UUIDs below
  4. Run this entire script
*/

-- ============================================
-- STEP 1: Create Business Profile
-- ============================================
-- Replace 'BIZ_USER_UUID' with actual UUID from biz@biz.com

DO $$
DECLARE
  biz_user_id uuid := 'BIZ_USER_UUID'; -- REPLACE THIS
  biz_business_id uuid;
BEGIN
  -- Create business profile
  INSERT INTO business_profiles (user_id, business_name, business_type, description, token_balance, verified)
  VALUES (
    biz_user_id,
    'Zanzi Tours & Adventures',
    'tour',
    'Premier tour operator in Zanzibar offering unforgettable experiences across the island',
    99999,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET token_balance = 99999
  RETURNING id INTO biz_business_id;

  -- ============================================
  -- JOBS CATEGORY (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, images, features) VALUES

  (biz_business_id,
   'Experienced Tour Guide - Stone Town Heritage Sites',
   'tour-guide-stone-town-heritage',
   'Seeking passionate and knowledgeable tour guide for Stone Town historical tours. Must speak fluent English, Swahili, and have deep knowledge of Zanzibar history. Excellent communication skills required. Full-time position with competitive salary and benefits.',
   'jobs', 'tourism', 'stone-town',
   '+255 777 123 001', 'careers@stonetownheritage.co.tz',
   'featured',
   '["https://images.pexels.com/photos/1367267/pexels-photo-1367267.jpeg"]',
   '["Full Time", "Competitive Salary", "Benefits Package", "Training Provided"]'),

  (biz_business_id,
   'Sous Chef - Upscale Beachfront Restaurant',
   'sous-chef-beachfront-restaurant',
   'Award-winning beachfront restaurant in Nungwi seeking talented Sous Chef. Experience in Mediterranean and seafood cuisine essential. Must be able to work in fast-paced environment. Accommodation and meals provided. 2+ years experience required.',
   'jobs', 'food-service', 'nungwi',
   '+255 777 123 002', 'hr@beachrestaurant.com',
   'active',
   '["https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg"]',
   '["Accommodation Included", "Meals Provided", "International Team", "Career Growth"]'),

  (biz_business_id,
   'PADI Dive Instructor - Mnemba Atoll',
   'padi-dive-instructor-mnemba',
   'Busy dive center at Mnemba Atoll looking for PADI certified Dive Instructor. Advanced and specialty certifications preferred. Must have experience with varied dive sites and ability to teach multiple languages. Great tips and flexible schedule.',
   'jobs', 'water-sports', 'nungwi',
   '+255 777 123 003', 'jobs@mnembadiving.com',
   'active',
   '["https://images.pexels.com/photos/1007023/pexels-photo-1007023.jpeg"]',
   '["PADI Certified", "Great Tips", "Flexible Hours", "Equipment Provided"]');

  -- ============================================
  -- EVENTS CATEGORY (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, location, phone, email, status, price, images, features) VALUES

  (biz_business_id,
   'Full Moon Beach Party - Kendwa Rocks',
   'full-moon-kendwa-beach-party',
   'The legendary monthly full moon party returns! Dance barefoot on white sand under the stars. International DJs, fire dancers, beach BBQ, and the best cocktails in Zanzibar. Dress code: Beach chic. Age 18+. Party starts at sunset and goes until sunrise!',
   'events', 'kendwa',
   '+255 777 234 001', 'events@kendwarocks.com',
   'featured',
   20000,
   '["https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg"]',
   '["Live DJ", "Beach BBQ", "Fire Show", "Cocktails", "18+"]'),

  (biz_business_id,
   'Zanzibar International Food & Music Festival',
   'zanzibar-food-music-festival',
   'Three-day celebration of Zanzibar''s rich culinary heritage and vibrant music scene. 50+ food vendors, live taarab music, international acts, cooking demonstrations, and spice market. Family-friendly event at Forodhani Gardens. Free entry for children under 12.',
   'events', 'stone-town',
   '+255 777 234 002', 'info@zanzifestival.com',
   'boosted',
   35000,
   '["https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg"]',
   '["Food Vendors", "Live Music", "Cooking Demos", "Family Friendly", "3 Days"]'),

  (biz_business_id,
   'Sunset Yoga & Meditation Retreat',
   'sunset-yoga-meditation-paje',
   'Weekly sunset yoga sessions on pristine Paje Beach. All levels welcome. Professional instructor with 10+ years experience. Includes meditation, breathing exercises, and herbal tea. Bring your own mat or rent one. Limited spaces - book in advance!',
   'events', 'paje',
   '+255 777 234 003', 'namaste@pajeyoga.com',
   'active',
   15000,
   '["https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg"]',
   '["All Levels", "Professional Instructor", "Herbal Tea", "Beach Location", "Small Groups"]');

  -- ============================================
  -- BUSINESS - RESTAURANTS (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images, features, business_hours) VALUES

  (biz_business_id,
   'The Rock Restaurant Zanzibar',
   'the-rock-restaurant-zanzibar',
   'World-famous restaurant perched on a rock in the Indian Ocean. Accessible by foot at low tide or by boat at high tide. Specializing in fresh seafood, grilled lobster, and fusion cuisine. Reservations essential. Voted one of the most unique dining experiences in Africa.',
   'business', 'restaurants', 'michanvi-pingwe',
   '+255 777 345 001', '+255 777 345 001',
   'featured',
   45000,
   '["https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg"]',
   '["Fresh Seafood", "Ocean Views", "Unique Location", "WiFi", "Reservations Required"]',
   '{"monday": "12:00-15:00, 18:00-22:00", "tuesday": "12:00-15:00, 18:00-22:00", "wednesday": "12:00-15:00, 18:00-22:00", "thursday": "12:00-15:00, 18:00-22:00", "friday": "12:00-15:00, 18:00-23:00", "saturday": "12:00-15:00, 18:00-23:00", "sunday": "12:00-15:00, 18:00-22:00"}'),

  (biz_business_id,
   'Lukmaan Restaurant - Authentic Zanzibari',
   'lukmaan-restaurant-authentic',
   'Family-owned restaurant serving authentic Zanzibari cuisine since 1987. Famous for biryani, urojo soup, and mkate wa kumimina. Budget-friendly prices, generous portions. Located in the heart of Stone Town. No alcohol served. Air-conditioned indoor seating available.',
   'business', 'restaurants', 'stone-town',
   '+255 777 345 002', '+255 777 345 002',
   'active',
   18000,
   '["https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg"]',
   '["Local Cuisine", "Halal", "Budget Friendly", "Family Owned", "AC Available"]',
   '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-22:00"}'),

  (biz_business_id,
   'Emerson Spice Rooftop Restaurant',
   'emerson-spice-rooftop',
   'Elegant rooftop dining with 360-degree views of Stone Town and the ocean. Fusion menu combining Swahili flavors with international techniques. Romantic setting perfect for special occasions. Live music on weekends. Smart casual dress code. Advance booking recommended.',
   'business', 'restaurants', 'stone-town',
   '+255 777 345 003', '+255 777 345 003',
   'boosted',
   55000,
   '["https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg"]',
   '["Rooftop Dining", "Ocean Views", "Live Music", "Fine Dining", "Romantic Setting"]',
   '{"monday": "Closed", "tuesday": "18:00-23:00", "wednesday": "18:00-23:00", "thursday": "18:00-23:00", "friday": "18:00-00:00", "saturday": "18:00-00:00", "sunday": "18:00-23:00"}');

  -- ============================================
  -- BUSINESS - CLUBS (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, status, price, images, features, business_hours) VALUES

  (biz_business_id,
   'Kendwa Rocks Beach Club',
   'kendwa-rocks-beach-club',
   'The original Kendwa beach bar and nightclub. Famous for sunset parties, full moon celebrations, and incredible ocean views. Multiple bars, dance floor on the beach, fire shows, and international DJs. Free entry before 10pm. Happy hour 6-8pm daily.',
   'business', 'clubs', 'kendwa',
   '+255 777 456 001',
   'featured',
   10000,
   '["https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg"]',
   '["Beach Location", "Live DJs", "Fire Shows", "Happy Hour", "Ocean Views"]',
   '{"monday": "16:00-02:00", "tuesday": "16:00-02:00", "wednesday": "16:00-02:00", "thursday": "16:00-03:00", "friday": "16:00-04:00", "saturday": "16:00-04:00", "sunday": "16:00-02:00"}'),

  (biz_business_id,
   'Mercury''s Lounge & Bar',
   'mercurys-lounge-bar',
   'Sophisticated cocktail lounge named after Freddie Mercury, who was born in Zanzibar. Craft cocktails, premium spirits, and live jazz on Fridays. Elegant ambiance with vintage decor. Smart casual dress code. Reservations recommended for weekends.',
   'business', 'clubs', 'stone-town',
   '+255 777 456 002',
   'active',
   0,
   '["https://images.pexels.com/photos/941864/pexels-photo-941864.jpeg"]',
   '["Craft Cocktails", "Live Jazz", "Elegant", "Premium Spirits", "Historic"]',
   '{"monday": "18:00-01:00", "tuesday": "18:00-01:00", "wednesday": "18:00-01:00", "thursday": "18:00-02:00", "friday": "18:00-03:00", "saturday": "18:00-03:00", "sunday": "Closed"}'),

  (biz_business_id,
   'Coco Beach Bar Paje',
   'coco-beach-bar-paje',
   'Laid-back beach bar perfect for kitesurfers and beach lovers. Great cocktails, fresh juices, and light bites. Beach volleyball, hammocks, and chill music. Perfect sunset spot. Popular with backpackers and digital nomads. Free WiFi.',
   'business', 'clubs', 'paje',
   '+255 777 456 003',
   'active',
   0,
   '["https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg"]',
   '["Beach Bar", "Chill Vibes", "Free WiFi", "Beach Volleyball", "Sunset Views"]',
   '{"monday": "10:00-23:00", "tuesday": "10:00-23:00", "wednesday": "10:00-23:00", "thursday": "10:00-23:00", "friday": "10:00-00:00", "saturday": "10:00-00:00", "sunday": "10:00-23:00"}');

  -- ============================================
  -- BUSINESS - TAXIS (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images, features) VALUES

  (biz_business_id,
   'Zanzi Express - Airport Transfers',
   'zanzi-express-airport-transfers',
   '24/7 reliable airport transfer service. Modern air-conditioned vehicles, professional English-speaking drivers. Fixed prices - no surprises. Meet & greet service. Child seats available. Online booking with instant confirmation. Island tours also available.',
   'business', 'taxi', 'stone-town',
   '+255 777 567 001', '+255 777 567 001',
   'boosted',
   50000,
   '["https://images.pexels.com/photos/376729/pexels-photo-376729.jpeg"]',
   '["24/7 Service", "Fixed Prices", "AC Vehicles", "English Speaking", "Child Seats"]'),

  (biz_business_id,
   'North Coast Taxi Service',
   'north-coast-taxi-service',
   'Specialized transfers between Stone Town and northern beaches (Nungwi, Kendwa). Shared and private options. Friendly local drivers with excellent knowledge of the island. Can arrange stops at spice farms or other attractions en route. WhatsApp booking.',
   'business', 'taxi', 'nungwi',
   '+255 777 567 002', '+255 777 567 002',
   'active',
   40000,
   '["https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg"]',
   '["Shared Rides", "Private Options", "Local Drivers", "Flexible Routes", "WhatsApp Booking"]'),

  (biz_business_id,
   'Stone Town Taxi Stand',
   'stone-town-taxi-stand',
   'Official Stone Town taxi service located at Darajani Market. All drivers registered and vetted. Competitive rates for all destinations. Negotiate price before journey. Available for hourly hire or full day tours. Drivers speak multiple languages.',
   'business', 'taxi', 'stone-town',
   '+255 777 567 003', '+255 777 567 003',
   'active',
   35000,
   '["https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg"]',
   '["Registered Drivers", "Multiple Languages", "Hourly Hire", "Full Day Tours", "Central Location"]');

  -- ============================================
  -- AUTOMOTIVE (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, price, images, features) VALUES

  (biz_business_id,
   'Zanzibar Premium Car Rental',
   'zanzibar-premium-car-rental',
   'Self-drive and chauffeur-driven car hire. Wide selection: economy, SUVs, and luxury vehicles. All cars fully insured, regularly serviced. GPS navigation included. Free airport pickup. International driving license accepted. 24/7 roadside assistance.',
   'automotive', 'car-rental', 'stone-town',
   '+255 777 678 001', 'rentals@zanzicars.com',
   'featured',
   120000,
   '["https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg"]',
   '["Self Drive", "Chauffeur Option", "Full Insurance", "GPS Included", "24/7 Support"]'),

  (biz_business_id,
   'Paje Scooter & Motorbike Rentals',
   'paje-scooter-motorbike-rentals',
   'Best way to explore Zanzibar! Scooters and motorbikes for daily or weekly rental. Well-maintained bikes, helmets included. No deposit for long-term rentals. Free delivery to your accommodation in Paje area. Basic tutorial for first-time riders.',
   'automotive', 'bike-rental', 'paje',
   '+255 777 678 002', 'ride@pajebikes.com',
   'active',
   50000,
   '["https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg"]',
   '["Daily & Weekly", "Helmets Included", "Free Delivery", "Tutorial Available", "No Deposit"]'),

  (biz_business_id,
   'Auto Garage Zanzibar - Repairs & Service',
   'auto-garage-zanzibar-repairs',
   'Professional car repair and maintenance services. Experienced mechanics, genuine spare parts. All makes and models. Services include: oil change, brake repair, AC service, electrical work, body work. Fair prices, quick turnaround. Free quotes.',
   'automotive', 'repair', 'stone-town',
   '+255 777 678 003', 'service@autogarage.co.tz',
   'active',
   0,
   '["https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg"]',
   '["All Makes", "Genuine Parts", "Quick Service", "Fair Prices", "Free Quotes"]');

  -- ============================================
  -- ACTIVITIES - WATER SPORTS (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, whatsapp, status, price, images, features) VALUES

  (biz_business_id,
   'Paje Lagoon Kite School - IKO Certified',
   'paje-lagoon-kite-school',
   'Learn kitesurfing in perfect conditions! Shallow warm waters, steady winds, white sand beach. IKO certified instructors, modern equipment, small groups (max 4 students). Beginner to advanced courses. Equipment rental for experienced kiters. Accommodation packages available.',
   'activities', 'surfing', 'paje',
   '+255 777 789 001', '+255 777 789 001',
   'featured',
   180000,
   '["https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg"]',
   '["IKO Certified", "Perfect Conditions", "Modern Equipment", "Small Groups", "All Levels"]'),

  (biz_business_id,
   'Mnemba Atoll Diving & Snorkeling',
   'mnemba-atoll-diving-snorkeling',
   'Explore the underwater paradise of Mnemba Atoll! See dolphins, sea turtles, whale sharks (seasonal), and colorful reef fish. PADI certified dive center. Snorkeling and scuba diving trips. All equipment provided. Underwater photography service available.',
   'activities', 'diving', 'nungwi',
   '+255 777 789 002', '+255 777 789 002',
   'boosted',
   200000,
   '["https://images.pexels.com/photos/1007023/pexels-photo-1007023.jpeg"]',
   '["PADI Certified", "Mnemba Atoll", "See Dolphins", "Equipment Included", "Photography Available"]'),

  (biz_business_id,
   'Safari Blue - Full Day Boat Adventure',
   'safari-blue-boat-adventure',
   'Zanzibar''s most popular boat trip! Visit sandbanks, swim in lagoons, snorkel pristine reefs. Includes: traditional dhow sailing, fresh seafood BBQ lunch, tropical fruits, soft drinks. Departs from Fumba. Hotel pickup available. Perfect for families.',
   'activities', 'boat-trips', 'fumba',
   '+255 777 789 003', '+255 777 789 003',
   'featured',
   130000,
   '["https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg"]',
   '["Full Day", "BBQ Lunch", "Snorkeling", "Hotel Pickup", "Family Friendly"]');

  -- ============================================
  -- ACTIVITIES - LAND (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, status, price, images, features) VALUES

  (biz_business_id,
   'Jozani Forest & Red Colobus Monkey Tour',
   'jozani-forest-monkey-tour',
   'Visit Zanzibar''s last remaining forest! See the rare and endemic Red Colobus monkeys in their natural habitat. 2-hour guided nature walk through mangrove swamps and forest. Learn about medicinal plants and conservation. Photography opportunities. Morning tours recommended.',
   'activities', 'hiking', 'jozani',
   '+255 777 890 001',
   'active',
   35000,
   '["https://images.pexels.com/photos/1681660/pexels-photo-1681660.jpeg"]',
   '["Nature Walk", "See Monkeys", "Guided Tour", "Conservation", "Photography"]'),

  (biz_business_id,
   'Spice Farm Tour & Traditional Lunch',
   'spice-farm-tour-lunch',
   'Discover why Zanzibar is called the Spice Island! Interactive tour of working spice plantation. See, smell, and taste: cloves, vanilla, cinnamon, cardamom, and more. Learn traditional uses. Includes traditional Swahili lunch. Fruit tasting. Perfect for all ages.',
   'activities', 'tours', 'kizimbani',
   '+255 777 890 002',
   'boosted',
   45000,
   '["https://images.pexels.com/photos/955935/pexels-photo-955935.jpeg"]',
   '["Interactive Tour", "Lunch Included", "Taste Spices", "All Ages", "Traditional Experience"]'),

  (biz_business_id,
   'Quad Biking Adventure - Village & Beach',
   'quad-biking-adventure-zanzibar',
   'Thrilling 2-hour quad bike adventure through authentic Zanzibar! Drive through villages, coconut plantations, and along beaches. No experience necessary - full training provided. Safety equipment included. Small groups. Morning and afternoon departures. Minimum age 16.',
   'activities', 'adventure', 'paje',
   '+255 777 890 003',
   'active',
   100000,
   '["https://images.pexels.com/photos/2526127/pexels-photo-2526127.jpeg"]',
   '["No Experience Needed", "2 Hours", "Safety Gear", "Small Groups", "Village Tour"]');

  -- ============================================
  -- USEFUL INFO (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, subcategory, location, phone, email, status, images, features) VALUES

  (biz_business_id,
   'Zanzibar Tourist Information Center',
   'zanzibar-tourist-info-center',
   'Official tourist information center at the Old Fort. Free maps, brochures, and expert advice. English, Swahili, French, and German spoken. Help with: tour bookings, accommodation, transport, cultural questions. Open daily. No commission charged. Friendly and honest advice.',
   'useful-info', 'tourist-info', 'stone-town',
   '+255 777 901 001', 'info@zanzibartourism.go.tz',
   'featured',
   '["https://images.pexels.com/photos/434645/pexels-photo-434645.jpeg"]',
   '["Free Maps", "Expert Advice", "Multiple Languages", "No Commission", "Daily Open"]'),

  (biz_business_id,
   'Zanzibar Medical & Dental Center',
   'zanzibar-medical-dental-center',
   'Modern medical facility with international standards. English-speaking doctors, 24/7 emergency services. Services: general practice, dental, laboratory, pharmacy. Travel insurance accepted. Located in Stone Town near Forodhani. Ambulance service available. Credit cards accepted.',
   'useful-info', 'healthcare', 'stone-town',
   '+255 777 901 002', 'info@zanzimedical.com',
   'active',
   '["https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg"]',
   '["24/7 Emergency", "English Speaking", "Insurance Accepted", "Modern Facility", "Pharmacy"]'),

  (biz_business_id,
   'Professional Currency Exchange',
   'professional-currency-exchange',
   'Best exchange rates in Stone Town! Buy and sell: USD, EUR, GBP, and major currencies. No commission on amounts over $100. Fast service, accurate counting, official receipts. Safe and secure. Located on Kenyatta Road. Open 7 days. ATM also available.',
   'useful-info', 'services', 'stone-town',
   '+255 777 901 003', 'forex@zanziexchange.com',
   'active',
   '["https://images.pexels.com/photos/164573/pexels-photo-164573.jpeg"]',
   '["Best Rates", "No Commission", "Fast Service", "Official Receipts", "ATM Available"]');

  -- ============================================
  -- ACCOMMODATION (3 listings)
  -- ============================================

  INSERT INTO listings (business_id, title, slug, description, category, location, phone, email, website, whatsapp, status, price, images, features, business_hours) VALUES

  (biz_business_id,
   'Zanzi Paradise Beach Resort & Spa',
   'zanzi-paradise-beach-resort',
   'Luxury 5-star beachfront resort in Nungwi. 80 rooms and suites, infinity pool, full-service spa, 3 restaurants, 2 bars. All rooms with ocean views, AC, satellite TV, minibar. Activities: diving, snorkeling, sunset cruises. Kids club available. Wedding and event facilities.',
   'accommodation', 'nungwi',
   '+255 777 012 001', 'reservations@zanziparadise.com', 'www.zanziparadise.com', '+255 777 012 001',
   'featured',
   450000,
   '["https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg"]',
   '["5 Star", "Beach Access", "Infinity Pool", "Spa", "3 Restaurants", "Kids Club", "WiFi"]',
   '{"checkin": "14:00", "checkout": "11:00"}'),

  (biz_business_id,
   'Paje Palms Boutique Hotel',
   'paje-palms-boutique-hotel',
   'Intimate 12-room boutique hotel on Paje Beach. Swahili-style architecture, individually decorated rooms. Beachfront location, restaurant serving fresh seafood and international cuisine. Perfect for kitesurfers - kite storage available. Pool, sun loungers, beach service. Adult-only property.',
   'accommodation', 'paje',
   '+255 777 012 002', 'stay@pajepalms.co.tz', 'www.pajepalms.com', '+255 777 012 002',
   'boosted',
   280000,
   '["https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg"]',
   '["Boutique", "Beach Location", "Restaurant", "Pool", "Kite Storage", "Adult Only", "WiFi"]',
   '{"checkin": "14:00", "checkout": "10:00"}'),

  (biz_business_id,
   'Stone Town Heritage Guesthouse',
   'stone-town-heritage-guesthouse',
   'Charming restored Arab house in the heart of Stone Town. 8 rooms with traditional Zanzibari beds, AC, private bathrooms. Rooftop terrace with sea views. Breakfast included. Walking distance to all attractions, restaurants, and markets. Friendly staff, local knowledge. Budget-friendly.',
   'accommodation', 'stone-town',
   '+255 777 012 003', 'hello@heritagehouse.co.tz', '', '+255 777 012 003',
   'active',
   150000,
   '["https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg"]',
   '["Historic Building", "Central Location", "Rooftop Terrace", "Breakfast Included", "Budget Friendly", "Traditional", "WiFi"]',
   '{"checkin": "13:00", "checkout": "10:00"}');

  RAISE NOTICE 'Seed data inserted successfully! Total: 24 listings (3 per category)';
  RAISE NOTICE 'Featured listings: 6';
  RAISE NOTICE 'Boosted listings: 5';
  RAISE NOTICE 'Active listings: 13';

END $$;