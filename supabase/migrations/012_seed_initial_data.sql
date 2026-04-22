-- =============================================================================
-- MIGRATION 012: Seed initial match + lottery data
-- Safe to re-run — uses INSERT ON CONFLICT DO UPDATE / DO NOTHING throughout.
-- Apply in Supabase Dashboard → SQL Editor → New query.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: Lottery draws
-- -----------------------------------------------------------------------------
INSERT INTO public.lottery_draws (name, next_draw, jackpot, numbers_range_min, numbers_range_max, pick_count)
VALUES
  ('Powerball',     NOW() + INTERVAL '3 days', '$785 Million', 1, 69, 5),
  ('Mega Millions', NOW() + INTERVAL '2 days', '$425 Million', 1, 70, 5),
  ('EuroMillions',  NOW() + INTERVAL '2 days', '€190 Million', 1, 50, 5),
  ('UK Lotto',      NOW() + INTERVAL '3 days', '£12.5 Million', 1, 59, 6)
ON CONFLICT (name) DO UPDATE SET
  next_draw = EXCLUDED.next_draw,
  jackpot   = EXCLUDED.jackpot;

-- Frequency data (idempotent via unique constraint on draw_id+number)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 150 + 50)
FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 69) AS num
WHERE name = 'Powerball'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 140 + 45)
FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 70) AS num
WHERE name = 'Mega Millions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 160 + 60)
FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 50) AS num
WHERE name = 'EuroMillions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 130 + 40)
FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 59) AS num
WHERE name = 'UK Lotto'
ON CONFLICT (draw_id, number) DO NOTHING;

-- Hot / cold numbers (idempotent via unique constraint on draw_id+number)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23,32,61,53,69,21]) AS num WHERE name = 'Powerball'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[13,36,5,49,51,60]) AS num WHERE name = 'Powerball'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[17,31,46,10,70,14]) AS num WHERE name = 'Mega Millions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[8,45,52,67,3,29]) AS num WHERE name = 'Mega Millions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23,44,50,17,19,38]) AS num WHERE name = 'EuroMillions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[22,35,46,2,9,41]) AS num WHERE name = 'EuroMillions'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[58,31,38,10,23,40]) AS num WHERE name = 'UK Lotto'
ON CONFLICT (draw_id, number) DO NOTHING;

INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[20,13,41,48,55,6]) AS num WHERE name = 'UK Lotto'
ON CONFLICT (draw_id, number) DO NOTHING;

-- -----------------------------------------------------------------------------
-- PART 2: Seed matches across multiple sports/leagues
-- All timestamps relative to NOW() so they're always fresh.
-- Uses ON CONFLICT DO UPDATE so re-running refreshes start_time/status.
-- -----------------------------------------------------------------------------
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute)
VALUES
  -- Premier League
  ('pl_001', 'football', 'Premier League', 'Manchester City',   'Brighton',          'live',     NOW() - INTERVAL '65 minutes',  2, 1, 65),
  ('pl_002', 'football', 'Premier League', 'Arsenal',           'Tottenham Hotspur', 'live',     NOW() - INTERVAL '42 minutes',  1, 1, 42),
  ('pl_003', 'football', 'Premier League', 'Chelsea',           'Manchester United', 'live',     NOW() - INTERVAL '78 minutes',  0, 2, 78),
  ('pl_004', 'football', 'Premier League', 'Liverpool',         'Aston Villa',       'upcoming', NOW() + INTERVAL '45 minutes',  NULL, NULL, NULL),
  ('pl_005', 'football', 'Premier League', 'Newcastle',         'Fulham',            'upcoming', NOW() + INTERVAL '90 minutes',  NULL, NULL, NULL),
  ('pl_006', 'football', 'Premier League', 'West Ham',          'Everton',           'upcoming', NOW() + INTERVAL '2 hours',     NULL, NULL, NULL),
  -- La Liga
  ('laliga_001', 'football', 'La Liga', 'Real Madrid',          'Barcelona',         'live',     NOW() - INTERVAL '55 minutes',  2, 2, 55),
  ('laliga_002', 'football', 'La Liga', 'Atletico Madrid',      'Valencia',          'live',     NOW() - INTERVAL '88 minutes',  1, 0, 88),
  ('laliga_003', 'football', 'La Liga', 'Real Betis',           'Sevilla',           'upcoming', NOW() + INTERVAL '1 hour',      NULL, NULL, NULL),
  ('laliga_004', 'football', 'La Liga', 'Celta Vigo',           'Osasuna',           'upcoming', NOW() + INTERVAL '3 hours',     NULL, NULL, NULL),
  -- Serie A
  ('seriea_001', 'football', 'Serie A', 'Juventus',             'Napoli',            'live',     NOW() - INTERVAL '72 minutes',  1, 1, 72),
  ('seriea_002', 'football', 'Serie A', 'AC Milan',             'AS Roma',           'live',     NOW() - INTERVAL '45 minutes',  2, 0, 45),
  ('seriea_003', 'football', 'Serie A', 'SS Lazio',             'Atalanta',          'upcoming', NOW() + INTERVAL '2 hours',     NULL, NULL, NULL),
  -- Bundesliga
  ('bund_001', 'football', 'Bundesliga', 'Bayern Munich',       'Borussia Dortmund', 'live',     NOW() - INTERVAL '51 minutes',  3, 1, 51),
  ('bund_002', 'football', 'Bundesliga', 'RB Leipzig',          'Brentford',         'upcoming', NOW() + INTERVAL '90 minutes',  NULL, NULL, NULL),
  -- Ligue 1
  ('ligue1_001', 'football', 'Ligue 1', 'Paris Saint-Germain', 'Marseille',          'live',     NOW() - INTERVAL '85 minutes',  2, 1, 85),
  ('ligue1_002', 'football', 'Ligue 1', 'Olympique Lyonnais',  'Monaco',             'upcoming', NOW() + INTERVAL '2.5 hours',   NULL, NULL, NULL),
  -- PSL South Africa
  ('psl_001', 'football', 'PSL', 'Mamelodi Sundowns',          'Kaizer Chiefs',      'live',     NOW() - INTERVAL '30 minutes',  1, 0, 30),
  ('psl_002', 'football', 'PSL', 'Orlando Pirates',            'AmaZulu FC',         'upcoming', NOW() + INTERVAL '1 hour',      NULL, NULL, NULL),
  ('psl_003', 'football', 'PSL', 'Stellenbosch FC',            'Cape Town City FC',  'upcoming', NOW() + INTERVAL '3 hours',     NULL, NULL, NULL),
  -- NBA
  ('nba_001', 'basketball', 'NBA', 'Los Angeles Lakers',        'Boston Celtics',    'live',     NOW() - INTERVAL '38 minutes',  98, 95, NULL),
  ('nba_002', 'basketball', 'NBA', 'Golden State Warriors',     'Denver Nuggets',    'live',     NOW() - INTERVAL '42 minutes', 110,108, NULL),
  ('nba_003', 'basketball', 'NBA', 'Miami Heat',                'Chicago Bulls',     'upcoming', NOW() + INTERVAL '3 hours',    NULL,NULL, NULL),
  ('nba_004', 'basketball', 'NBA', 'New York Knicks',           'Los Angeles Clippers','upcoming',NOW() + INTERVAL '5 hours',  NULL,NULL, NULL),
  -- ATP Tennis
  ('atp_001', 'tennis', 'ATP Tour', 'Novak Djokovic',           'Carlos Alcaraz',    'live',     NOW() - INTERVAL '90 minutes',   2,  0, NULL),
  ('atp_002', 'tennis', 'ATP Tour', 'Jannik Sinner',            'Daniil Medvedev',   'live',     NOW() - INTERVAL '60 minutes',   1,  2, NULL),
  ('atp_003', 'tennis', 'ATP Tour', 'Casper Ruud',              'Holger Rune',       'upcoming', NOW() + INTERVAL '2 hours',   NULL,NULL, NULL),
  -- Cricket
  ('cricket_001', 'cricket', 'Test Match', 'India Men',         'England Men',       'live',     NOW() - INTERVAL '6 hours',    287,156, NULL),
  ('cricket_002', 'cricket', 'Test Match', 'Australia Women',   'India Women',       'upcoming', NOW() + INTERVAL '6 hours',   NULL,NULL, NULL),
  ('cricket_003', 'cricket', 'CSA T20',   'Hollywoodbets Dolphins','Momentum Multiply Titans','upcoming',NOW() + INTERVAL '3 hours',NULL,NULL,NULL),
  -- Rugby
  ('rugby_001', 'rugby', 'URC', 'Stormers',                     'Bulls',             'live',     NOW() - INTERVAL '40 minutes',  17, 10, NULL),
  ('rugby_002', 'rugby', 'URC', 'Sharks',                       'Lions',             'upcoming', NOW() + INTERVAL '2 hours',    NULL,NULL, NULL),
  -- NFL
  ('nfl_001', 'american_football', 'NFL', 'New England Patriots','Kansas City Chiefs','upcoming',NOW() + INTERVAL '4 hours',    NULL,NULL, NULL),
  ('nfl_002', 'american_football', 'NFL', 'Dallas Cowboys',     'Green Bay Packers', 'upcoming', NOW() + INTERVAL '8 hours',   NULL,NULL, NULL)
ON CONFLICT (match_id) DO UPDATE SET
  status     = EXCLUDED.status,
  start_time = EXCLUDED.start_time,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  minute     = EXCLUDED.minute,
  updated_at = NOW();

-- Link team FKs for any teams already in the teams table
UPDATE public.matches AS m
SET home_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.home_team_name = t.name AND m.home_team_id IS NULL;

UPDATE public.matches AS m
SET away_team_id = t.id, updated_at = NOW()
FROM public.teams AS t
WHERE m.away_team_name = t.name AND m.away_team_id IS NULL;
