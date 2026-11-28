-- Update all listings with complete contact details and what3words locations

-- Business Listings - Stone Town
UPDATE listings SET
  phone = '+255 777 123 456',
  address = 'Michamvi Peninsula, Southeast Coast',
  what3words = 'cubes.ideas.tiger',
  email = 'info@rockrestaurant.tz',
  website = 'https://therockrestaurant.com',
  opening_hours = '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-22:00"}'::jsonb,
  description = 'Iconic restaurant perched on a rock in the Indian Ocean. Enjoy fresh seafood while surrounded by turquoise waters. Accessible by foot during low tide or by boat during high tide. Stunning views and unforgettable dining experience.'
WHERE title = 'The Rock Restaurant';

UPDATE listings SET
  phone = '+255 777 234 567',
  address = 'Kenyatta Road, Stone Town',
  what3words = 'drums.hooks.lions',
  email = 'info@emersonspice.com',
  website = 'https://emersonspice.com',
  opening_hours = '{"monday": "18:00-23:00", "tuesday": "18:00-23:00", "wednesday": "18:00-23:00", "thursday": "18:00-23:00", "friday": "18:00-00:00", "saturday": "18:00-00:00", "sunday": "18:00-23:00"}'::jsonb,
  description = 'Romantic rooftop dining with panoramic views of Stone Town. Award-winning Zanzibari cuisine with Arabic and Indian influences. Live taarab music on weekends. Perfect for sunset cocktails and special occasions.'
WHERE title = 'Emerson Spice Rooftop';

UPDATE listings SET
  phone = '+255 777 345 678',
  address = 'Hurumzi Street, Stone Town',
  what3words = 'spice.sultan.doors',
  email = 'info@teatreerooftop.com',
  website = 'https://teatreerooftop.com',
  opening_hours = '{"monday": "10:00-23:00", "tuesday": "10:00-23:00", "wednesday": "10:00-23:00", "thursday": "10:00-23:00", "friday": "10:00-01:00", "saturday": "10:00-01:00", "sunday": "10:00-23:00"}'::jsonb,
  description = 'Trendy rooftop bar and lounge in the heart of Stone Town. Creative cocktails, international menu, and spectacular harbor views. DJ sets on Friday and Saturday nights. Popular with locals and tourists alike.'
WHERE title = 'Tea Tree Rooftop Lounge';

UPDATE listings SET
  phone = '+255 777 456 123',
  address = 'Malindi Road, Stone Town',
  what3words = 'mercury.drinks.stone',
  email = 'info@mercurysbar.com',
  website = 'https://mercurysbar.com',
  opening_hours = '{"monday": "17:00-02:00", "tuesday": "17:00-02:00", "wednesday": "17:00-02:00", "thursday": "17:00-02:00", "friday": "17:00-03:00", "saturday": "17:00-03:00", "sunday": "17:00-02:00"}'::jsonb,
  description = 'Legendary bar named after Freddie Mercury who was born in Zanzibar. Live music venue with local and international acts. Great atmosphere, cold beer, and Zanzibar pizza. A must-visit nightlife spot in Stone Town.'
WHERE title = 'Mercury''s Bar';

UPDATE listings SET
  phone = '+255 777 567 234',
  address = 'Darajani Market Area, Stone Town',
  what3words = 'daladala.quick.central',
  email = 'info@stonetowntaxis.com',
  opening_hours = '{"monday": "05:00-23:00", "tuesday": "05:00-23:00", "wednesday": "05:00-23:00", "thursday": "05:00-23:00", "friday": "05:00-23:00", "saturday": "05:00-23:00", "sunday": "05:00-23:00"}'::jsonb,
  description = 'Reliable taxi service covering all of Zanzibar. Airport transfers, day tours, and hourly rentals available. Professional drivers with excellent knowledge of the island. Air-conditioned vehicles and competitive rates.'
WHERE title = 'Stone Town Taxis';

UPDATE listings SET
  phone = '+255 777 678 345',
  address = 'Mizingani Road, Stone Town',
  what3words = 'harbor.safari.blue',
  email = 'booking@safariblue.com',
  website = 'https://safariblue.tz',
  opening_hours = '{"monday": "06:00-18:00", "tuesday": "06:00-18:00", "wednesday": "06:00-18:00", "thursday": "06:00-18:00", "friday": "06:00-18:00", "saturday": "06:00-18:00", "sunday": "06:00-18:00"}'::jsonb,
  description = 'Full-day sailing adventure to Menai Bay Conservation Area. Snorkeling, dolphin watching, sandbank picnic, and swimming in the mangrove lagoon. Includes fresh seafood BBQ lunch. One of Zanzibar''s most popular tours.'
WHERE title = 'Safari Blue Day Tour';

-- Paje Listings
UPDATE listings SET
  phone = '+255 777 456 789',
  address = 'Paje Beach, Southeast Coast',
  what3words = 'kites.waves.sunset',
  email = 'info@pajekite.com',
  website = 'https://pajekite.com',
  opening_hours = '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-18:00", "sunday": "08:00-18:00"}'::jsonb,
  description = 'Professional kitesurfing school with IKO certified instructors. Beginner to advanced courses available. Equipment rental and storage. Best season June to March. Small groups and personalized instruction. Stunning shallow lagoon perfect for learning.'
WHERE title = 'Paje Kite School';

UPDATE listings SET
  phone = '+255 777 567 890',
  address = 'Paje Main Road, Paje Village',
  what3words = 'palms.breeze.ocean',
  email = 'info@pajesands.com',
  website = 'https://pajesands.com',
  opening_hours = '{"monday": "00:00-23:59", "tuesday": "00:00-23:59", "wednesday": "00:00-23:59", "thursday": "00:00-23:59", "friday": "00:00-23:59", "saturday": "00:00-23:59", "sunday": "00:00-23:59"}'::jsonb,
  description = 'Beachfront boutique hotel with traditional Zanzibari architecture. Spacious rooms with ocean views, infinity pool, and spa. Direct beach access with sunbeds and umbrellas. Restaurant serving international and Swahili cuisine. Perfect for kitesurfers and beach lovers.'
WHERE title = 'Paje by Sands Beach Resort';

-- Nungwi Listings
UPDATE listings SET
  phone = '+255 777 678 901',
  address = 'Nungwi Beach Road, North Coast',
  what3words = 'turtles.coral.beach',
  email = 'info@nungwidiving.com',
  website = 'https://nungwidiving.com',
  opening_hours = '{"monday": "07:00-18:00", "tuesday": "07:00-18:00", "wednesday": "07:00-18:00", "thursday": "07:00-18:00", "friday": "07:00-18:00", "saturday": "07:00-18:00", "sunday": "07:00-18:00"}'::jsonb,
  description = 'PADI 5-star dive center offering courses from beginner to instructor. Daily dive trips to Mnemba Atoll and other pristine sites. See dolphins, turtles, and vibrant coral reefs. Equipment rental and underwater photography services available.'
WHERE title = 'Nungwi Diving Center';

UPDATE listings SET
  phone = '+255 777 789 234',
  address = 'Nungwi Village, North Coast',
  what3words = 'sunset.kendwa.paradise',
  email = 'stay@zahotel.com',
  website = 'https://zahotel.com',
  opening_hours = '{"monday": "00:00-23:59", "tuesday": "00:00-23:59", "wednesday": "00:00-23:59", "thursday": "00:00-23:59", "friday": "00:00-23:59", "saturday": "00:00-23:59", "sunday": "00:00-23:59"}'::jsonb,
  description = 'Luxury boutique hotel on pristine Nungwi beach. Elegantly designed villas with private plunge pools. World-class spa, fine dining restaurant, and beachfront bar. Stunning sunsets and personalized service. Adults-only sanctuary.'
WHERE title = 'Z Hotel Zanzibar';

-- Job Listings
UPDATE listings SET
  phone = '+255 777 789 012',
  address = 'Mkunazini Street, Stone Town',
  what3words = 'tours.guide.heritage',
  email = 'jobs@zanzitours.com',
  opening_hours = '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  description = 'Seeking experienced tour guide for Stone Town heritage walks. Must be fluent in English and Swahili. Knowledge of Zanzibar history, culture, and architecture required. Licensed guide preferred. Full-time position with competitive salary and tips.'
WHERE title = 'Tour Guide Job - Stone Town';

UPDATE listings SET
  phone = '+255 777 890 123',
  address = 'Shangani Street, Stone Town',
  what3words = 'chef.kitchen.fusion',
  email = 'hr@6degrees.tz',
  opening_hours = '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  description = 'High-end restaurant seeking talented Sous Chef. Experience in fusion cuisine and seafood preparation essential. Must work well under pressure. 2+ years experience in similar role. Competitive salary, accommodation, and meals provided.'
WHERE title = 'Sous Chef Position';

UPDATE listings SET
  phone = '+255 777 901 234',
  address = 'Dive Center, Kendwa Beach',
  what3words = 'instructor.padi.dive',
  email = 'careers@kendwadive.com',
  opening_hours = '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "08:00-17:00", "sunday": "Closed"}'::jsonb,
  description = 'PADI Dive Center seeking experienced instructor. IDC Staff Instructor or Course Director preferred. Teach Open Water to Divemaster courses. Equipment maintenance skills a plus. Salary negotiable based on experience. Accommodation provided.'
WHERE title = 'PADI Dive Instructor';

-- Event Listings
UPDATE listings SET
  phone = '+255 777 111 222',
  address = 'Kendwa Beach, North Coast',
  what3words = 'party.beach.moon',
  email = 'info@kendwarocks.com',
  website = 'https://kendwarocks.com',
  opening_hours = '{"note": "Monthly event - check website for dates"}'::jsonb,
  description = 'Monthly beach party under the full moon. Live DJ sets, fire dancers, and beach BBQ. Starts at sunset and goes until sunrise. Shuttle service available from Stone Town and major hotels. Free entry before 10pm, drinks sold separately.'
WHERE title = 'Full Moon Party - Kendwa';

UPDATE listings SET
  phone = '+255 777 222 333',
  address = 'Forodhani Gardens, Stone Town',
  what3words = 'food.street.gardens',
  email = 'info@zanzifoodfest.com',
  opening_hours = '{"note": "Annual event in July"}'::jsonb,
  description = 'Annual celebration of Zanzibar''s culinary heritage. Street food vendors, cooking demonstrations, spice tours, and live music. Features traditional Swahili dishes, seafood BBQ, and fusion cuisine. Free entry, food sold separately. Family-friendly event.'
WHERE title = 'Zanzibar Food Festival';

UPDATE listings SET
  phone = '+255 777 333 444',
  address = 'Various Beaches, Zanzibar',
  what3words = 'sunset.yoga.peace',
  email = 'info@zanziyoga.com',
  website = 'https://zanziyoga.com',
  opening_hours = '{"note": "Weekly sessions every Sunday 17:00-18:30"}'::jsonb,
  description = 'Weekly yoga sessions at different beaches around the island. All levels welcome from beginners to advanced. Professional instructor with 10+ years experience. Mats provided. Beautiful sunset views and meditation included. Book in advance.'
WHERE title = 'Sunset Yoga Sessions';

-- Activities
UPDATE listings SET
  phone = '+255 777 444 555',
  address = 'Makunduchi, Southeast Zanzibar',
  what3words = 'spices.farm.cloves',
  email = 'tours@tangawizispice.com',
  website = 'https://tangawizispice.com',
  opening_hours = '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "08:00-17:00", "sunday": "08:00-17:00"}'::jsonb,
  description = 'Half-day guided tour of working spice plantation. See cloves, vanilla, cinnamon, nutmeg, and black pepper growing. Learn about traditional uses and try fresh tropical fruits. Includes transport from Stone Town and Swahili lunch. Small groups only.'
WHERE title = 'Tangawizi Spice Farm Tour';

-- Automotive
UPDATE listings SET
  phone = '+255 777 555 666',
  address = 'Airport Road, Zanzibar',
  what3words = 'rental.cars.airport',
  email = 'info@zanzicarrent.com',
  website = 'https://zanzicarrent.com',
  opening_hours = '{"monday": "07:00-19:00", "tuesday": "07:00-19:00", "wednesday": "07:00-19:00", "thursday": "07:00-19:00", "friday": "07:00-19:00", "saturday": "08:00-18:00", "sunday": "08:00-18:00"}'::jsonb,
  description = 'Modern fleet of well-maintained vehicles. SUVs perfect for island exploration. Airport pickup/dropoff included. Insurance and GPS available. Driver service optional. Weekly rates available. International and local licenses accepted.'
WHERE title = 'Zanzi Car Rentals';

UPDATE listings SET
  phone = '+255 777 666 777',
  address = 'Nungwi Village, North Coast',
  what3words = 'scooter.hire.beach',
  email = 'info@nungwiscooters.com',
  opening_hours = '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-18:00", "sunday": "08:00-18:00"}'::jsonb,
  description = 'Scooter and motorbike rentals for exploring Zanzibar at your own pace. Helmets and locks included. Quick safety briefing provided. Daily and weekly rates available. Delivery to your hotel possible. Valid motorcycle license required.'
WHERE title = 'Nungwi Scooter Hire';

UPDATE listings SET
  phone = '+255 777 777 888',
  address = 'Malawi Road, Stone Town',
  what3words = 'garage.repair.mechanic',
  email = 'service@zanzigarage.com',
  opening_hours = '{"monday": "07:30-18:00", "tuesday": "07:30-18:00", "wednesday": "07:30-18:00", "thursday": "07:30-18:00", "friday": "07:30-18:00", "saturday": "08:00-13:00", "sunday": "Closed"}'::jsonb,
  description = 'Full-service auto repair shop with experienced mechanics. All makes and models serviced. Oil changes, brake repairs, engine diagnostics, and bodywork. Genuine and aftermarket parts available. Towing service. English-speaking staff.'
WHERE title = 'Zanzi Auto Garage';
