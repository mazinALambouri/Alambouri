-- Seed data for recommendations table
-- All prices are in OMR (Omani Rial)

INSERT INTO recommendations (name, type, category, description, images, time_to_reach, price, currency, location, distance_from_user, date_range, featured, time_category, accommodation_type)
VALUES
-- QATAR - DOHA
('The Pearl-Qatar', 'attraction', '{"Shopping", "Attractions"}', 'Luxury artificial island with upscale shopping, dining, and waterfront living. Explore marina walkways, boutiques, and cafes with stunning views.', '{"https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&auto=format&fit=crop"}', 30, 0, 'OMR', 'Doha, Qatar', 5.2, 'Dec 16 - Dec 18', true, 'visit', NULL),

('Museum of Islamic Art', 'attraction', '{"Attractions", "Museums"}', 'Stunning architectural masterpiece by I.M. Pei housing one of the world''s finest Islamic art collections spanning 1,400 years.', '{"https://images.unsplash.com/photo-1566127444979-b3d2b654e1d7?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595435742656-5272d0bd9a21?w=800&auto=format&fit=crop"}', 25, 1.5, 'OMR', 'Doha, Qatar', 6.8, 'Dec 16 - Dec 18', false, 'visit', NULL),

('Souq Waqif', 'attraction', '{"Shopping", "Lifestyle"}', 'Traditional marketplace offering spices, textiles, handicrafts, and authentic Qatari cuisine. Experience the vibrant culture and haggle with friendly vendors.', '{"https://images.unsplash.com/photo-1567447350272-a11b9a50d7ec?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&auto=format&fit=crop"}', 20, 0, 'OMR', 'Doha, Qatar', 3.5, 'Dec 16 - Dec 18', false, 'visit', NULL),

('Katara Cultural Village', 'attraction', '{"Attractions", "Entertainment"}', 'Cultural hub featuring art galleries, theaters, restaurants, and beautiful Mediterranean-style architecture along the waterfront.', '{"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"}', 35, 0, 'OMR', 'Doha, Qatar', 8.0, 'Dec 16 - Dec 18', false, 'visit', NULL),

-- SAUDI ARABIA - AL-AHSA
('Al-Ahsa Oasis', 'attraction', '{"Attractions", "Activities"}', 'UNESCO World Heritage site and the world''s largest oasis. Explore date palm gardens, ancient irrigation systems, and traditional villages.', '{"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop"}', 45, 2, 'OMR', 'Al-Ahsa, Saudi Arabia', 12.0, 'Dec 18 - Dec 20', true, 'visit', NULL),

('Qasr Ibrahim (Ibrahim Palace)', 'attraction', '{"Attractions"}', 'Historic Ottoman fort and palace complex built in 1571. Features impressive domes, courtyards, and a fascinating military museum.', '{"https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1577717775347-cc90b798dca8?w=800&auto=format&fit=crop"}', 30, 1.5, 'OMR', 'Al-Ahsa, Saudi Arabia', 8.5, 'Dec 18 - Dec 20', false, 'visit', NULL),

-- KUWAIT - KUWAIT CITY
('Kuwait Towers', 'attraction', '{"Attractions"}', 'Iconic landmark featuring three slender towers. Visit the observation deck for panoramic city views and dine at the revolving restaurant.', '{"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"}', 25, 3.5, 'OMR', 'Kuwait City, Kuwait', 4.5, 'Dec 20 - Dec 21', true, 'visit', NULL),

('The Avenues Mall', 'shopping', '{"Shopping"}', 'One of the largest malls in the Middle East with over 800 stores, entertainment venues, and diverse dining options across themed districts.', '{"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop"}', 35, 0, 'OMR', 'Kuwait City, Kuwait', 7.2, 'Dec 20 - Dec 21', false, 'visit', NULL),

-- SAUDI ARABIA - RIYADH
('Masmak Fortress', 'attraction', '{"Attractions"}', 'Historic clay and mud-brick fort that played a pivotal role in Saudi Arabia''s history. Now a museum showcasing the country''s unification.', '{"https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1577717775347-cc90b798dca8?w=800&auto=format&fit=crop"}', 30, 1, 'OMR', 'Riyadh, Saudi Arabia', 8.0, 'Dec 23 - Dec 24', false, 'visit', NULL),

('Kingdom Centre Tower', 'attraction', '{"Attractions", "Shopping"}', 'Iconic 99-floor skyscraper with sky bridge observation deck offering breathtaking 360° views of Riyadh. Luxury shopping mall at base.', '{"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop"}', 40, 2.5, 'OMR', 'Riyadh, Saudi Arabia', 12.5, 'Dec 23 - Dec 24', true, 'visit', NULL),

('Diriyah Historic District', 'attraction', '{"Attractions"}', 'UNESCO World Heritage site and birthplace of the first Saudi state. Explore mud-brick architecture, museums, and traditional Najdi culture.', '{"https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop"}', 50, 1.5, 'OMR', 'Riyadh, Saudi Arabia', 18.0, 'Dec 23 - Dec 24', false, 'visit', NULL),

-- BREAKFAST OPTIONS
('Al Mourjan Restaurant', 'meal', '{"Restaurants"}', 'Traditional Qatari breakfast buffet with stunning sea views. Fresh Arabic pastries, mezze, and local specialties.', '{"https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&auto=format&fit=crop"}', 20, 8, 'OMR', 'Doha, Qatar', 4.0, NULL, false, 'breakfast', NULL),

('Shawarma House', 'meal', '{"Restaurants"}', 'Popular local spot for traditional Saudi breakfast. Foul, falafel, fresh bread, and mint tea.', '{"https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=800&auto=format&fit=crop"}', 15, 4, 'OMR', 'Al-Ahsa, Saudi Arabia', 2.5, NULL, false, 'breakfast', NULL),

-- LUNCH OPTIONS
('Damasca One Restaurant', 'meal', '{"Restaurants"}', 'Authentic Middle Eastern cuisine with fresh mezze, grilled meats, and traditional dishes. Perfect lunch spot.', '{"https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop"}', 25, 12, 'OMR', 'Doha, Qatar', 5.5, NULL, false, 'lunch', NULL),

('Freej Swaileh Restaurant', 'meal', '{"Restaurants"}', 'Traditional Kuwaiti cuisine in a heritage setting. Famous for machboos, harees, and fresh seafood.', '{"https://images.unsplash.com/photo-1562007908-17c67e878c88?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1596649183105-cfdd4f0d5b37?w=800&auto=format&fit=crop"}', 30, 6.5, 'OMR', 'Kuwait City, Kuwait', 6.0, NULL, false, 'lunch', NULL),

-- DINNER OPTIONS
('Parisa Souq Waqif', 'meal', '{"Restaurants"}', 'Upscale Persian restaurant in Souq Waqif. Elegant ambiance with traditional decor and delicious kebabs.', '{"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&auto=format&fit=crop"}', 20, 20, 'OMR', 'Doha, Qatar', 3.5, NULL, false, 'dinner', NULL),

('Najd Village Restaurant', 'meal', '{"Restaurants"}', 'Traditional Saudi dining experience with authentic Najdi cuisine. Floor seating and cultural atmosphere.', '{"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop"}', 25, 10, 'OMR', 'Riyadh, Saudi Arabia', 7.0, NULL, false, 'dinner', NULL),

-- HOTEL OPTIONS
('The St. Regis Doha', 'hotel', '{"Hotels"}', 'Luxury 5-star hotel with elegant rooms, world-class spa, and stunning views of West Bay.', '{"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop"}', 30, 120, 'OMR', 'Doha, Qatar', 8.0, NULL, true, 'hotel', '5-star Luxury Hotel'),

('Intercontinental Al Ahsa', 'hotel', '{"Hotels"}', 'Modern comfort in the heart of Al-Ahsa oasis. Pool, fitness center, and excellent breakfast buffet.', '{"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop"}', 20, 45, 'OMR', 'Al-Ahsa, Saudi Arabia', 4.5, NULL, false, 'hotel', '4-star Hotel'),

('Jumeirah Messilah Beach Hotel', 'hotel', '{"Hotels"}', 'Beachfront luxury resort with private beach, multiple pools, and extensive facilities for relaxation.', '{"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop"}', 35, 80, 'OMR', 'Kuwait City, Kuwait', 12.0, NULL, false, 'hotel', '5-star Beach Resort'),

-- PRAYER LOCATIONS
('Imam Muhammad ibn Abd al-Wahhab Mosque', 'prayer', '{"Prayer"}', 'Qatar''s national mosque with stunning architecture. Peaceful prayer halls and beautiful courtyard.', '{"https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop"}', 25, 0, 'OMR', 'Doha, Qatar', 5.0, NULL, false, 'prayer', NULL),

('Grand Mosque Kuwait', 'prayer', '{"Prayer"}', 'Kuwait''s largest and official mosque. Beautiful Islamic architecture with intricate decorations.', '{"https://images.unsplash.com/photo-1590075865807-8b5e6c9dec10?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1584655448923-e27e64b44149?w=800&auto=format&fit=crop"}', 20, 0, 'OMR', 'Kuwait City, Kuwait', 4.0, NULL, false, 'prayer', NULL);
