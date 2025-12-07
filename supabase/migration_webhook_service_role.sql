-- Ensure Service Role can bypass RLS (Supabase default, but good to verify/ensure no specific block)
-- Actually, the service role key bypasses RLS automatically.
-- However, we might need to ensure the 'paid' status is allowed if there were specific constraints.
-- The current check constraint "status in ('draft', 'paid', 'completed')" is fine.

-- We don't need a specific policy for the service role as it bypasses RLS.
-- But let's add a comment for clarity.
