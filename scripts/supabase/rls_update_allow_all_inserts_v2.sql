-- Drop the existing policy that restricts inserts to authenticated users
-- This is crucial to remove the old, restrictive policy.
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.scam_reports;

-- Create a new policy that allows all users (authenticated or not) to insert reports.
-- The `WITH CHECK (true)` clause means there are no additional conditions for insertion,
-- effectively allowing anyone to insert data.
CREATE POLICY "Allow all users to insert reports" ON public.scam_reports FOR INSERT WITH CHECK (true);

-- The other policies (like "Allow public read access to approved reports") remain active
-- and are not affected by this script.
