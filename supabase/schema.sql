-- Profiles Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  partner_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Cycles Table
create table public.cycles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  start_date date not null,
  end_date date,
  symptoms jsonb default '[]'::jsonb, -- Array of strings e.g. ["cramps", "headache"]
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Cycles
alter table public.cycles enable row level security;

create policy "Users can view own cycles" on public.cycles
  for select using (auth.uid() = user_id);

create policy "Users can update own cycles" on public.cycles
  for update using (auth.uid() = user_id);

create policy "Users can insert own cycles" on public.cycles
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own cycles" on public.cycles
  for delete using (auth.uid() = user_id);

-- Supplies Table (Optional, for Checklist)
create table public.supplies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  item text not null,
  is_checked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.supplies enable row level security;

create policy "Users can manage own supplies" on public.supplies
  for all using (auth.uid() = user_id);
