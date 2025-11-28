-- ==============================================================================
-- Hamwol Database Schema
-- Combined Schema & Triggers
-- ==============================================================================

-- 0. Cleanup (Drop existing objects to ensure clean state)
-- Note: Order matters due to dependencies
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "Public members are viewable by everyone" on public.members;
drop policy if exists "Users can update own profile" on public.members;
drop policy if exists "Bylaws are viewable by everyone" on public.bylaws;
drop policy if exists "Admins can insert bylaws" on public.bylaws;
drop policy if exists "Transactions are viewable by everyone" on public.transactions;
drop policy if exists "Admins can insert transactions" on public.transactions;

drop table if exists public.transactions;
drop table if exists public.bylaws;
drop table if exists public.members;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. Tables
-- ==============================================================================

-- 1.1 Members Table
create table public.members (
  id uuid references auth.users on delete cascade not null primary key, -- Links to Supabase Auth
  email text not null,
  name text not null,
  phone text,
  role text not null default 'MEMBER' check (role in ('MEMBER', 'ADMIN', 'PRESIDENT')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'WITHDRAWN')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.2 Bylaws Table
create table public.bylaws (
  id uuid default uuid_generate_v4() primary key,
  version text not null, -- e.g., '2024-1'
  title text not null,
  content text not null, -- Markdown content
  effective_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.members(id) not null
);

-- 1.3 Transactions Table (Ledger)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  type text not null check (type in ('DEPOSIT', 'WITHDRAWAL')),
  amount numeric not null,
  balance numeric not null, -- Calculated balance after this transaction
  category text not null, -- e.g., '회비', '식대'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.members(id) not null
);

-- ==============================================================================
-- 2. Row Level Security (RLS) & Policies
-- ==============================================================================

-- Enable RLS
alter table public.members enable row level security;
alter table public.bylaws enable row level security;
alter table public.transactions enable row level security;

-- 2.1 Members Policies
-- Everyone can view active members.
create policy "Public members are viewable by everyone" on members
  for select using (true);

-- Users can update their own profile.
create policy "Users can update own profile" on members
  for update using (auth.uid() = id);

-- 2.2 Bylaws Policies
-- Everyone can view.
create policy "Bylaws are viewable by everyone" on bylaws
  for select using (true);

-- Only Admins can insert.
create policy "Admins can insert bylaws" on bylaws
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- 2.3 Transactions Policies
-- Everyone can view.
create policy "Transactions are viewable by everyone" on transactions
  for select using (true);

-- Only Admins can insert.
create policy "Admins can insert transactions" on transactions
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- ==============================================================================
-- 3. Triggers & Functions
-- ==============================================================================

-- 3.1 Handle New User Signup
-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.members (id, email, name, phone, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Unknown'),
    new.raw_user_meta_data->>'phone',
    'MEMBER',
    'ACTIVE'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
