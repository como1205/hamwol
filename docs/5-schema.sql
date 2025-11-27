-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Members Table
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

-- 2. Bylaws Table
create table public.bylaws (
  id uuid default uuid_generate_v4() primary key,
  version text not null, -- e.g., '2024-1'
  title text not null,
  content text not null, -- Markdown content
  effective_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.members(id) not null
);

-- 3. Transactions Table (Ledger)
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

-- Enable Row Level Security (RLS)
alter table public.members enable row level security;
alter table public.bylaws enable row level security;
alter table public.transactions enable row level security;

-- Policies (Simple version for initial setup)

-- Members: Everyone can view active members. Users can update their own profile.
create policy "Public members are viewable by everyone" on members
  for select using (true);

create policy "Users can update own profile" on members
  for update using (auth.uid() = id);

-- Bylaws: Everyone can view. Only Admins can insert.
create policy "Bylaws are viewable by everyone" on bylaws
  for select using (true);

create policy "Admins can insert bylaws" on bylaws
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- Transactions: Everyone can view. Only Admins can insert.
create policy "Transactions are viewable by everyone" on transactions
  for select using (true);

create policy "Admins can insert transactions" on transactions
  for insert with check (
    exists (
      select 1 from members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );
