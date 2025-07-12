CREATE OR REPLACE FUNCTION increment_helpful_votes(report_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.scam_reports
  SET
    helpful_votes = helpful_votes + 1,
    trust_score = LEAST(trust_score + 2, 100) -- Increase trust score, max 100
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;
