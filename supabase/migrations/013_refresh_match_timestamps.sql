-- =============================================================================
-- MIGRATION 013: Refresh match timestamps + create refresh function
-- Run this in Supabase Dashboard → SQL Editor → New query.
-- =============================================================================

-- Step 1: Delete all seeded demo matches so we can re-insert with fresh times.
DELETE FROM public.matches
WHERE match_id IN (
  'pl_001','pl_002','pl_003','pl_004','pl_005','pl_006',
  'laliga_001','laliga_002','laliga_003','laliga_004',
  'seriea_001','seriea_002','seriea_003',
  'bund_001','bund_002',
  'ligue1_001','ligue1_002',
  'psl_001','psl_002','psl_003',
  'nba_001','nba_002','nba_003','nba_004',
  'atp_001','atp_002','atp_003',
  'cricket_001','cricket_002','cricket_003',
  'rugby_001','rugby_002',
  'nfl_001','nfl_002'
);

-- Step 2: Re-insert with timestamps relative to NOW() (always fresh).
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute)
VALUES
  -- Premier League (live)
  ('pl_001', 'football', 'Premier League', 'Manchester City',    'Brighton',           'live',     NOW() - INTERVAL '65 minutes',  2,   1,   65),
  ('pl_002', 'football', 'Premier League', 'Arsenal',            'Tottenham Hotspur',  'live',     NOW() - INTERVAL '42 minutes',  1,   1,   42),
  ('pl_003', 'football', 'Premier League', 'Chelsea',            'Manchester United',  'live',     NOW() - INTERVAL '78 minutes',  0,   2,   78),
  -- Premier League (upcoming)
  ('pl_004', 'football', 'Premier League', 'Liverpool',          'Aston Villa',        'upcoming', NOW() + INTERVAL '3 hours',     NULL,NULL,NULL),
  ('pl_005', 'football', 'Premier League', 'Newcastle',          'Fulham',             'upcoming', NOW() + INTERVAL '5 hours',     NULL,NULL,NULL),
  ('pl_006', 'football', 'Premier League', 'West Ham',           'Everton',            'upcoming', NOW() + INTERVAL '7 hours',     NULL,NULL,NULL),
  -- La Liga
  ('laliga_001', 'football', 'La Liga',    'Real Madrid',        'Barcelona',          'live',     NOW() - INTERVAL '55 minutes',  2,   2,   55),
  ('laliga_002', 'football', 'La Liga',    'Atletico Madrid',    'Valencia',           'live',     NOW() - INTERVAL '88 minutes',  1,   0,   88),
  ('laliga_003', 'football', 'La Liga',    'Real Betis',         'Sevilla',            'upcoming', NOW() + INTERVAL '4 hours',     NULL,NULL,NULL),
  ('laliga_004', 'football', 'La Liga',    'Celta Vigo',         'Osasuna',            'upcoming', NOW() + INTERVAL '6 hours',     NULL,NULL,NULL),
  -- Serie A
  ('seriea_001', 'football', 'Serie A',    'Juventus',           'Napoli',             'live',     NOW() - INTERVAL '72 minutes',  1,   1,   72),
  ('seriea_002', 'football', 'Serie A',    'AC Milan',           'AS Roma',            'live',     NOW() - INTERVAL '45 minutes',  2,   0,   45),
  ('seriea_003', 'football', 'Serie A',    'SS Lazio',           'Atalanta',           'upcoming', NOW() + INTERVAL '5 hours',     NULL,NULL,NULL),
  -- Bundesliga
  ('bund_001', 'football', 'Bundesliga',   'Bayern Munich',      'Borussia Dortmund',  'live',     NOW() - INTERVAL '51 minutes',  3,   1,   51),
  ('bund_002', 'football', 'Bundesliga',   'RB Leipzig',         'Brentford',          'upcoming', NOW() + INTERVAL '4 hours',     NULL,NULL,NULL),
  -- Ligue 1
  ('ligue1_001', 'football', 'Ligue 1',   'Paris Saint-Germain','Marseille',           'live',     NOW() - INTERVAL '85 minutes',  2,   1,   85),
  ('ligue1_002', 'football', 'Ligue 1',   'Olympique Lyonnais', 'Monaco',              'upcoming', NOW() + INTERVAL '6 hours',     NULL,NULL,NULL),
  -- PSL South Africa
  ('psl_001', 'football', 'PSL',           'Mamelodi Sundowns',  'Kaizer Chiefs',      'live',     NOW() - INTERVAL '30 minutes',  1,   0,   30),
  ('psl_002', 'football', 'PSL',           'Orlando Pirates',    'AmaZulu FC',         'upcoming', NOW() + INTERVAL '3 hours',     NULL,NULL,NULL),
  ('psl_003', 'football', 'PSL',           'Stellenbosch FC',    'Cape Town City FC',  'upcoming', NOW() + INTERVAL '5 hours',     NULL,NULL,NULL),
  -- NBA
  ('nba_001', 'basketball', 'NBA',         'Los Angeles Lakers', 'Boston Celtics',     'live',     NOW() - INTERVAL '38 minutes',  98,  95,  NULL),
  ('nba_002', 'basketball', 'NBA',         'Golden State Warriors','Denver Nuggets',    'live',     NOW() - INTERVAL '42 minutes',  110, 108, NULL),
  ('nba_003', 'basketball', 'NBA',         'Miami Heat',         'Chicago Bulls',      'upcoming', NOW() + INTERVAL '4 hours',     NULL,NULL,NULL),
  ('nba_004', 'basketball', 'NBA',         'New York Knicks',    'Los Angeles Clippers','upcoming',NOW() + INTERVAL '6 hours',     NULL,NULL,NULL),
  -- ATP Tennis
  ('atp_001', 'tennis', 'ATP Tour',        'Novak Djokovic',     'Carlos Alcaraz',     'live',     NOW() - INTERVAL '90 minutes',  2,   0,   NULL),
  ('atp_002', 'tennis', 'ATP Tour',        'Jannik Sinner',      'Daniil Medvedev',    'live',     NOW() - INTERVAL '60 minutes',  1,   2,   NULL),
  ('atp_003', 'tennis', 'ATP Tour',        'Casper Ruud',        'Holger Rune',        'upcoming', NOW() + INTERVAL '3 hours',     NULL,NULL,NULL),
  -- Cricket
  ('cricket_001', 'cricket', 'Test Match', 'India Men',          'England Men',        'live',     NOW() - INTERVAL '6 hours',     287, 156, NULL),
  ('cricket_002', 'cricket', 'Test Match', 'Australia Women',    'India Women',        'upcoming', NOW() + INTERVAL '6 hours',     NULL,NULL,NULL),
  ('cricket_003', 'cricket', 'CSA T20',    'Dolphins',           'Titans',             'upcoming', NOW() + INTERVAL '4 hours',     NULL,NULL,NULL),
  -- Rugby
  ('rugby_001', 'rugby', 'URC',            'Stormers',           'Bulls',              'live',     NOW() - INTERVAL '40 minutes',  17,  10,  NULL),
  ('rugby_002', 'rugby', 'URC',            'Sharks',             'Lions',              'upcoming', NOW() + INTERVAL '3 hours',     NULL,NULL,NULL),
  -- NFL
  ('nfl_001', 'american_football', 'NFL',  'New England Patriots','Kansas City Chiefs','upcoming', NOW() + INTERVAL '5 hours',     NULL,NULL,NULL),
  ('nfl_002', 'american_football', 'NFL',  'Dallas Cowboys',     'Green Bay Packers',  'upcoming', NOW() + INTERVAL '8 hours',     NULL,NULL,NULL);

-- Step 3: Verify counts
SELECT
  status,
  COUNT(*) AS match_count
FROM public.matches
GROUP BY status
ORDER BY status;
