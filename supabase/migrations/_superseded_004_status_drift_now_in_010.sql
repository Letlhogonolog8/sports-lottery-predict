UPDATE public.matches
SET
  status = CASE
    WHEN start_time > NOW() THEN 'upcoming'
    WHEN start_time <= NOW() - INTERVAL '120 minutes' THEN 'finished'
    ELSE 'live'
  END,
  minute = CASE
    WHEN start_time > NOW() THEN NULL
    WHEN start_time <= NOW() - INTERVAL '120 minutes' THEN 90
    ELSE LEAST(90, GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - start_time)) / 60)::INT))
  END,
  updated_at = NOW()
WHERE start_time IS NOT NULL;
