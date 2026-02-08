-- Fix for Calendar Delete/Reset Issue
-- The original schema was missing a policy to allow users to DELETE their own cycles.

create policy "Users can delete own cycles" on public.cycles
  for delete using (auth.uid() = user_id);
