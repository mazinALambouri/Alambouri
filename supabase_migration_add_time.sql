-- Migration: Add time, approval columns, and recommendations table
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- PART 1: Update places table
-- ============================================

-- Add the time column for storing specific time (HH:mm format)
ALTER TABLE places ADD COLUMN IF NOT EXISTS time text;

-- Add approval columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS needs_approval boolean DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS approved_by text[] DEFAULT '{}';
ALTER TABLE places ADD COLUMN IF NOT EXISTS total_travelers integer DEFAULT 6;

-- Update default currency to OMR
ALTER TABLE places ALTER COLUMN currency SET DEFAULT 'OMR';

-- ============================================
-- PART 2: Create recommendations table
-- ============================================

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null,
  category text[] not null,
  description text,
  images text[],
  time_to_reach integer default 0,
  price numeric default 0,
  currency text default 'OMR',
  location text,
  distance_from_user numeric,
  date_range text,
  featured boolean default false,
  time_category text,
  accommodation_type text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create public access policy for recommendations
CREATE POLICY IF NOT EXISTS "Public recommendations access" ON recommendations FOR ALL USING (true);

-- ============================================
-- PART 3: Verify changes
-- ============================================

-- Verify places columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
AND column_name IN ('time', 'needs_approval', 'approved_by', 'total_travelers', 'currency');

-- Verify recommendations table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recommendations';
