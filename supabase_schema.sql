-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Trips Table
create table trips (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Days Table
create table days (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade,
  date timestamp with time zone not null,
  day_number integer not null
);

-- Create Places Table
create table places (
  id uuid default uuid_generate_v4() primary key,
  day_id uuid references days(id) on delete cascade,
  name text not null,
  type text not null,
  category text[] not null,
  description text,
  images text[],
  time_to_reach integer default 0,
  price numeric default 0,
  currency text default 'OMR',
  accommodation_type text,
  location text,
  distance_from_user numeric,
  time_category text,
  time text, -- Specific time for the place (HH:mm format, e.g., "09:00", "14:30")
  needs_approval boolean default false, -- Whether this place needs approval from all travelers
  approved_by text[] default '{}', -- List of traveler IDs who approved this place
  total_travelers integer default 6, -- Total number of travelers for approval tracking (6 people)
  created_at timestamp with time zone default now()
);

-- Create Recommendations Table
create table recommendations (
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

-- Enable Row Level Security (RLS) - Optional but recommended
alter table trips enable row level security;
alter table days enable row level security;
alter table places enable row level security;
alter table recommendations enable row level security;

-- Create policies to allow public access (for now, until Auth is added)
create policy "Public trips access" on trips for all using (true);
create policy "Public days access" on days for all using (true);
create policy "Public places access" on places for all using (true);
create policy "Public recommendations access" on recommendations for all using (true);
