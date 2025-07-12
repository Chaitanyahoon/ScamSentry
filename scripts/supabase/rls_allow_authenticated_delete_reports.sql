-- Allow authenticated users to delete reports from the 'scam_reports' table
-- This policy grants DELETE permission to any user with the 'authenticated' role.
CREATE POLICY "Allow authenticated users to delete reports"
ON public.scam_reports FOR DELETE
USING (auth.role() = 'authenticated');

-- If you previously ran this and got an "already exists" error, that's fine.
-- It just means the policy is already there.
