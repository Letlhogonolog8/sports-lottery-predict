-- =============================================================================
-- MIGRATION 010: Consolidated pending changes
-- Apply this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Prerequisites: migrations 001, 002, 003_fix_accuracy_calculation already applied.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: Postgres-backed rate limiting for Edge Functions
-- (replaces the in-memory Map in predict-match that resets on cold starts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT        NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_count INT        NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'api_rate_limits'
      AND policyname = 'Service role only manages rate limits'
  ) THEN
    CREATE POLICY "Service role only manages rate limits"
      ON public.api_rate_limits
      USING (false);
  END IF;
END$$;

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id      UUID,
  p_endpoint     TEXT,
  p_window_secs  INT  DEFAULT 60,
  p_max_requests INT  DEFAULT 20
) RETURNS BOOLEAN AS $$
DECLARE
  v_now          TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
  v_window_start TIMESTAMP WITH TIME ZONE := v_now - (p_window_secs || ' seconds')::INTERVAL;
  v_count        INT;
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

-- -----------------------------------------------------------------------------
-- PART 2: Fix match status drift
-- Corrects status and minute fields for all matches based on start_time.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- PART 3: Backfill teams from existing match data and link match FKs
-- -----------------------------------------------------------------------------
WITH source_teams AS (
  SELECT DISTINCT home_team_name AS name, sport, league
  FROM public.matches
  WHERE home_team_name IS NOT NULL AND TRIM(home_team_name) <> ''
  UNION
  SELECT DISTINCT away_team_name AS name, sport, league
  FROM public.matches
  WHERE away_team_name IS NOT NULL AND TRIM(away_team_name) <> ''
),
filtered_teams AS (
  SELECT * FROM source_teams
  WHERE COALESCE(name, '') NOT ILIKE '%test match%'
    AND COALESCE(name, '') NOT ILIKE 'test%'
    AND COALESCE(name, '') NOT ILIKE 'demo%'
    AND COALESCE(league, '') NOT ILIKE '%test%'
    AND COALESCE(league, '') NOT ILIKE '%demo%'
),
ranked_teams AS (
  SELECT
    name,
    sport,
    league,
    NULLIF(TRIM(SPLIT_PART(league, ' - ', 1)), '') AS country,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY league ASC) AS rn
  FROM filtered_teams
)
INSERT INTO public.teams (name, sport, league, country)
SELECT name, sport, league, country
FROM ranked_teams
WHERE rn = 1
ON CONFLICT (name)
DO UPDATE SET
  sport  = EXCLUDED.sport,
  league = EXCLUDED.league,
  country = COALESCE(EXCLUDED.country, public.teams.country);

UPDATE public.matches AS m
SET home_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.home_team_name = t.name
  AND m.home_team_name IS NOT NULL
  AND (m.home_team_id IS NULL OR m.home_team_id <> t.id);

UPDATE public.matches AS m
SET away_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.away_team_name = t.name
  AND m.away_team_name IS NOT NULL
  AND (m.away_team_id IS NULL OR m.away_team_id <> t.id);

-- -----------------------------------------------------------------------------
-- PART 4: Seed SuperSport teams (football, cricket, rugby)
-- Safe to re-run — uses ON CONFLICT DO UPDATE.
-- -----------------------------------------------------------------------------
INSERT INTO public.teams (name, sport, league, country) VALUES
('AS Roma',                      'football', 'FOOTBALL SCHEDULE', NULL),
('AmaZulu FC',                   'football', 'FOOTBALL SCHEDULE', NULL),
('AmaZulu Reserves',             'football', 'FOOTBALL SCHEDULE', NULL),
('Arsenal',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Aston Villa',                  'football', 'FOOTBALL SCHEDULE', NULL),
('Atalanta',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Auxerre',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Baroka FC',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Bologna',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Bournemouth',                  'football', 'FOOTBALL SCHEDULE', NULL),
('Brentford',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Brest',                        'football', 'FOOTBALL SCHEDULE', NULL),
('Brighton',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Bristol City',                 'football', 'FOOTBALL SCHEDULE', NULL),
('Burnley',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Cape Town City FC',            'football', 'FOOTBALL SCHEDULE', NULL),
('Casric Stars',                 'football', 'FOOTBALL SCHEDULE', NULL),
('Celta Vigo',                   'football', 'FOOTBALL SCHEDULE', NULL),
('Chelsea',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Chippa United',                'football', 'FOOTBALL SCHEDULE', NULL),
('Chippa United Reserves',       'football', 'FOOTBALL SCHEDULE', NULL),
('Crystal Palace',               'football', 'FOOTBALL SCHEDULE', NULL),
('Durban City',                  'football', 'FOOTBALL SCHEDULE', NULL),
('Everton',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Fiorentina',                   'football', 'FOOTBALL SCHEDULE', NULL),
('Fulham',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Getafe',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Girona',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Golden Arrows',                'football', 'FOOTBALL SCHEDULE', NULL),
('Golden Arrows Reserves',       'football', 'FOOTBALL SCHEDULE', NULL),
('Juventus',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Kaizer Chiefs',                'football', 'FOOTBALL SCHEDULE', NULL),
('LOSC Lille',                   'football', 'FOOTBALL SCHEDULE', NULL),
('Leeds United',                 'football', 'FOOTBALL SCHEDULE', NULL),
('Lerumo Lions',                 'football', 'FOOTBALL SCHEDULE', NULL),
('Liverpool',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Lorient',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Magesi FC',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Mamelodi Sundowns',            'football', 'FOOTBALL SCHEDULE', NULL),
('Mamelodi Sundowns Reserves',   'football', 'FOOTBALL SCHEDULE', NULL),
('Manchester City',              'football', 'FOOTBALL SCHEDULE', NULL),
('Manchester United',            'football', 'FOOTBALL SCHEDULE', NULL),
('Marseille',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Marumo Gallants',              'football', 'FOOTBALL SCHEDULE', NULL),
('Metz',                         'football', 'FOOTBALL SCHEDULE', NULL),
('Monaco',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Nantes',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Napoli',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Newcastle',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Nice',                         'football', 'FOOTBALL SCHEDULE', NULL),
('Nottingham Forest',            'football', 'FOOTBALL SCHEDULE', NULL),
('Olympique Lyonnais',           'football', 'FOOTBALL SCHEDULE', NULL),
('Orbit College FC',             'football', 'FOOTBALL SCHEDULE', NULL),
('Orlando Pirates',              'football', 'FOOTBALL SCHEDULE', NULL),
('Orlando Pirates Reserves',     'football', 'FOOTBALL SCHEDULE', NULL),
('Osasuna',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Paris FC',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Paris Saint-Germain',          'football', 'FOOTBALL SCHEDULE', NULL),
('Pisa',                         'football', 'FOOTBALL SCHEDULE', NULL),
('Polokwane City',               'football', 'FOOTBALL SCHEDULE', NULL),
('Port Vale',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Pretoria University FC',       'football', 'FOOTBALL SCHEDULE', NULL),
('Rayo Vallecano',               'football', 'FOOTBALL SCHEDULE', NULL),
('Real Betis',                   'football', 'FOOTBALL SCHEDULE', NULL),
('Real Madrid',                  'football', 'FOOTBALL SCHEDULE', NULL),
('Real Oviedo',                  'football', 'FOOTBALL SCHEDULE', NULL),
('Richards Bay',                 'football', 'FOOTBALL SCHEDULE', NULL),
('SS Lazio',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Sassuolo',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Sekhukhune United',            'football', 'FOOTBALL SCHEDULE', NULL),
('Sekhukhune United Reserves',   'football', 'FOOTBALL SCHEDULE', NULL),
('Sevilla',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Siwelele',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Stellenbosch FC',              'football', 'FOOTBALL SCHEDULE', NULL),
('Sunderland',                   'football', 'FOOTBALL SCHEDULE', NULL),
('TS Galaxy',                    'football', 'FOOTBALL SCHEDULE', NULL),
('Torino',                       'football', 'FOOTBALL SCHEDULE', NULL),
('Tottenham Hotspur',            'football', 'FOOTBALL SCHEDULE', NULL),
('Udinese',                      'football', 'FOOTBALL SCHEDULE', NULL),
('Valencia',                     'football', 'FOOTBALL SCHEDULE', NULL),
('West Ham',                     'football', 'FOOTBALL SCHEDULE', NULL),
('Wolves',                       'football', 'FOOTBALL SCHEDULE', NULL),
-- Cricket
('Australia Women',              'cricket',  'CRICKET SCHEDULE',  NULL),
('CSA Emerging',                 'cricket',  'CRICKET SCHEDULE',  NULL),
('DP World Lions',               'cricket',  'CRICKET SCHEDULE',  NULL),
('Dafabet Warriors',             'cricket',  'CRICKET SCHEDULE',  NULL),
('Eastern Cape Iinyathi',        'cricket',  'CRICKET SCHEDULE',  NULL),
('Eastern Storm',                'cricket',  'CRICKET SCHEDULE',  NULL),
('Flexbrands Knights',           'cricket',  'CRICKET SCHEDULE',  NULL),
('Goldrush Boland',              'cricket',  'CRICKET SCHEDULE',  NULL),
('Hollywoodbets Dolphins',       'cricket',  'CRICKET SCHEDULE',  NULL),
('India Men',                    'cricket',  'CRICKET SCHEDULE',  NULL),
('India Women',                  'cricket',  'CRICKET SCHEDULE',  NULL),
('Limpopo Impalas',              'cricket',  'CRICKET SCHEDULE',  NULL),
('Momentum Multiply Titans',     'cricket',  'CRICKET SCHEDULE',  NULL),
('Mpumalanga Rhinos',            'cricket',  'CRICKET SCHEDULE',  NULL),
('New Zealand Men',              'cricket',  'CRICKET SCHEDULE',  NULL),
('North West Dragons',           'cricket',  'CRICKET SCHEDULE',  NULL),
('Northern Cape Heat',           'cricket',  'CRICKET SCHEDULE',  NULL),
('Six Gun Grill Garden Route Badgers', 'cricket', 'CRICKET SCHEDULE', NULL),
('South Africa Men',             'cricket',  'CRICKET SCHEDULE',  NULL),
('Tuskers',                      'cricket',  'CRICKET SCHEDULE',  NULL),
('WSB Western Province',         'cricket',  'CRICKET SCHEDULE',  NULL),
-- Rugby
('Benetton Rugby',               'rugby',    'RUGBY SCHEDULE',    NULL),
('Bulls',                        'rugby',    'RUGBY SCHEDULE',    NULL),
('CUT',                          'rugby',    'RUGBY SCHEDULE',    NULL),
('Cardiff Rugby',                'rugby',    'RUGBY SCHEDULE',    NULL),
('Connacht',                     'rugby',    'RUGBY SCHEDULE',    NULL),
('Dragons',                      'rugby',    'RUGBY SCHEDULE',    NULL),
('Edinburgh',                    'rugby',    'RUGBY SCHEDULE',    NULL),
('Emeris',                       'rugby',    'RUGBY SCHEDULE',    NULL),
('England Men',                  'rugby',    'RUGBY SCHEDULE',    NULL),
('France Men',                   'rugby',    'RUGBY SCHEDULE',    NULL),
('Glasgow Warriors',             'rugby',    'RUGBY SCHEDULE',    NULL),
('Ireland Men',                  'rugby',    'RUGBY SCHEDULE',    NULL),
('Italy Men',                    'rugby',    'RUGBY SCHEDULE',    NULL),
('Leinster',                     'rugby',    'RUGBY SCHEDULE',    NULL),
('Lions',                        'rugby',    'RUGBY SCHEDULE',    NULL),
('Llanelli Scarlets',            'rugby',    'RUGBY SCHEDULE',    NULL),
('Maties',                       'rugby',    'RUGBY SCHEDULE',    NULL),
('Munster',                      'rugby',    'RUGBY SCHEDULE',    NULL),
('NWU',                          'rugby',    'RUGBY SCHEDULE',    NULL),
('Ospreys',                      'rugby',    'RUGBY SCHEDULE',    NULL),
('Scotland Men',                 'rugby',    'RUGBY SCHEDULE',    NULL),
('Sharks',                       'rugby',    'RUGBY SCHEDULE',    NULL),
('Shimlas',                      'rugby',    'RUGBY SCHEDULE',    NULL),
('Stormers',                     'rugby',    'RUGBY SCHEDULE',    NULL),
('UCT Ikeys',                    'rugby',    'RUGBY SCHEDULE',    NULL),
('UJ',                           'rugby',    'RUGBY SCHEDULE',    NULL),
('UP-Tuks',                      'rugby',    'RUGBY SCHEDULE',    NULL),
('Ulster',                       'rugby',    'RUGBY SCHEDULE',    NULL),
('Wales Men',                    'rugby',    'RUGBY SCHEDULE',    NULL),
('Zebre',                        'rugby',    'RUGBY SCHEDULE',    NULL)
ON CONFLICT (name)
DO UPDATE SET
  sport   = EXCLUDED.sport,
  league  = EXCLUDED.league,
  country = COALESCE(EXCLUDED.country, public.teams.country);

-- -----------------------------------------------------------------------------
-- PART 5: Remove test/demo placeholder data
-- -----------------------------------------------------------------------------
WITH placeholder_matches AS (
  SELECT id FROM public.matches
  WHERE
    COALESCE(home_team_name, '') ILIKE '%test match%'
    OR COALESCE(away_team_name, '') ILIKE '%test match%'
    OR COALESCE(league, '') ILIKE '%test%'
    OR COALESCE(league, '') ILIKE '%demo%'
    OR COALESCE(match_id, '') ILIKE 'test_%'
    OR COALESCE(match_id, '') ILIKE 'demo_%'
    OR COALESCE(match_id, '') ILIKE '%_test_%'
    OR COALESCE(match_id, '') ILIKE '%_demo_%'
)
DELETE FROM public.matches
WHERE id IN (SELECT id FROM placeholder_matches);

WITH placeholder_teams AS (
  SELECT t.id FROM public.teams t
  WHERE
    COALESCE(t.name, '')   ILIKE '%test match%'
    OR COALESCE(t.name, '')   ILIKE 'test%'
    OR COALESCE(t.name, '')   ILIKE 'demo%'
    OR COALESCE(t.league, '') ILIKE '%test%'
    OR COALESCE(t.league, '') ILIKE '%demo%'
),
linked_by_id AS (
  SELECT DISTINCT home_team_id AS team_id FROM public.matches WHERE home_team_id IS NOT NULL
  UNION
  SELECT DISTINCT away_team_id AS team_id FROM public.matches WHERE away_team_id IS NOT NULL
),
linked_by_name AS (
  SELECT DISTINCT t.id AS team_id
  FROM public.teams t
  JOIN public.matches m ON m.home_team_name = t.name OR m.away_team_name = t.name
),
deletable_placeholder_teams AS (
  SELECT pt.id FROM placeholder_teams pt
  LEFT JOIN linked_by_id   li ON li.team_id = pt.id
  LEFT JOIN linked_by_name ln ON ln.team_id = pt.id
  WHERE li.team_id IS NULL AND ln.team_id IS NULL
)
DELETE FROM public.teams WHERE id IN (SELECT id FROM deletable_placeholder_teams);

-- -----------------------------------------------------------------------------
-- PART 6: Re-link any remaining matches to teams (recover broken FKs)
-- -----------------------------------------------------------------------------
UPDATE public.matches AS m
SET home_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.home_team_name = t.name
  AND m.home_team_name IS NOT NULL
  AND (m.home_team_id IS NULL OR m.home_team_id <> t.id);

UPDATE public.matches AS m
SET away_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.away_team_name = t.name
  AND m.away_team_name IS NOT NULL
  AND (m.away_team_id IS NULL OR m.away_team_id <> t.id);
