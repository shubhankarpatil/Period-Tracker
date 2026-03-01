-- SQL for Partner Support Checklist RLS
-- Run this in your Supabase SQL Editor to allow partners to view and toggle tasks

-- 1. Allow anonymous (Partners) to select tasks for users with an active partner token
CREATE POLICY "Public: View supplies if partner_token exists" 
ON public.supplies
FOR SELECT 
TO anon
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE partner_token IS NOT NULL
  )
);

-- 2. Allow anonymous (Partners) to update tasks (toggle checkboxes)
CREATE POLICY "Public: Update supplies if partner_token exists" 
ON public.supplies
FOR UPDATE
TO anon
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE partner_token IS NOT NULL
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles WHERE partner_token IS NOT NULL
  )
);

-- NOTE: These policies allow anyone with a partner token access to ANY profile's supplies 
-- if they know the user_id. For production, more granular checks using custom headers or 
-- JWTs are recommended.
