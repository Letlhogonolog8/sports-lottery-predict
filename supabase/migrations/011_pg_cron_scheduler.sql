-- Prerequisites:
--   1. Dashboard → Database → Extensions → enable "pg_cron"  (if not already enabled)
--   2. Dashboard → Database → Extensions → enable "http"     (if not already enabled)
-- Then run this entire file in SQL Editor.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove old schedules if re-running this migration
SELECT cron.unschedule('fetch-sports-data-every-5min') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fetch-sports-data-every-5min'
);
SELECT cron.unschedule('refresh-live-data-every-2min') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'refresh-live-data-every-2min'
);

-- Schedule fetch-sports-data every 5 minutes.
SELECT cron.schedule(
  'fetch-sports-data-every-5min',
  '*/5 * * * *',
  $$
  SELECT status, content
  FROM extensions.http((
    'POST',
    'https://otezimmvabqgbcrouglw.supabase.co/functions/v1/fetch-sports-data',
    ARRAY[
      extensions.http_header('X-Cron-Secret', 'f74cc65b652c670717421580a23f7304d33cdad0043ac3e92b7a643f0b6de8c0'),
      extensions.http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{}'
  )::extensions.http_request);
  $$
);

-- Schedule refresh-live-data every 2 minutes.
SELECT cron.schedule(
  'refresh-live-data-every-2min',
  '*/2 * * * *',
  $$
  SELECT status, content
  FROM extensions.http((
    'POST',
    'https://otezimmvabqgbcrouglw.supabase.co/functions/v1/refresh-live-data',
    ARRAY[
      extensions.http_header('X-Cron-Secret', '5ae94f54a40f4c3e513b4b0e6c13851d2b73c21f3250ffbbbed4ae0017077e65'),
      extensions.http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{}'
  )::extensions.http_request);
  $$
);

-- Verify: SELECT jobname, schedule, active FROM cron.job;
