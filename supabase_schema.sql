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
  currency text default 'SAR',
  accommodation_type text,
  location text,
  distance_from_user numeric,
  time_category text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) - Optional but recommended
alter table trips enable row level security;
alter table days enable row level security;
alter table places enable row level security;

-- Create policies to allow public access (for now, until Auth is added)
create policy "Public trips access" on trips for all using (true);
create policy "Public days access" on days for all using (true);
create policy "Public places access" on places for all using (true);
