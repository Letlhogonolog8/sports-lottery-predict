-- Enable pg_cron extension (must be done by superuser / Supabase Dashboard)
-- In Supabase: Dashboard → Database → Extensions → enable "pg_cron"
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant cron usage to the postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule fetch-sports-data every 5 minutes.
-- This calls the edge function via the http extension using the service role key.
-- Replace <SUPABASE_PROJECT_REF> and <SUPABASE_SERVICE_ROLE_KEY> with your actual values,
-- or set them as Postgres secrets and reference via current_setting().
SELECT cron.schedule(
  'fetch-sports-data-every-5min',
  '*/5 * * * *',
  $$
  SELECT
    status, content
  FROM
    extensions.http((
      'POST',
      'https://otezimmvabqgbcrouglw.supabase.co/functions/v1/fetch-sports-data',
      ARRAY[
        extensions.http_header('X-Cron-Secret', current_setting('app.fetch_sports_data_secret', true)),
        extensions.http_header('Content-Type', 'application/json')
      ],
      'application/json',
      '{}'
    )::extensions.http_request);
  $$
);

-- Schedule refresh-live-data every 2 minutes (keeps match minutes/status accurate).
SELECT cron.schedule(
  'refresh-live-data-every-2min',
  '*/2 * * * *',
  $$
  SELECT
    status, content
  FROM
    extensions.http((
      'POST',
      'https://otezimmvabqgbcrouglw.supabase.co/functions/v1/refresh-live-data',
      ARRAY[
        extensions.http_header('X-Cron-Secret', current_setting('app.refresh_live_data_secret', true)),
        extensions.http_header('Content-Type', 'application/json')
      ],
      'application/json',
      '{}'
    )::extensions.http_request);
  $$
);

-- To verify the schedules were created:
-- SELECT * FROM cron.job;

-- To set the secrets used above, run once in the Supabase SQL editor:
-- ALTER DATABASE postgres SET app.fetch_sports_data_secret = '<your-FETCH_SPORTS_DATA_SECRET>';
-- ALTER DATABASE postgres SET app.refresh_live_data_secret = '<your-REFRESH_LIVE_DATA_SECRET>';
