-- Drop the existing policy that restricts inserts to authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.scam_reports;

-- Create a new policy that allows all users (authenticated or not) to insert reports
-- This is a simpler policy to ensure data can be inserted.
-- For more granular control (e.g., only anonymous if 'anonymous' column is true),
-- you would need a more complex policy and potentially a 'created_by' column.
CREATE POLICY "Allow all users to insert reports" ON public.scam_reports FOR INSERT WITH CHECK (true);

-- Note: The policy "Allow public read access" for SELECT remains unchanged and is still active.
