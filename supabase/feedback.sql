-- Feedback Table ("Drop a Note" feature)
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query → paste → Run).

create table if not exists public.feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('bug', 'suggestion', 'other')),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

-- Authenticated users can submit feedback tied to their own user_id.
create policy "Users can submit own feedback"
  on public.feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No SELECT / UPDATE / DELETE policies are defined, so with RLS enabled
-- clients (anon + authenticated) cannot read or modify rows. Read submissions
-- via the Supabase Dashboard table viewer or a future admin-only view.
