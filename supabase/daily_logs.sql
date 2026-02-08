-- Daily Logs Table
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  mood text,
  symptoms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date) -- One log per day per user
);

-- Enable RLS
alter table public.daily_logs enable row level security;

-- Policies
create policy "Users can view own daily logs" on public.daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own daily logs" on public.daily_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own daily logs" on public.daily_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete own daily logs" on public.daily_logs
  for delete using (auth.uid() = user_id);
