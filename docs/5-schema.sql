-- ==============================================================================
-- Hamwol Database Schema
-- Complete Schema with Tables, Triggers, Functions, and Policies
-- ==============================================================================

-- 0. Cleanup (Drop existing objects to ensure clean state)
-- Note: Order matters due to dependencies

-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists ensure_single_active_bylaw_trigger on public.bylaws;

-- Drop functions
drop function if exists public.handle_new_user();
drop function if exists public.ensure_single_active_bylaw();

-- Drop policies
drop policy if exists "Public members are viewable by everyone" on public.members;
drop policy if exists "Users can update own profile" on public.members;
drop policy if exists "Admins and Presidents can update members" on public.members;
drop policy if exists "Bylaws are viewable by everyone" on public.bylaws;
drop policy if exists "Admins can insert bylaws" on public.bylaws;
drop policy if exists "Admins can update bylaws" on public.bylaws;
drop policy if exists "Transactions are viewable by everyone" on public.transactions;
drop policy if exists "Admins can insert transactions" on public.transactions;

-- Drop tables
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
  id uuid references auth.users on delete cascade not null primary key,
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
  version text not null,
  title text not null,
  content text not null,
  effective_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.members(id) not null,
  is_active boolean default false not null
);

-- 1.3 Transactions Table (Ledger)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  type text not null check (type in ('DEPOSIT', 'WITHDRAWAL')),
  amount numeric not null,
  balance numeric not null,
  category text not null,
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
-- Everyone can view members
create policy "Public members are viewable by everyone" on members
  for select using (true);

-- Users can update their own profile
create policy "Users can update own profile" on members
  for update using (auth.uid() = id);

-- Admins and Presidents can update any member
create policy "Admins and Presidents can update members" on members
  for update using (
    exists (
      select 1 from public.members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- 2.2 Bylaws Policies
-- Everyone can view bylaws
create policy "Bylaws are viewable by everyone" on bylaws
  for select using (true);

-- Only Admins can insert bylaws
create policy "Admins can insert bylaws" on bylaws
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- Only Admins can update bylaws
create policy "Admins can update bylaws" on bylaws
  for update using (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- 2.3 Transactions Policies
-- Everyone can view transactions
create policy "Transactions are viewable by everyone" on transactions
  for select using (true);

-- Only Admins can insert transactions
create policy "Admins can insert transactions" on transactions
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- ==============================================================================
-- 3. Functions
-- ==============================================================================

-- 3.1 Handle New User Signup
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

-- 3.2 Ensure Only One Active Bylaw
create or replace function public.ensure_single_active_bylaw()
returns trigger as $$
begin
  if new.is_active = true then
    -- Deactivate all other bylaws
    update public.bylaws 
    set is_active = false 
    where id != new.id and is_active = true;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 4. Triggers
-- ==============================================================================

-- 4.1 Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4.2 Trigger to ensure single active bylaw
create trigger ensure_single_active_bylaw_trigger
  before insert or update on public.bylaws
  for each row
  when (new.is_active = true)
  execute function public.ensure_single_active_bylaw();

-- ==============================================================================
-- 5. Initial Data Setup
-- ==============================================================================

-- Set the most recent bylaw as active if none are active
do $$
declare
  active_count integer;
  latest_bylaw_id uuid;
begin
  select count(*) into active_count from public.bylaws where is_active = true;
  
  if active_count = 0 then
    select id into latest_bylaw_id 
    from public.bylaws 
    order by effective_date desc, created_at desc 
    limit 1;
    
    if latest_bylaw_id is not null then
      update public.bylaws set is_active = true where id = latest_bylaw_id;
    end if;
  end if;
end $$;
