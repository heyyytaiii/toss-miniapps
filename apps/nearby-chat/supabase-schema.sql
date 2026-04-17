-- Supabase SQL Schema for nearby-chat
-- Run this in Supabase SQL Editor to set up the database

-- Enable PostGIS extension (for future distance-based queries)
create extension if not exists postgis;

-- Rooms table
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  geohash text not null unique,
  name text not null default '근처 채팅방',
  active_users int default 0,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  user_id text not null,
  nickname text not null,
  content text not null,
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Presence table (tracks active users)
create table if not exists presence (
  id uuid default gen_random_uuid() primary key,
  user_id text unique not null,
  room_id uuid references rooms(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  geohash text not null,
  last_active timestamptz default now()
);

-- Reports table
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id text not null,
  reported_user_id text not null,
  room_id uuid references rooms(id) on delete cascade not null,
  message_id uuid references messages(id) on delete cascade not null,
  reason text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_messages_room_id on messages(room_id);
create index if not exists idx_messages_created_at on messages(created_at);
create index if not exists idx_presence_room_id on presence(room_id);
create index if not exists idx_presence_last_active on presence(last_active);
create index if not exists idx_rooms_geohash on rooms(geohash);

-- Enable Realtime on messages table
alter publication supabase_realtime add table messages;

-- Row Level Security (RLS)
alter table rooms enable row level security;
alter table messages enable row level security;
alter table presence enable row level security;
alter table reports enable row level security;

-- Allow anonymous read/write for MVP (tighten in production)
create policy "Anyone can read rooms" on rooms for select using (true);
create policy "Anyone can insert rooms" on rooms for insert with check (true);

create policy "Anyone can read messages" on messages for select using (true);
create policy "Anyone can insert messages" on messages for insert with check (true);

create policy "Anyone can read presence" on presence for select using (true);
create policy "Anyone can upsert presence" on presence for insert with check (true);
create policy "Anyone can update presence" on presence for update using (true);

create policy "Anyone can insert reports" on reports for insert with check (true);
