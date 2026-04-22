CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  total_settled INT;
  total_wins INT;
  total_losses INT;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT
    COUNT(*) FILTER (WHERE status IN ('won', 'lost')),
    COUNT(*) FILTER (WHERE status = 'won'),
    COUNT(*) FILTER (WHERE status = 'lost')
  INTO total_settled, total_wins, total_losses
  FROM public.bet_slips
  WHERE user_id = target_user_id;

  UPDATE public.user_profiles
  SET
    total_predictions = COALESCE(total_settled, 0),
    wins = COALESCE(total_wins, 0),
    losses = COALESCE(total_losses, 0),
    accuracy_percentage = CASE
      WHEN COALESCE(total_settled, 0) > 0 THEN ROUND((total_wins::NUMERIC / total_settled::NUMERIC) * 100, 2)
      ELSE 0
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.bet_slips;

CREATE TRIGGER update_user_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.bet_slips
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();
