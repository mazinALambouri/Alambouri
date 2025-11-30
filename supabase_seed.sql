-- Insert the Trip
WITH new_trip AS (
  INSERT INTO trips (name, location, start_date, end_date)
  VALUES (
    'Gulf Road Trip Adventure',
    'Oman, Qatar, Saudi Arabia, Kuwait',
    NOW(), -- Starts today
    NOW() + INTERVAL '10 days'
  )
  RETURNING id
),
-- Insert Days
days_insert AS (
  INSERT INTO days (trip_id, day_number, date)
  SELECT 
    id, 
    day_num, 
    NOW() + (day_num - 1 || ' days')::interval
  FROM new_trip
  CROSS JOIN generate_series(1, 10) AS day_num
  RETURNING id, day_number, trip_id
)
-- Insert Places
INSERT INTO places (
  day_id, 
  name, 
  type, 
  category, 
  description, 
  images, 
  time_to_reach, 
  price, 
  currency, 
  location, 
  distance_from_user, 
  time_category
)
SELECT 
  d.id,
  p.name,
  p.type,
  p.category,
  p.description,
  p.images,
  p.time_to_reach,
  p.price,
  p.currency,
  p.location,
  p.distance_from_user,
  p.time_category
FROM days_insert d
CROSS JOIN (
  VALUES 
    -- Day 2: Doha
    (2, 'The Pearl-Qatar', 'attraction', ARRAY['Shopping', 'Attractions'], 'Luxury artificial island with upscale shopping, dining, and waterfront living.', ARRAY['https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&auto=format&fit=crop'], 30, 0, 'QAR', 'Doha, Qatar', 5.2, 'visit'),
    (2, 'Museum of Islamic Art', 'attraction', ARRAY['Attractions', 'Museums'], 'Stunning architectural masterpiece housing one of the worlds finest Islamic art collections.', ARRAY['https://images.unsplash.com/photo-1566127444979-b3d2b654e1d7?w=800&auto=format&fit=crop'], 25, 15, 'QAR', 'Doha, Qatar', 6.8, 'visit'),
    
    -- Day 3: Doha
    (3, 'Souq Waqif', 'attraction', ARRAY['Shopping', 'Lifestyle'], 'Traditional marketplace offering spices, textiles, handicrafts, and authentic Qatari cuisine.', ARRAY['https://images.unsplash.com/photo-1567447350272-a11b9a50d7ec?w=800&auto=format&fit=crop'], 20, 0, 'QAR', 'Doha, Qatar', 3.5, 'visit'),
    (3, 'Katara Cultural Village', 'attraction', ARRAY['Attractions', 'Entertainment'], 'Cultural hub featuring art galleries, theaters, restaurants, and beautiful architecture.', ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop'], 35, 0, 'QAR', 'Doha, Qatar', 8.0, 'visit'),

    -- Day 4: Al-Ahsa
    (4, 'Al-Ahsa Oasis', 'attraction', ARRAY['Attractions', 'Activities'], 'UNESCO World Heritage site and the worlds largest oasis.', ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop'], 45, 20, 'SAR', 'Al-Ahsa, Saudi Arabia', 12.0, 'visit'),

    -- Day 5: Al-Ahsa
    (5, 'Qasr Ibrahim', 'attraction', ARRAY['Attractions'], 'Historic Ottoman fort and palace complex built in 1571.', ARRAY['https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop'], 30, 15, 'SAR', 'Al-Ahsa, Saudi Arabia', 8.5, 'visit'),

    -- Day 7: Kuwait
    (7, 'Kuwait Towers', 'attraction', ARRAY['Attractions'], 'Iconic landmark featuring three slender towers with observation deck.', ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop'], 25, 8, 'KWD', 'Kuwait City, Kuwait', 4.5, 'visit'),
    (7, 'The Avenues Mall', 'shopping', ARRAY['Shopping'], 'One of the largest malls in the Middle East.', ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop'], 35, 0, 'KWD', 'Kuwait City, Kuwait', 7.2, 'visit'),

    -- Day 9: Hail
    (9, 'Jubbah Rock Art', 'attraction', ARRAY['Attractions'], 'UNESCO World Heritage site featuring ancient rock carvings.', ARRAY['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop'], 90, 10, 'SAR', 'Hail, Saudi Arabia', 65.0, 'visit'),
    (9, 'Qishlah Palace', 'attraction', ARRAY['Attractions'], 'Historic mud-brick palace in the heart of Hail.', ARRAY['https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop'], 20, 5, 'SAR', 'Hail, Saudi Arabia', 3.8, 'visit'),

    -- Day 10: Riyadh
    (10, 'Masmak Fortress', 'attraction', ARRAY['Attractions'], 'Historic clay and mud-brick fort.', ARRAY['https://images.unsplash.com/photo-1591611892737-a2b0c680f128?w=800&auto=format&fit=crop'], 30, 10, 'SAR', 'Riyadh, Saudi Arabia', 8.0, 'visit'),
    (10, 'Kingdom Centre Tower', 'attraction', ARRAY['Attractions', 'Shopping'], 'Iconic skyscraper with sky bridge.', ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop'], 40, 25, 'SAR', 'Riyadh, Saudi Arabia', 12.5, 'visit')

) AS p(day_num, name, type, category, description, images, time_to_reach, price, currency, location, distance_from_user, time_category)
WHERE d.day_number = p.day_num;
