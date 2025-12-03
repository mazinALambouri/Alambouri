-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update trips table with new fields
ALTER TABLE trips ADD COLUMN IF NOT EXISTS trip_type TEXT DEFAULT 'road_trip';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'leisure';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_shared_with ON trips USING GIN(shared_with);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view their own trips" ON trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared trips" ON trips
    FOR SELECT USING (auth.uid() = ANY(shared_with));

CREATE POLICY "Users can view public trips" ON trips
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for days
CREATE POLICY "Users can view days of their trips" ON days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = days.trip_id 
            AND (trips.user_id = auth.uid() OR auth.uid() = ANY(trips.shared_with) OR trips.is_public = true)
        )
    );

CREATE POLICY "Users can manage days of their trips" ON days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = days.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- Create RLS policies for places
CREATE POLICY "Users can view places of their trips" ON places
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM days 
            JOIN trips ON trips.id = days.trip_id
            WHERE days.id = places.day_id 
            AND (trips.user_id = auth.uid() OR auth.uid() = ANY(trips.shared_with) OR trips.is_public = true)
        )
    );

CREATE POLICY "Users can manage places of their trips" ON places
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM days 
            JOIN trips ON trips.id = days.trip_id
            WHERE days.id = places.day_id 
            AND trips.user_id = auth.uid()
        )
    );

-- Create RLS policies for users
CREATE POLICY "Users can view all user profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create function to auto-create user profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- Assign existing Gulf trip to specific user
-- Run this AFTER the user has signed up
-- ============================================
UPDATE trips 
SET user_id = (SELECT id FROM auth.users WHERE email = 'alambourimazin@gmail.com'),
    trip_type = 'road_trip',
    purpose = 'leisure'
WHERE name = 'Gulf Road Trip Adventure'
  AND user_id IS NULL;
