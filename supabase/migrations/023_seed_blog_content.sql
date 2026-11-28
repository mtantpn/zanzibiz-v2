-- Seed Blog Posts for All Categories
-- Each category gets 5 comprehensive posts with images and useful links

-- Transportation Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Complete Guide to Getting Around Zanzibar',
    'complete-guide-to-getting-around-zanzibar',
    'transportation',
    'Everything you need to know about transportation in Zanzibar, from taxis to dala-dalas.',
    'Getting around Zanzibar is an adventure in itself. The island offers various transportation options to suit different budgets and preferences. For a complete list of <a href="/index.html#listings">local transportation services</a>, visit our business directory.

Dala-dalas (minibuses) are the most popular and affordable way to travel between towns. They operate on fixed routes and cost just a few dollars. However, they can be crowded and don''t run on fixed schedules.

Taxis are readily available in Stone Town and major tourist areas. Always agree on the fare before starting your journey. Expect to pay 20,000-50,000 TZS for short trips within Stone Town. You can find <a href="/index.html#categories">verified taxi services</a> in our business listings.

Car rentals are available but require an international driving license. Roads can be challenging, especially during rainy season. Scooter rentals are popular for exploring at your own pace. Browse <a href="/index.html#listings">car and scooter rental companies</a> on ZanziBiz.

For airport transfers, pre-book through your hotel or use reputable taxi services. Check out our <a href="/index.html#categories">transportation category</a> for reliable options. The journey from the airport to Stone Town takes about 15-20 minutes.',
    'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg',
        'https://images.pexels.com/photos/163203/traffic-lights-traffic-car-vehicle-163203.jpeg'
    ],
    ARRAY['transportation', 'dala-dala', 'taxi', 'car rental', 'getting around'],
    '[
        {"text": "Zanzibar Transport Authority", "url": "https://www.transportation.go.tz"},
        {"text": "Car Rental Companies", "url": "https://www.rentalcars.com/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    145
),
(
    'Airport Transfers: What You Need to Know',
    'airport-transfers-what-you-need-to-know',
    'transportation',
    'Navigate your arrival and departure with this comprehensive airport transfer guide.',
    'Zanzibar''s Abeid Amani Karume International Airport is your gateway to paradise. Here''s everything you need to know about transfers.

Official Airport Taxis: Look for the official taxi desk inside the arrivals hall. Prices are fixed and displayed clearly. A ride to Stone Town costs around 30,000 TZS.

Pre-Booked Transfers: Many hotels offer complimentary or paid airport transfers. This is often the most convenient option, especially if arriving late at night.

Dala-dalas: While possible, taking a dala-dala from the airport requires walking to the main road and isn''t recommended with heavy luggage.

What to Expect: The airport is small and easy to navigate. You''ll need to show your yellow fever certificate if arriving from certain countries. Currency exchange is available but rates are better in town.

Departure: Arrive at least 2 hours before international flights. Security can be thorough, so allow extra time.',
    'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/2007401/pexels-photo-2007401.jpeg'
    ],
    ARRAY['airport', 'transfers', 'arrival', 'taxi'],
    '[
        {"text": "Zanzibar Airport Official Site", "url": "https://www.zanzibarairports.com"},
        {"text": "Book Airport Transfer", "url": "https://www.booking.com/airport-taxis"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    203
),
(
    'Renting a Scooter in Zanzibar: Complete Guide',
    'renting-a-scooter-in-zanzibar-complete-guide',
    'transportation',
    'Explore Zanzibar at your own pace with a scooter. Here''s everything you need to know before renting.',
    'Renting a scooter is one of the best ways to explore Zanzibar independently. Here''s your complete guide to scooter rentals. Find <a href="/index.html#listings">verified scooter rental services</a> in our directory.

Requirements: You''ll need a valid international driving license and passport. Some rental shops may require a deposit (usually 100-200 USD). Browse our list of <a href="/index.html#categories">reputable rental companies</a> on ZanziBiz.

Cost: Expect to pay 25,000-35,000 TZS per day for a basic scooter. Longer rentals often come with discounts.

Safety First: Always wear a helmet (provided by rental shops). Roads can be sandy and unpredictable. Watch out for speed bumps in villages.

Best Routes: The coastal road from Nungwi to Stone Town offers stunning views. The route to Jozani Forest is perfect for a day trip. Looking for places to stop along the way? Check out <a href="/index.html#listings">restaurants and cafes</a> in our listings.

Fuel: Petrol stations are limited outside major towns. Always fill up before long journeys. Small roadside vendors sell fuel in bottles but quality varies.

Traffic Rules: Drive on the left. Speed limits are 50 km/h in towns and 80 km/h on highways. Police checkpoints are common.',
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg',
        'https://images.pexels.com/photos/163210/motorcyclist-motorcycle-vehicle-sports-163210.jpeg'
    ],
    ARRAY['scooter', 'rental', 'motorcycle', 'driving', 'road trip'],
    '[
        {"text": "Zanzibar Scooter Rentals", "url": "https://www.zanzibarmotorental.com"},
        {"text": "International Driving Permit Info", "url": "https://www.idpapplication.org"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    167
),
(
    'Ferry Services: Traveling Between Zanzibar and Dar es Salaam',
    'ferry-services-traveling-between-zanzibar-and-dar',
    'transportation',
    'Complete guide to ferry services connecting Zanzibar with mainland Tanzania.',
    'The ferry between Zanzibar and Dar es Salaam is a popular and scenic way to reach the island.

Ferry Companies: Azam Marine and Fast Ferries operate multiple daily services. Azam Marine is generally considered more reliable.

Schedule: Ferries run 4-5 times daily in each direction. The journey takes about 2 hours. Morning ferries (7-9 AM) are often fully booked.

Booking: Book tickets in advance, especially during peak season (June-September). You can book online or at the ferry terminal.

Classes: Economy class is comfortable enough for the 2-hour journey. VIP class offers air-conditioning and more space.

Cost: Economy tickets cost around 35-40 USD. VIP class is 50-55 USD.

What to Bring: Bring your passport and any immigration forms. The crossing can be choppy, so consider motion sickness medication.

At the Port: Arrive at least 30 minutes before departure. Security screening is thorough. Porters will offer to help with luggage for a small fee.',
    'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg'
    ],
    ARRAY['ferry', 'dar es salaam', 'boat', 'azam marine', 'transportation'],
    '[
        {"text": "Azam Marine Bookings", "url": "https://www.azammarine.com"},
        {"text": "Ferry Schedule & Prices", "url": "https://www.ferrytozanzibar.com"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    189
),
(
    'Cycling Around Zanzibar: Routes and Tips',
    'cycling-around-zanzibar-routes-and-tips',
    'transportation',
    'Discover Zanzibar on two wheels with this guide to cycling routes and bike rentals.',
    'Cycling is an eco-friendly and healthy way to explore Zanzibar''s stunning landscapes.

Bike Rentals: Available in Stone Town, Nungwi, Paje, and Jambiani. Expect to pay 15,000-25,000 TZS per day. Check brakes and tires before setting off.

Best Cycling Routes:
- Paje to Jambiani: 10 km coastal route with stunning views
- Stone Town to Bububu: 10 km through spice plantations
- Nungwi to Kendwa: 5 km beach road perfect for sunset rides

What to Bring: Sunscreen, plenty of water, and a hat. The sun is intense, especially midday.

Road Conditions: Main roads are generally good, but village roads can be sandy. Mountain bikes are more suitable than road bikes.

Safety: Wear bright clothing. Traffic can be unpredictable. Avoid cycling at night as street lighting is limited.

Local Etiquette: Wave and greet locals as you pass through villages. Stop at small shops to support local businesses.',
    'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1791653/pexels-photo-1791653.jpeg',
        'https://images.pexels.com/photos/1595463/pexels-photo-1595463.jpeg'
    ],
    ARRAY['cycling', 'bike', 'bicycle', 'eco-friendly', 'exercise'],
    '[
        {"text": "Bike Rental Stone Town", "url": "https://www.zanzibarbikes.com"},
        {"text": "Cycling Routes Map", "url": "https://www.komoot.com/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    134
);

-- Accommodation Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Best Luxury Resorts in Zanzibar',
    'best-luxury-resorts-in-zanzibar',
    'accommodation',
    'Discover Zanzibar''s most exclusive and luxurious resorts for an unforgettable stay.',
    'Zanzibar is home to some of Africa''s most spectacular luxury resorts. Here are the best options for those seeking the ultimate tropical getaway.

The Residence Zanzibar: This 66-villa resort on the southwest coast offers unparalleled privacy and luxury. Each villa has its own pool and direct beach access. The resort''s spa is considered one of the best on the island.

Zuri Zanzibar: Located on Kendwa Beach, Zuri offers contemporary African design with stunning ocean views. The infinity pool overlooking the Indian Ocean is Instagram-worthy.

Mnemba Island Lodge: For the ultimate private island experience, this exclusive lodge accommodates just 20 guests. Accessed by private boat, it''s perfect for honeymooners.

Baraza Resort: This ultra-luxurious resort near Bwejuu features Arabian-inspired architecture. Each villa has its own plunge pool and personal butler service.

What to Expect: All-inclusive packages, world-class dining, water sports, and exceptional service. Rates typically range from 500-1500 USD per night.',
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
        'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg'
    ],
    ARRAY['luxury', 'resort', 'hotel', 'accommodation', 'five star'],
    '[
        {"text": "The Residence Zanzibar", "url": "https://www.cenizaro.com/theresidence/zanzibar"},
        {"text": "Luxury Hotel Bookings", "url": "https://www.booking.com/zanzibar-luxury"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    267
),
(
    'Budget-Friendly Guesthouses in Stone Town',
    'budget-friendly-guesthouses-in-stone-town',
    'accommodation',
    'Comfortable and affordable accommodation options in the heart of Zanzibar''s historic capital.',
    'You don''t need to break the bank to enjoy Stone Town. Here are the best budget guesthouses.

Jambo Guest House: Located in a restored 19th-century house, this friendly guesthouse offers clean rooms with shared bathrooms. The rooftop terrace has stunning views. Rates from 30 USD per night.

Lost and Found Hostel: Perfect for backpackers and solo travelers. Dorm beds start at 12 USD. The communal area is great for meeting other travelers. Free walking tours included.

Dhow Palace Hotel: A mid-range option with character. Rooms feature traditional Zanzibari carved doors. The central courtyard is a peaceful oasis. From 60 USD per night.

St Monica''s Hostel: Run by nuns, this spotlessly clean hostel offers simple rooms at unbeatable prices. Very safe and quiet. From 25 USD per night.

What to Look For: Air conditioning or good fans (essential in Zanzibar''s heat), mosquito nets, hot water, and central location.

Booking Tips: Book directly to avoid commission fees. Many guesthouses offer discounts for longer stays.',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'
    ],
    ARRAY['budget', 'hostel', 'guesthouse', 'cheap', 'stone town', 'backpacker'],
    '[
        {"text": "Hostelworld Zanzibar", "url": "https://www.hostelworld.com/zanzibar"},
        {"text": "Budget Accommodation Guide", "url": "https://www.lonelyplanet.com/zanzibar/hotels"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    198
),
(
    'Beachfront Hotels in Nungwi: Where to Stay',
    'beachfront-hotels-in-nungwi-where-to-stay',
    'accommodation',
    'Find your perfect beachfront paradise in Nungwi, Zanzibar''s most popular beach destination.',
    'Nungwi, at Zanzibar''s northern tip, offers stunning beaches and a range of accommodation options.

Essque Zalu Zanzibar: This boutique resort combines luxury with sustainability. The suites are spacious and elegant. The infinity pool seems to merge with the ocean. From 300 USD per night.

DoubleTree by Hilton Nungwi: A reliable international brand with excellent facilities. Large rooms, multiple restaurants, and a beautiful beach. From 200 USD per night.

Z Hotel: A trendy, adults-only boutique hotel. Modern design, rooftop bar, and direct beach access. From 150 USD per night.

Smiles Beach Hotel: A mid-range option with great value. Clean rooms, friendly staff, and steps from the beach. From 80 USD per night.

Amaan Bungalows: Perfect for budget travelers who still want beachfront access. Simple but clean bungalows right on the sand. From 50 USD per night.

Beach Life: Nungwi''s beach faces west, offering spectacular sunsets. The area is lively with beach bars and restaurants.',
    'https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg',
        'https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg'
    ],
    ARRAY['nungwi', 'beach', 'hotel', 'resort', 'beachfront', 'accommodation'],
    '[
        {"text": "Nungwi Hotels Booking", "url": "https://www.booking.com/nungwi"},
        {"text": "Nungwi Village Guide", "url": "https://www.zanzibar.com/nungwi"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    223
),
(
    'Boutique Hotels with Character in Zanzibar',
    'boutique-hotels-with-character-in-zanzibar',
    'accommodation',
    'Discover unique boutique hotels that showcase Zanzibar''s rich culture and history.',
    'For travelers seeking authentic experiences, these boutique hotels offer something special.

Emerson Spice: Set in a beautifully restored building in Stone Town, this hotel oozes character. Rooftop dining with 360-degree views. Each room is individually decorated with antiques. From 200 USD per night.

Park Hyatt Zanzibar: Occupying two historic buildings, this hotel combines heritage with luxury. The Living Room restaurant serves exceptional cuisine. From 300 USD per night.

Zanzibar Coffee House: As the name suggests, this hotel celebrates the island''s coffee heritage. Atmospheric rooms and excellent breakfast. From 180 USD per night.

Pongwe Beach Hotel: A small, eco-friendly property on a secluded beach. Just 9 rooms ensure an intimate atmosphere. From 120 USD per night.

Chuini Zanzibar Beach Lodge: Surrounded by forest with its own private beach. Sustainable practices and local community involvement. From 250 USD per night.

What Makes Them Special: Personal service, unique design, and genuine connection to Zanzibar''s culture.',
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
    ],
    ARRAY['boutique', 'hotel', 'character', 'unique', 'authentic', 'heritage'],
    '[
        {"text": "Emerson Spice Hotel", "url": "https://www.emersonspice.com"},
        {"text": "Boutique Hotels Zanzibar", "url": "https://www.tablethotels.com/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    176
),
(
    'Family-Friendly Resorts in Zanzibar',
    'family-friendly-resorts-in-zanzibar',
    'accommodation',
    'The best resorts for families with children, offering activities and facilities for all ages.',
    'Planning a family holiday? These resorts cater specifically to families with children.

RIU Palace Zanzibar: All-inclusive resort with kids'' club, multiple pools, and family rooms. Entertainment program keeps children engaged. From 200 USD per person per night.

Gold Zanzibar Beach House & Spa: Spacious family suites, shallow lagoon perfect for children, and dedicated kids'' pool. From 180 USD per night.

Diamonds La Gemma Dell''Est: Large family rooms, kids'' club with professional staff, and calm beach. Italian-style all-inclusive. From 220 USD per night.

Zanzibar Bay Resort: Excellent value for families. Family rooms, kids'' pool, and plenty of activities. From 120 USD per night.

Bluebay Beach Resort: Multiple pools including kids'' pool, playground, and games room. Tennis courts and water sports. From 150 USD per night.

Family-Friendly Features: Look for resorts with kids'' clubs, family rooms or suites, shallow beaches, multiple dining options, and organized activities.

Best Beaches for Families: East coast beaches (Paje, Jambiani) have shallow lagoons at low tide, perfect for young children.',
    'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg',
        'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg'
    ],
    ARRAY['family', 'kids', 'children', 'resort', 'family-friendly', 'activities'],
    '[
        {"text": "Family Resorts Booking", "url": "https://www.booking.com/zanzibar-family"},
        {"text": "Zanzibar Family Guide", "url": "https://www.familytravelguide.com/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    211
);

-- Food & Dining Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Best Restaurants in Stone Town',
    'best-restaurants-in-stone-town',
    'food',
    'From rooftop dining to street food, discover Stone Town''s most delicious dining experiences.',
    'Stone Town''s culinary scene is as diverse as its history. Here are the must-visit restaurants.

Emerson Spice Tea House Restaurant: Perched on a rooftop with panoramic views, this is Stone Town''s most romantic dining spot. The set menu features Swahili fusion cuisine. Reservations essential. Main courses from 25 USD.

The Rock Restaurant: Although technically not in Stone Town (it''s in Michanvi Pingwe), this iconic restaurant sits on a rock in the ocean. Fresh seafood and stunning views. Accessible only at low tide. From 30 USD per person.

Forodhani Gardens Night Market: For authentic local food at budget prices, head here at sunset. Try Zanzibar pizza, grilled seafood, and sugar cane juice. Meals from 5 USD.

6 Degrees South: Gourmet pizzas and pasta in a charming garden setting. Great wine selection. From 15 USD for mains.

Lukmaan Restaurant: A local favorite serving enormous portions of Swahili food. Always busy with locals. Incredibly cheap at 5-8 USD for a full meal.

Archipelago Restaurant: Elegant dining with fresh seafood. The prawn curry is legendary. From 20 USD.',
    'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
    ],
    ARRAY['restaurant', 'food', 'dining', 'stone town', 'cuisine', 'swahili food'],
    '[
        {"text": "Restaurant Reservations", "url": "https://www.tripadvisor.com/zanzibar-restaurants"},
        {"text": "Zanzibar Food Guide", "url": "https://www.zanzibar.com/food"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    289
),
(
    'Zanzibar Street Food Guide',
    'zanzibar-street-food-guide',
    'food',
    'Sample authentic local flavors with this guide to Zanzibar''s best street food.',
    'Zanzibar''s street food scene offers delicious, authentic flavors at pocket-friendly prices.

Zanzibar Pizza: Not like Italian pizza! This street food specialty is more like a stuffed crepe. Filled with meat, cheese, vegetables, or Nutella for dessert. Find it at Forodhani Gardens. Cost: 2-3 USD.

Urojo (Zanzibar Mix): A tangy soup with potatoes, cassava, bhajias, and a boiled egg. Perfect for lunch. Available from street vendors around Stone Town. Cost: 1-2 USD.

Mishkaki: Grilled meat skewers marinated in spices. Usually beef or chicken. Found at evening street markets. Cost: 0.50-1 USD per skewer.

Mandazi: Sweet, slightly spiced fried dough. Perfect breakfast with chai. Available from street vendors in the morning. Cost: 0.25 USD each.

Vitumbua: Coconut rice pancakes, crispy on the outside and soft inside. A breakfast favorite. Cost: 0.50 USD for a stack.

Safety Tips: Choose busy stalls with high turnover. Avoid ice in drinks. Bottled water only.',
    'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg'
    ],
    ARRAY['street food', 'local food', 'cheap eats', 'authentic', 'forodhani'],
    '[
        {"text": "Street Food Safety Tips", "url": "https://www.foodsafety.gov/travelers"},
        {"text": "Zanzibar Food Tours", "url": "https://www.getyourguide.com/zanzibar-food-tours"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    245
),
(
    'Spice Tour and Traditional Swahili Cooking',
    'spice-tour-and-traditional-swahili-cooking',
    'food',
    'Learn about Zanzibar''s spice heritage and discover traditional cooking methods.',
    'Zanzibar is known as the Spice Island for good reason. A spice tour is a must-do experience.

What is a Spice Tour? You''ll visit spice plantations to see, smell, and taste cloves, vanilla, cardamom, cinnamon, nutmeg, and black pepper growing. Guides explain uses and medicinal properties.

Where to Book: Tours are available from Stone Town, Nungwi, and most hotels. Choose smaller group tours for better interaction. Cost: 20-30 USD including lunch.

Cooking Classes: Several places offer Swahili cooking classes where you learn to make pilau rice, coconut curry, and samosas. Most classes include a spice farm visit.

Recommended Cooking Schools:
- Zanzibar Spice Farm Cooking Class (25 USD)
- Mamas Spice Kitchen in Stone Town (35 USD)
- Cooking with Ali in Jambiani (30 USD)

What You''ll Learn: Traditional cooking methods, spice blends, coconut preparation, and authentic recipes.

Take Home: Most tours let you buy fresh spices at good prices. Much cheaper than tourist shops.',
    'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg',
        'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg'
    ],
    ARRAY['spice tour', 'cooking class', 'traditional food', 'swahili', 'spices'],
    '[
        {"text": "Book Spice Tour", "url": "https://www.viator.com/zanzibar-spice-tour"},
        {"text": "Cooking Classes", "url": "https://www.cookly.me/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    187
),
(
    'Seafood in Zanzibar: Where to Find the Freshest Catch',
    'seafood-in-zanzibar-where-to-find-freshest-catch',
    'food',
    'From lobster to octopus, discover where to enjoy Zanzibar''s incredible seafood.',
    'Surrounded by the Indian Ocean, Zanzibar offers some of Africa''s best seafood.

Best Seafood Restaurants:
- The Rock Restaurant: Famous for lobster and prawns with ocean views
- Upendo Beach Bar (Paje): Beachfront dining with daily catches
- Fisherman''s Restaurant (Nungwi): Watch fishermen bring in the catch
- Zanzibar Pearl (Stone Town): Upscale seafood dining

Local Markets: Visit Darajani Market in Stone Town or Nungwi fish market early morning to see the catch. You can buy fresh fish and have it grilled at nearby restaurants for a small fee.

Must-Try Dishes:
- Octopus curry in coconut sauce
- Grilled red snapper with chips
- Calamari with chili and lime
- Lobster in garlic butter
- Prawns pili pili

Prices: Expect to pay 15-25 USD for seafood mains in restaurants. Street grilled fish costs 5-10 USD.

When to Visit: Seafood is freshest and cheapest during fishing season (October-March).

Sustainability: Choose restaurants that practice sustainable fishing.',
    'https://images.pexels.com/photos/1539034/pexels-photo-1539034.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1293120/pexels-photo-1293120.jpeg'
    ],
    ARRAY['seafood', 'fish', 'lobster', 'prawns', 'ocean', 'fresh catch'],
    '[
        {"text": "The Rock Restaurant", "url": "https://www.therockrestaurantzanzibar.com"},
        {"text": "Seafood Restaurants Guide", "url": "https://www.zanzibar.com/restaurants"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    219
),
(
    'Vegetarian and Vegan Dining in Zanzibar',
    'vegetarian-and-vegan-dining-in-zanzibar',
    'food',
    'Plant-based travelers rejoice! Find the best vegetarian and vegan options across Zanzibar.',
    'While Zanzibar''s cuisine is heavily meat and seafood-based, vegetarians and vegans have options.

Vegetarian-Friendly Restaurants:
- Mama''s Table (Jambiani): Veggie curries and smoothie bowls
- Zanzibar Coffee House: Excellent vegetarian breakfast options
- Forodhani Gardens: Try vegetable samosas and bhajias
- Old Fort Restaurant: Has dedicated vegan menu

Indian Restaurants: Perfect for vegetarians. Try:
- Maharaja Restaurant (Stone Town)
- Spice Island Hotel Restaurant
Most serve dal, vegetable curries, and paneer dishes.

Local Vegetarian Dishes:
- Wali wa nazi (coconut rice)
- Mchuzi wa kunde (black-eyed peas curry)
- Ndizi na nyama (plantain curry - ask for vegetable version)
- Fresh tropical fruits

Vegan Considerations: Many dishes use ghee or dairy. Always ask. Coconut is widely used as an alternative.

Shopping: Darajani Market has excellent fresh produce. Buy fruit for healthy snacks.

Communication: Learn key Swahili phrases: "Bila nyama" (no meat), "Bila samaki" (no fish).',
    'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
        'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg'
    ],
    ARRAY['vegetarian', 'vegan', 'plant-based', 'healthy', 'dining'],
    '[
        {"text": "Happy Cow Zanzibar", "url": "https://www.happycow.net/zanzibar"},
        {"text": "Vegan Travel Guide", "url": "https://www.vegantravel.com/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    163
);

-- Culture & History Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Stone Town: A Walking Tour of History',
    'stone-town-walking-tour-of-history',
    'culture',
    'Explore the UNESCO World Heritage Site with this comprehensive walking tour guide.',
    'Stone Town is a living museum of Swahili culture, Arab influence, and colonial history.

The Old Fort (Arab Fort): Built by Omanis in the 17th century, it''s now a cultural center. Free entry. Evening cultural shows most nights.

House of Wonders: The tallest building in Stone Town and former sultan''s palace. Contains national museum exhibits. Entry: 6 USD.

Old Slave Market: A sobering reminder of Zanzibar''s dark history. Now an Anglican cathedral. Free entry, donations welcomed.

Darajani Market: Experience local life in this bustling market. Spices, fresh produce, and seafood.

Forodhani Gardens: Waterfront park that transforms into a night food market after sunset.

Freddie Mercury House: Birthplace of the Queen frontman. Small museum inside. Entry: 10 USD.

Sultan''s Palace Museum: Learn about Zanzibar''s royal history. Beautiful furnishings and artifacts. Entry: 6 USD.

Best Time: Early morning (7-9 AM) or late afternoon (4-6 PM) to avoid midday heat.

Guided Tours: Available from 20-30 USD for 2-3 hours.',
    'https://images.pexels.com/photos/3889854/pexels-photo-3889854.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/3889727/pexels-photo-3889727.jpeg',
        'https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg'
    ],
    ARRAY['stone town', 'history', 'culture', 'unesco', 'walking tour', 'heritage'],
    '[
        {"text": "Stone Town Conservation", "url": "https://www.stonetwntrust.org"},
        {"text": "Guided Tours Booking", "url": "https://www.getyourguide.com/stone-town"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    312
),
(
    'Understanding Swahili Culture and Customs',
    'understanding-swahili-culture-and-customs',
    'culture',
    'Navigate Zanzibar with cultural sensitivity by understanding local customs and traditions.',
    'Zanzibar is predominantly Muslim, and understanding local customs will enrich your visit.

Dress Code: In Stone Town and villages, dress modestly. Cover shoulders and knees. Beach areas are more relaxed, but topless sunbathing is not acceptable.

Greetings: Always greet with "Jambo" (hello) or "Habari" (how are you). Handshakes are common between men. Women may prefer verbal greetings.

Ramadan: During the holy month, many restaurants close during daylight hours. Be respectful by not eating or drinking in public during fasting hours.

Photography: Always ask permission before photographing people, especially women. Offer to send them the photo if possible.

Mosque Etiquette: Non-Muslims generally cannot enter mosques. Dress very modestly if invited.

Right Hand: Use your right hand for eating, giving, and receiving. The left hand is considered unclean.

Haggling: Expected in markets but do it respectfully. Smile and be polite.

Alcohol: Available in tourist areas and hotels but not widely in Muslim neighborhoods.

Language: Learning basic Swahili phrases shows respect and opens doors.',
    'https://images.pexels.com/photos/4623107/pexels-photo-4623107.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg'
    ],
    ARRAY['culture', 'customs', 'swahili', 'etiquette', 'muslim', 'traditions'],
    '[
        {"text": "Swahili Language Basics", "url": "https://www.swahilipod101.com"},
        {"text": "Cultural Etiquette Guide", "url": "https://www.culturecrossing.net/tanzania"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    256
),
(
    'Traditional Taarab Music and Dance',
    'traditional-taarab-music-and-dance',
    'culture',
    'Discover Zanzibar''s unique musical heritage and where to experience live performances.',
    'Taarab music is the soul of Zanzibar, blending African, Arabic, and Indian influences.

What is Taarab? A musical form that emerged in the 19th century at the sultan''s court. Features orchestras with traditional instruments and poetic lyrics in Swahili.

Where to See Taarab:
- Culture Musical Club (Stone Town): Performances most weekends
- Dhow Countries Music Academy: Regular evening shows and classes
- Old Fort: Cultural shows several nights per week
- Hotel performances: Many upscale hotels host weekly Taarab nights

Famous Groups:
- Culture Musical Club
- Ikhwani Safaa Musical Club
- East African Melody

Traditional Dance: Ngoma is traditional drum-based dance. Watch for village celebrations and cultural events.

Learn to Dance: Some cultural centers offer short dance classes for tourists.

Best Time: Festivals like Sauti za Busara (February) showcase the best of Zanzibar music.

Recordings: Buy authentic Taarab CDs at shops in Stone Town to support local artists.',
    'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg'
    ],
    ARRAY['music', 'taarab', 'dance', 'culture', 'traditional', 'entertainment'],
    '[
        {"text": "Dhow Countries Music Academy", "url": "https://www.zanzibarmusic.org"},
        {"text": "Sauti za Busara Festival", "url": "https://www.busaramusic.org"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    178
),
(
    'Zanzibar Doors: Art and Architecture',
    'zanzibar-doors-art-and-architecture',
    'culture',
    'Explore the iconic carved wooden doors that tell stories of Zanzibar''s rich history.',
    'Zanzibar''s famous carved doors are more than decoration – they''re historical artifacts.

Door History: Elaborate carved doors date back to the 19th century. They displayed the owner''s wealth and status. Larger, more ornate doors meant greater prosperity.

Design Elements:
- Lotus flowers (from India)
- Date palm motifs (Arabic influence)
- Chains and ropes (African traditions)
- Frankincense holders
- Brass studs (originally to prevent elephant attacks)

Symbolic Meanings: Fish represent abundance, chains represent security, and palm trees represent growth and sustenance.

Best Examples:
- The Old Dispensary: Elaborate balconies and doors
- Tippu Tip''s House: Massive double doors
- Sultan''s Palace Museum: Royal door examples
- Throughout Stone Town streets

Door Tours: Specialized walking tours focus on doors and architecture. Book through cultural organizations.

Buying Replicas: Authentic-style doors are sold at Darajani Market and specialist shops. Prices from 200-2000 USD. Ensure proper export documentation.

Photography: Excellent subject for photography. Early morning light is best.',
    'https://images.pexels.com/photos/1406282/pexels-photo-1406282.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg'
    ],
    ARRAY['doors', 'architecture', 'art', 'stone town', 'heritage', 'carving'],
    '[
        {"text": "Architecture Tours", "url": "https://www.zanzibararchitecture.com"},
        {"text": "Stone Town Heritage", "url": "https://www.unesco.org/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    201
),
(
    'Zanzibar Festivals and Cultural Events',
    'zanzibar-festivals-and-cultural-events',
    'culture',
    'Plan your visit around these vibrant festivals celebrating Zanzibar''s culture and heritage.',
    'Zanzibar''s calendar is filled with colorful festivals celebrating music, culture, and tradition.

Sauti za Busara (February): East Africa''s premier music festival. Three days of live performances at the Old Fort. International and local artists. Tickets: 20-40 USD per day.

Zanzibar International Film Festival - ZIFF (July): Week-long celebration of film, music, and arts. Screenings, workshops, and dhow races. Many free events.

Eid al-Fitr (End of Ramadan): Huge celebration with special foods, new clothes, and family gatherings. Experience authentic local culture.

Mwaka Kogwa (July): Shirazi New Year celebrated in Makunduchi. Features ritual fighting with banana stalks, traditional dancing, and feasting.

Zanzibar Beach & Watersports Festival (August): Kite surfing, diving, and beach sports competitions at various beaches.

Stone Town Cultural Festival (December): Music, dance, traditional crafts, and food celebrating Swahili culture.

Planning Tips: Book accommodation well in advance during major festivals. Join cultural events respectfully. Many festivals are free or have minimal entry fees.',
    'https://images.pexels.com/photos/1387037/pexels-photo-1387037.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
        'https://images.pexels.com/photos/1167046/pexels-photo-1167046.jpeg'
    ],
    ARRAY['festival', 'events', 'culture', 'celebration', 'music', 'film'],
    '[
        {"text": "Festival Calendar", "url": "https://www.zanzibar.com/events"},
        {"text": "Sauti za Busara", "url": "https://www.busaramusic.org"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    234
);

-- Activities Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Best Diving Spots in Zanzibar',
    'best-diving-spots-in-zanzibar',
    'activities',
    'Explore underwater paradise with this guide to Zanzibar''s top diving locations.',
    'Zanzibar''s coral reefs and marine life make it a world-class diving destination.

Mnemba Atoll: Zanzibar''s premier dive site. Crystal-clear waters, abundant marine life including dolphins, turtles, and reef sharks. Suitable for all levels. Cost: 80-120 USD for 2 dives.

Leven Bank: Advanced dive site with strong currents. Spectacular wall dive with large pelagics. Whale sharks sometimes spotted. For experienced divers only.

Hunga Reef: Excellent for beginners. Shallow reef teeming with colorful fish. Great visibility. Cost: 60-80 USD for 2 dives.

Kendwa Reef: Easy access from the beach. Good for both diving and snorkeling. Turtles commonly seen.

Tumbatu Island: Less crowded alternative to Mnemba. Beautiful coral gardens and caverns.

When to Dive: October-March offers best visibility (30m+). Water temperature 25-28°C year-round.

Certification: PADI Open Water courses available from 350-400 USD. Discover Scuba for beginners: 80-100 USD.

Best Dive Centers: One Ocean, Spanish Dancer, East Africa Diving.',
    'https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/2404370/pexels-photo-2404370.jpeg',
        'https://images.pexels.com/photos/1145434/pexels-photo-1145434.jpeg'
    ],
    ARRAY['diving', 'scuba', 'underwater', 'mnemba', 'marine life', 'reef'],
    '[
        {"text": "One Ocean Dive Center", "url": "https://www.zanzibaroneocean.com"},
        {"text": "PADI Certification", "url": "https://www.padi.com"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    298
),
(
    'Kitesurfing in Zanzibar: Complete Guide',
    'kitesurfing-in-zanzibar-complete-guide',
    'activities',
    'Discover why Zanzibar is one of the world''s top kitesurfing destinations.',
    'Zanzibar''s consistent trade winds and shallow lagoons create perfect kitesurfing conditions.

Best Spots:
- Paje: The kitesurfing capital. Shallow lagoon, steady winds, and numerous schools. Wind season: June-March.
- Jambiani: Less crowded, similar conditions to Paje
- Matemwe: Good for advanced riders, offshore winds
- Dongwe: Quiet spot with reliable conditions

Wind Conditions: Kusi (June-September) brings strong winds 20-25 knots. Kaskazi (December-March) offers lighter winds 15-20 knots.

Kitesurfing Schools:
- Zanzibar Kite Paradise (Paje)
- Airborne Kitesurf Center (Paje)
- Pajelagoon Kite School (Paje)

Learning: Complete beginner course (3-4 days): 300-400 USD. Shorter courses available.

Equipment Rental: 50-60 USD per day. Many accommodations offer packages with equipment included.

Accommodation: Paje has dedicated kite camps and hostels. Budget options from 25 USD per night.

Safety: Lagoon is shallow and sandy, making it safe for beginners. Respect local swimmers and fishermen.',
    'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1608037/pexels-photo-1608037.jpeg'
    ],
    ARRAY['kitesurfing', 'kite', 'watersports', 'paje', 'wind', 'adventure'],
    '[
        {"text": "Kitesurfing Schools Paje", "url": "https://www.zanzibarmagic.com/kitesurfing"},
        {"text": "Wind Forecast", "url": "https://www.windguru.cz/zanzibar"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    267
),
(
    'Dolphin Tours in Zanzibar: What to Expect',
    'dolphin-tours-in-zanzibar-what-to-expect',
    'activities',
    'Experience swimming with wild dolphins in Kizimkazi with this responsible tourism guide.',
    'Kizimkazi, on Zanzibar''s southern coast, is famous for dolphin encounters.

The Experience: Early morning boat trips to spot spinner and bottlenose dolphins. When dolphins appear, you can swim/snorkel nearby.

Best Time: 6-9 AM when dolphins are most active. Tours operate year-round. Avoid midday heat.

What to Expect: Dolphins are wild, so sightings aren''t guaranteed. Success rate is about 80%. Tours last 2-3 hours.

Cost: 35-50 USD per person including boat, guide, and snorkel equipment. Hotel pickup extra 10-15 USD.

Responsible Tourism: Choose operators who:
- Keep respectful distance from dolphins
- Don''t chase or surround them
- Limit number of boats
- Brief tourists on responsible behavior

Ethical Concerns: Some operators are too aggressive. Avoid tours that guarantee swimming WITH dolphins (stresses animals).

Alternatives: Mnemba Island often has dolphin sightings during regular snorkel/dive trips with less pressure on the animals.

After the Tour: Visit Kizimkazi''s ancient mosque (12th century) while in the area.',
    'https://images.pexels.com/photos/2100941/pexels-photo-2100941.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/64219/dolphin-marine-mammals-water-sea-64219.jpeg'
    ],
    ARRAY['dolphins', 'swimming', 'kizimkazi', 'wildlife', 'snorkeling', 'tours'],
    '[
        {"text": "Responsible Dolphin Tours", "url": "https://www.responsibletravel.com/zanzibar-dolphins"},
        {"text": "Book Dolphin Tour", "url": "https://www.viator.com/zanzibar-dolphins"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    223
),
(
    'Jozani Forest: Home of the Red Colobus Monkey',
    'jozani-forest-home-of-red-colobus-monkey',
    'activities',
    'Visit Zanzibar''s only national park and see the endemic red colobus monkeys.',
    'Jozani Chwaka Bay National Park protects Zanzibar''s largest area of mature forest.

The Monkeys: Zanzibar red colobus monkeys are endemic – found nowhere else on Earth. Population about 6,000. They''re habituated to humans and easy to photograph.

The Park: Covers 50 square kilometers of forest, mangroves, and coastal swamps. Well-maintained boardwalk trails.

What to See:
- Red colobus monkeys (almost guaranteed sighting)
- Sykes monkeys
- Bush babies (night walks)
- Various bird species
- Giant trees and medicinal plants

Guided Tours: Included with entry fee. Guides are knowledgeable about flora and fauna. Tours last 1-2 hours.

Entry Fee: 10 USD for adults, 5 USD for children.

Best Time: Morning (8-10 AM) or late afternoon (4-5 PM) when monkeys are most active.

Location: About 35 km southeast of Stone Town. Easy day trip.

Getting There: Dala-dala (cheap but slow), taxi (30-40 USD return with waiting), or organized tour (40-60 USD including transport).

Photography: Excellent opportunities. Monkeys come very close to the boardwalk.',
    'https://images.pexels.com/photos/4577793/pexels-photo-4577793.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/50577/tree-nature-wood-sunset-50577.jpeg',
        'https://images.pexels.com/photos/572861/pexels-photo-572861.jpeg'
    ],
    ARRAY['jozani', 'forest', 'monkeys', 'wildlife', 'nature', 'national park'],
    '[
        {"text": "Jozani Forest Tours", "url": "https://www.zanzibar.com/jozani"},
        {"text": "Wildlife Conservation", "url": "https://www.zanzibarwildlife.org"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    245
),
(
    'Sunset Dhow Cruises: A Magical Experience',
    'sunset-dhow-cruises-magical-experience',
    'activities',
    'Sail into the sunset on a traditional dhow boat for an unforgettable Zanzibar evening.',
    'A sunset dhow cruise is one of Zanzibar''s most romantic and popular activities.

What is a Dhow? Traditional wooden sailing vessel used for centuries in the Indian Ocean. Modern tourist dhows are comfortable with cushioned seating.

The Experience: Board in late afternoon, sail along the coast as the sun sets. Most cruises include:
- Fresh seafood snacks or dinner
- Soft drinks and local beer
- Live music or recorded taarab
- Swimming stop (some tours)

Popular Departure Points:
- Stone Town waterfront
- Nungwi Beach
- Kendwa Beach
- Michanvi Pingwe

Duration: 2-3 hours, usually 4-7 PM.

Cost: 40-60 USD per person for shared cruise. Private dhow charter: 200-400 USD (fits 8-12 people).

Best for: Couples, honeymooners, photographers, anyone wanting a peaceful evening.

What to Bring: Light jacket (can be breezy), camera, sunscreen, hat.

Booking: Book through hotels or tour operators. Advance booking recommended in peak season.

Special Occasions: Many operators offer private charters for proposals, anniversaries, and celebrations.',
    'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/2291004/pexels-photo-2291004.jpeg'
    ],
    ARRAY['dhow', 'sunset', 'cruise', 'sailing', 'romantic', 'boat trip'],
    '[
        {"text": "Book Dhow Cruise", "url": "https://www.getyourguide.com/zanzibar-dhow-cruise"},
        {"text": "Private Dhow Charter", "url": "https://www.viator.com/zanzibar-private-dhow"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    281
);

-- Beaches Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Best Beaches in Zanzibar: Complete Guide',
    'best-beaches-in-zanzibar-complete-guide',
    'beaches',
    'From powder-white sands to turquoise waters, discover Zanzibar''s most stunning beaches.',
    'Zanzibar is blessed with some of the world''s most beautiful beaches. Here''s your complete guide.

Nungwi Beach: Located at the northern tip, Nungwi offers year-round swimming as tides barely affect it. Perfect sunsets, lively beach bars, and excellent restaurants. Best for: Nightlife and social atmosphere.

Kendwa Beach: Just south of Nungwi, slightly quieter with equally stunning sunsets. Popular with backpackers and couples. Famous for full moon parties. Best for: Romantic getaways.

Paje Beach: East coast paradise and kitesurfing capital. Dramatic tides create stunning lagoons. Great budget accommodation. Best for: Kitesurfers and budget travelers.

Jambiani Beach: Long stretch of white sand with authentic village life nearby. Perfect for long walks and stargazing. Less developed than other beaches. Best for: Peaceful relaxation.

Matemwe Beach: Quieter alternative with luxury resorts and local guesthouses. Excellent snorkeling offshore. Traditional fishing village atmosphere. Best for: Tranquility and snorkeling.

Michanvi Pingwe: Home to The Rock Restaurant. Dramatic tides and beautiful scenery. Less crowded. Best for: Instagram photos.',
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
        'https://images.pexels.com/photos/1007421/pexels-photo-1007421.jpeg'
    ],
    ARRAY['beaches', 'nungwi', 'paje', 'sand', 'swimming', 'paradise'],
    '[
        {"text": "Beach Hotels Booking", "url": "https://www.booking.com/zanzibar-beaches"},
        {"text": "Beach Activities", "url": "https://www.zanzibar.com/beaches"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    356
),
(
    'Understanding Zanzibar''s Tides: When to Swim',
    'understanding-zanzibar-tides-when-to-swim',
    'beaches',
    'Learn about Zanzibar''s dramatic tides and how they affect your beach experience.',
    'Zanzibar''s east coast experiences some of the world''s most dramatic tides. Here''s what you need to know.

The Tides: East coast beaches (Paje, Jambiani, Matemwe) have huge tidal variations. At low tide, water can recede over 1 kilometer, exposing shallow lagoons and coral.

High Tide: Best for swimming. Water is deep enough at the beach. Ideal times vary daily. Check tide tables.

Low Tide: Amazing for walking, exploring rock pools, and spotting marine life. Locals harvest seaweed. Water is too shallow for swimming near shore.

West Coast: Nungwi and Kendwa are barely affected by tides. You can swim anytime. That''s why they''re more expensive.

Planning Your Day: Check tide times. High tide twice daily. Schedule activities accordingly.

Advantages of Tides:
- Beautiful lagoon formations
- Marine life spotting
- Unique photo opportunities
- Traditional fishing experiences

Safety: Never swim during strong tides. Watch children carefully. Coral can be sharp.',
    'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/416676/pexels-photo-416676.jpeg'
    ],
    ARRAY['tides', 'beach', 'swimming', 'safety', 'planning'],
    '[
        {"text": "Tide Tables Zanzibar", "url": "https://www.tide-forecast.com/zanzibar"},
        {"text": "Beach Safety Guide", "url": "https://www.zanzibar.com/beach-safety"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    189
),
(
    'Beach Activities: Beyond Sunbathing',
    'beach-activities-beyond-sunbathing',
    'beaches',
    'Discover exciting water sports and beach activities available across Zanzibar.',
    'Zanzibar''s beaches offer more than just relaxation. Here are activities to try.

Snorkeling: Nearly every beach has excellent snorkeling. Equipment rental: 5-10 USD. Best spots: Nungwi, Matemwe, Mnemba.

Stand-Up Paddleboarding (SUP): Calm waters perfect for SUP. Rental: 10-15 USD per hour. Available at most beach hotels.

Kayaking: Explore coastline by kayak. Single: 10 USD/hour. Double: 15 USD/hour. Sunset kayaking tours available.

Beach Volleyball: Many beaches have nets. Join local games or organize your own.

Traditional Fishing: Experience local life with fishermen. Early morning trips: 20-30 USD. Catch can be cooked for you.

Seaweed Farming Tours: Learn about this important local industry. Tours available in Paje and Jambiani. Around 15 USD.

Beach Games: Frisbee, football, beach cricket – locals love to play and often welcome tourists.

Sunset Viewing: Simply relaxing and watching spectacular Indian Ocean sunsets. Free and priceless.

Beach Massage: Local masseuses offer treatments on the beach. 10-20 USD for 30 minutes.',
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg'
    ],
    ARRAY['activities', 'beach', 'watersports', 'snorkeling', 'kayaking', 'fun'],
    '[
        {"text": "Water Sports Booking", "url": "https://www.zanzibar.com/watersports"},
        {"text": "Beach Activities", "url": "https://www.getyourguide.com/zanzibar-beach"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    203
),
(
    'Beach Safety in Zanzibar',
    'beach-safety-in-zanzibar',
    'beaches',
    'Stay safe while enjoying Zanzibar''s beaches with these essential safety tips.',
    'Enjoy Zanzibar''s beaches safely with these important guidelines.

Sun Protection: Equatorial sun is intense. Use SPF 50+. Reapply after swimming. Wear rash guards for extended water time. Seek shade 11 AM-3 PM.

Swimming Safety: Strong currents can occur. Swim parallel to shore if caught. Many beaches don''t have lifeguards. Never swim alone.

Tides: Know tide times on east coast. Don''t swim at low tide – too shallow with coral. At high tide, watch for currents.

Marine Life: Sea urchins are common. Wear water shoes. If stung, vinegar helps. Seek medical attention for severe reactions.

Jellyfish: Rare but present. Usually harmless. Rinse with seawater (not fresh water) if stung.

Coral Protection: Don''t touch or stand on coral. It''s living and sharp. Protects shoreline. Use reef-safe sunscreen.

Valuables: Don''t leave belongings unattended. Most hotels have safes. Take only essentials to the beach.

Vendors: Beach sellers are common. Polite "no thank you" usually works. Never give money upfront for promises.

Alcohol: Drink responsibly. Dehydration happens quickly. One beer in the sun equals two indoors.',
    'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg'
    ],
    ARRAY['safety', 'beach', 'swimming', 'sun protection', 'tips'],
    '[
        {"text": "Beach Safety Guidelines", "url": "https://www.redcross.org/beach-safety"},
        {"text": "Sun Safety Tips", "url": "https://www.who.int/uv/sun_protection"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    176
),
(
    'Secret Beaches and Hidden Gems',
    'secret-beaches-and-hidden-gems',
    'beaches',
    'Escape the crowds at these lesser-known beautiful beaches around Zanzibar.',
    'Discover Zanzibar''s quieter, less touristy beaches for a more authentic experience.

Bububu Beach: Just 10 km north of Stone Town. Locals'' favorite for weekends. Almost no tourists. Authentic fish market. Very affordable local restaurants.

Kizimkazi Beach: Southern tip of the island. Peaceful fishing village. Famous for dolphins but the beach itself is beautiful. Few tourists stay overnight.

Fumba Peninsula: Southwest coast with mangroves and quiet beaches. Perfect for nature lovers. Great for kayaking through mangroves.

Chwaka Beach: East coast village with wide beach. Very authentic, few tourists. Excellent seafood restaurants. Close to Jozani Forest.

Dongwe Beach: Between Paje and Bwejuu. Quieter than its neighbors. Mix of budget and mid-range accommodation. Great for kite surfing beginners.

Michamvi Kae: Small fishing village with pristine beach. Home to The Rock Restaurant. Very few hotels. Authentic village life.

Getting There: Rent a scooter or hire a taxi for the day. Most places don''t have public transport.

What to Bring: These beaches have limited facilities. Bring water, snacks, and sun protection.',
    'https://images.pexels.com/photos/221432/pexels-photo-221432.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg'
    ],
    ARRAY['secret', 'hidden', 'beach', 'quiet', 'authentic', 'local'],
    '[
        {"text": "Off the Beaten Path Guide", "url": "https://www.lonelyplanet.com/zanzibar/off-beaten-path"},
        {"text": "Local Beaches Map", "url": "https://www.zanzibar.com/secret-beaches"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    168
);

-- Tips Category (5 posts)
INSERT INTO blog_posts (title, slug, category, excerpt, content, featured_image, images, tags, useful_links, status, created_by, view_count) VALUES
(
    'Money Matters: Currency and Payments in Zanzibar',
    'money-matters-currency-and-payments-zanzibar',
    'tips',
    'Everything you need to know about money, currency exchange, and payments in Zanzibar.',
    'Handle your money smartly in Zanzibar with these essential tips.

Currency: Tanzanian Shilling (TZS). US Dollars widely accepted. Exchange rate approximately 2,300 TZS = 1 USD (fluctuates).

US Dollars: Newer bills (2006+) get better rates. Some places only accept recent bills. Keep small denominations (1, 5, 10, 20 USD).

Where to Exchange: Banks offer best rates. Bureaux de change second best. Avoid street exchangers. Hotels have worst rates.

ATMs: Available in Stone Town, Nungwi, and larger towns. Withdrawal limits 400,000-600,000 TZS. International transaction fees apply. Not always reliable – carry backup cash.

Credit Cards: Accepted at upscale hotels and restaurants. Visa more common than Mastercard. 3-5% surcharge common.

Tipping: Not mandatory but appreciated. Guides: 10 USD per day. Restaurants: 10%. Taxis: Round up. Hotel staff: 5-10 USD for excellent service.

Budgeting:
- Budget: 30-50 USD per day
- Mid-range: 100-150 USD per day
- Luxury: 300+ USD per day

Cash is King: Many places cash-only. Always carry enough shillings for daily expenses.',
    'https://images.pexels.com/photos/259132/pexels-photo-259132.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg'
    ],
    ARRAY['money', 'currency', 'payment', 'tips', 'budget', 'exchange'],
    '[
        {"text": "Currency Converter", "url": "https://www.xe.com"},
        {"text": "ATM Locator", "url": "https://www.mastercard.com/atm-locator"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    312
),
(
    'Best Time to Visit Zanzibar',
    'best-time-to-visit-zanzibar',
    'tips',
    'Plan your perfect Zanzibar trip by choosing the right season for your interests.',
    'Zanzibar is a year-round destination, but timing can enhance your experience.

High Season (June-October, December-February): Dry, sunny weather. Perfect beach conditions. Best for diving and snorkeling. Most expensive. Book accommodation early. July-August busiest.

Shoulder Season (March-May, November): Lower prices, fewer tourists. Some rain but usually afternoon showers. Still warm and pleasant. Great value. Occasional seaweed issues on east coast beaches.

Low Season (April-May): Heaviest rains. Many resorts offer huge discounts. Still possible to have sunny days. Fewer tourists. Some restaurants and tours may have reduced hours.

Kite Surfing Season: June-March. Best winds June-September.

Diving: Best visibility October-March.

Festivals: Sauti za Busara (February), ZIFF Film Festival (July), Mwaka Kogwa (July).

Temperature: Consistently 25-30°C year-round. Water temperature 25-28°C.

Humidity: High year-round. Most noticeable March-May.

Best Overall: June-October for guaranteed sunshine. November-December for fewer crowds and good weather.',
    'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg'
    ],
    ARRAY['planning', 'weather', 'season', 'timing', 'when to visit'],
    '[
        {"text": "Weather Forecast", "url": "https://www.weather.com/zanzibar"},
        {"text": "Travel Seasons Guide", "url": "https://www.lonelyplanet.com/zanzibar/when-to-go"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    389
),
(
    'Packing List for Zanzibar',
    'packing-list-for-zanzibar',
    'tips',
    'Don''t forget these essential items for your Zanzibar adventure.',
    'Pack smart for your Zanzibar trip with this comprehensive list.

Essentials:
- Passport (valid 6+ months)
- Yellow fever certificate (if required)
- Travel insurance documents
- Copies of important documents
- Cash (USD and some TZS)
- Credit/debit cards

Clothing:
- Light, breathable clothes
- Modest clothing for Stone Town
- Swimwear
- Light long sleeves (sun/mosquito protection)
- Sarong or beach cover-up
- Comfortable walking shoes
- Flip-flops/sandals
- Light jacket for evenings

Sun Protection:
- High SPF sunscreen (50+)
- After-sun lotion
- Sunglasses
- Wide-brimmed hat
- Lip balm with SPF

Health Items:
- Prescription medications
- Anti-malarial medication
- Insect repellent (50% DEET)
- Basic first aid kit
- Antihistamines
- Anti-diarrheal medication
- Hand sanitizer

Electronics:
- Phone and charger
- Power adapter (UK-style plugs)
- Waterproof phone case
- Camera
- Portable power bank

Beach Items:
- Snorkel and mask (optional – rental available)
- Water shoes (for coral)
- Dry bag
- Beach towel (often provided by hotels)',
    'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/1009136/pexels-photo-1009136.jpeg'
    ],
    ARRAY['packing', 'essentials', 'what to bring', 'preparation', 'checklist'],
    '[
        {"text": "Travel Packing Tips", "url": "https://www.nomadicmatt.com/travel-tips/packing-tips"},
        {"text": "Beach Packing List", "url": "https://www.beaches.com/packing-list"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    267
),
(
    'Health and Safety in Zanzibar',
    'health-and-safety-in-zanzibar',
    'tips',
    'Stay healthy and safe during your Zanzibar visit with these important guidelines.',
    'Prepare for a healthy, safe Zanzibar trip with this comprehensive guide.

Before You Go:
- Consult travel clinic 6-8 weeks before
- Yellow fever vaccination (required from some countries)
- Hepatitis A and Typhoid recommended
- Consider malaria prophylaxis
- Get travel insurance with medical coverage

Malaria: Risk exists year-round. Take antimalarials. Use DEET repellent. Sleep under mosquito nets. Wear long sleeves at dawn/dusk.

Water Safety: Don''t drink tap water. Bottled water everywhere. Avoid ice in questionable establishments. Brush teeth with bottled water.

Food Safety: Eat at busy restaurants. Hot, freshly cooked food is safest. Wash/peel fruit. Avoid raw vegetables in cheap eateries.

Sun Safety: Use SPF 50+. Wear hats and sunglasses. Seek shade midday. Stay hydrated. Heat exhaustion is common.

Crime: Zanzibar is relatively safe. Petty theft in Stone Town. Don''t walk alone at night. Use hotel safes. Avoid displaying valuables.

Scams: Be wary of overly friendly strangers. Don''t give money for sob stories. Book tours through reputable companies. Agree prices before services.

Emergency Numbers: Police: 112. Ambulance: 114. Tourist Police: +255 24 223 0772.

Hospitals: Zanzibar Medical Group (Stone Town) for tourists. Aga Khan Hospital. Both have English-speaking doctors.',
    'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg'
    ],
    ARRAY['health', 'safety', 'medical', 'vaccinations', 'malaria', 'security'],
    '[
        {"text": "CDC Zanzibar Health", "url": "https://wwwnc.cdc.gov/travel/destinations/tanzania/zanzibar"},
        {"text": "Travel Insurance", "url": "https://www.worldnomads.com"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    298
),
(
    'WiFi and Staying Connected in Zanzibar',
    'wifi-and-staying-connected-in-zanzibar',
    'tips',
    'Everything you need to know about internet access and staying connected in Zanzibar.',
    'Stay connected during your Zanzibar trip with these connectivity tips.

Mobile Networks: Three main providers: Vodacom, Airtel, Tigo. SIM cards available at airport and shops. Bring unlocked phone.

Buying a SIM: Available at airport, Stone Town shops, and mobile operator stores. Passport required. Cost: 2,000-5,000 TZS. Top-up credit widely available.

Data Plans: Affordable. 10 GB costs around 10,000-15,000 TZS (5-7 USD). Valid 30 days. Good coverage in main towns and beaches.

Best Network: Vodacom has best coverage overall. Airtel good in tourist areas. Tigo cheapest but patchy coverage.

WiFi: Most hotels, restaurants, and cafes offer free WiFi. Quality varies. Often slow. Some resorts charge for WiFi.

Internet Cafes: Still exist in Stone Town. Useful for printing. Around 1,000 TZS per hour.

Calling Home: WhatsApp calling works well with data. Skype less reliable. International calls expensive.

Power Banks: Essential. Electricity can be unreliable. Bring portable charger.

Voltage: 230V, UK-style plugs. Bring adapter.

Best Practice: Buy local SIM for data. Use hotel WiFi for video calls. Download offline maps and guides before arriving.',
    'https://images.pexels.com/photos/887751/pexels-photo-887751.jpeg',
    ARRAY[
        'https://images.pexels.com/photos/792199/pexels-photo-792199.jpeg'
    ],
    ARRAY['wifi', 'internet', 'mobile', 'connectivity', 'sim card', 'phone'],
    '[
        {"text": "Mobile Coverage Map", "url": "https://www.vodacom.co.tz/coverage"},
        {"text": "International SIM Cards", "url": "https://www.knowroaming.com"}
    ]'::jsonb,
    'published',
    '43713557-786d-4a6d-a963-bbf1b2cac9df',
    234
);
