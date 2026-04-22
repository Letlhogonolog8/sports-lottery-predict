-- Fix update_user_stats trigger: was checking NEW.result (never set) instead of NEW.status
-- Also: add accuracy recalculation, guard against double-counting on re-updates,
--        and set SECURITY DEFINER so the function can always update user_profiles.
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('won', 'lost')
    AND (OLD IS NULL OR OLD.status NOT IN ('won', 'lost'))
  THEN
    UPDATE public.user_profiles
    SET
      total_predictions = total_predictions + 1,
      wins    = wins    + CASE WHEN NEW.status = 'won'  THEN 1 ELSE 0 END,
      losses  = losses  + CASE WHEN NEW.status = 'lost' THEN 1 ELSE 0 END,
      accuracy_percentage = CASE
        WHEN (total_predictions + 1) > 0 THEN
          ROUND(
            (wins + CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END)::DECIMAL
            / (total_predictions + 1) * 100,
            2
          )
        ELSE 0
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Postgres-backed per-user rate limiting for edge functions.
-- Replaces the in-memory Map that resets on every serverless cold start.
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT        NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_count INT        NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only manages rate limits"
  ON public.api_rate_limits
  USING (false);

-- Helper function: returns TRUE if the user is within limit, increments counter.
-- window_seconds: rolling window size (e.g. 60 for 1 minute)
-- max_requests:   max allowed calls within that window
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id      UUID,
  p_endpoint     TEXT,
  p_window_secs  INT  DEFAULT 60,
  p_max_requests INT  DEFAULT 20
) RETURNS BOOLEAN AS $$
DECLARE
  v_now         TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
  v_window_start TIMESTAMP WITH TIME ZONE := v_now - (p_window_secs || ' seconds')::INTERVAL;
  v_count       INT;
BEGIN
  INSERT INTO public.api_rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (p_user_id, p_endpoint, v_now, 1)
  ON CONFLICT (user_id, endpoint) DO UPDATE
    SET
      request_count = CASE
        WHEN api_rate_limits.window_start < v_window_start THEN 1
        ELSE api_rate_limits.request_count + 1
      END,
      window_start = CASE
        WHEN api_rate_limits.window_start < v_window_start THEN v_now
        ELSE api_rate_limits.window_start
      END;

  SELECT request_count INTO v_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;

  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
