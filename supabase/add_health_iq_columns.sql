-- Add Health IQ columns to daily_logs
alter table public.daily_logs 
add column if not exists basal_temp numeric,
add column if not exists cervical_mucus text,
add column if not exists lh_test text;
