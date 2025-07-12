CREATE OR REPLACE FUNCTION increment_flag_count(report_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.scam_reports
  SET
    flag_count = flag_count + 1,
    trust_score = GREATEST(trust_score - 5, 0) -- Decrease trust score, min 0
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;
