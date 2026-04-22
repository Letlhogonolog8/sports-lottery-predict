-- Seed lottery draws
INSERT INTO public.lottery_draws (name, next_draw, jackpot, numbers_range_min, numbers_range_max, pick_count) VALUES
('Powerball', NOW() + INTERVAL '3 days', '$785 Million', 1, 69, 5),
('Mega Millions', NOW() + INTERVAL '2 days', '$425 Million', 1, 70, 5),
('EuroMillions', NOW() + INTERVAL '2 days', '€190 Million', 1, 50, 5),
('UK Lotto', NOW() + INTERVAL '3 days', '£12.5 Million', 1, 59, 6);

-- Seed frequency data (Powerball)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 150 + 50) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 69) as num
WHERE name = 'Powerball';

-- Seed frequency data (Mega Millions)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 140 + 45) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 70) as num
WHERE name = 'Mega Millions';

-- Seed frequency data (EuroMillions)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 160 + 60) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 50) as num
WHERE name = 'EuroMillions';

-- Seed frequency data (UK Lotto)
INSERT INTO public.lottery_frequency (draw_id, number, frequency)
SELECT id, num, FLOOR(RANDOM() * 130 + 40) FROM public.lottery_draws, LATERAL GENERATE_SERIES(1, 59) as num
WHERE name = 'UK Lotto';

-- Seed hot numbers (Powerball)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23, 32, 61, 53, 69, 21]) as num
WHERE name = 'Powerball';

-- Seed cold numbers (Powerball)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[13, 36, 5, 49, 51, 60]) as num
WHERE name = 'Powerball';

-- Seed hot numbers (Mega Millions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[17, 31, 46, 10, 70, 14]) as num
WHERE name = 'Mega Millions';

-- Seed cold numbers (Mega Millions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[8, 45, 52, 67, 3, 29]) as num
WHERE name = 'Mega Millions';

-- Seed hot numbers (EuroMillions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[23, 44, 50, 17, 19, 38]) as num
WHERE name = 'EuroMillions';

-- Seed cold numbers (EuroMillions)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[22, 35, 46, 2, 9, 41]) as num
WHERE name = 'EuroMillions';

-- Seed hot numbers (UK Lotto)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'hot' FROM public.lottery_draws, UNNEST(ARRAY[58, 31, 38, 10, 23, 40]) as num
WHERE name = 'UK Lotto';

-- Seed cold numbers (UK Lotto)
INSERT INTO public.lottery_numbers (draw_id, number, classification)
SELECT id, num, 'cold' FROM public.lottery_draws, UNNEST(ARRAY[20, 13, 41, 48, 55, 6]) as num
WHERE name = 'UK Lotto';
 
-- Comprehensive Real-Time Fixtures for Multiple Leagues
-- Clear existing matches and insert comprehensive fixture data

-- Delete existing matches
DELETE FROM public.matches;

-- Premier League (England) - Multiple fixtures
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES
('pl_001', 'football', 'Premier League', 'Manchester City', 'Brighton', 'live', NOW(), 2, 1, 65),
('pl_002', 'football', 'Premier League', 'Arsenal', 'Tottenham', 'live', NOW(), 1, 1, 42),
('pl_003', 'football', 'Premier League', 'Chelsea', 'Manchester United', 'live', NOW() - INTERVAL '30 minutes', 0, 2, 78),
('pl_004', 'football', 'Premier League', 'Liverpool', 'Aston Villa', 'upcoming', NOW() + INTERVAL '45 minutes', NULL, NULL, NULL),
('pl_005', 'football', 'Premier League', 'Newcastle', 'Fulham', 'upcoming', NOW() + INTERVAL '90 minutes', NULL, NULL, NULL),
('pl_006', 'football', 'Premier League', 'West Ham', 'Everton', 'upcoming', NOW() + INTERVAL '2 hours', NULL, NULL, NULL),

-- La Liga (Spain)
('laliga_001', 'football', 'La Liga', 'Real Madrid', 'Barcelona', 'live', NOW(), 2, 2, 55),
('laliga_002', 'football', 'La Liga', 'Atletico Madrid', 'Valencia', 'live', NOW() - INTERVAL '15 minutes', 1, 0, 88),
('laliga_003', 'football', 'La Liga', 'Real Sociedad', 'Betis', 'upcoming', NOW() + INTERVAL '1 hour', NULL, NULL, NULL),
('laliga_004', 'football', 'La Liga', 'Sevilla', 'Villarreal', 'upcoming', NOW() + INTERVAL '3 hours', NULL, NULL, NULL),

-- Serie A (Italy)
('seriea_001', 'football', 'Serie A', 'Juventus', 'Inter Milan', 'live', NOW(), 1, 1, 72),
('seriea_002', 'football', 'Serie A', 'AC Milan', 'Roma', 'live', NOW() - INTERVAL '45 minutes', 2, 0, 90),
('seriea_003', 'football', 'Serie A', 'Napoli', 'Lazio', 'upcoming', NOW() + INTERVAL '2 hours', NULL, NULL, NULL),

-- Bundesliga (Germany)
('bundesliga_001', 'football', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', 'live', NOW(), 3, 1, 51),
('bundesliga_002', 'football', 'Bundesliga', 'RB Leipzig', 'Union Berlin', 'upcoming', NOW() + INTERVAL '1.5 hours', NULL, NULL, NULL),

-- Ligue 1 (France)
('ligue1_001', 'football', 'Ligue 1', 'Paris Saint-Germain', 'Marseille', 'live', NOW() - INTERVAL '20 minutes', 2, 1, 85),
('ligue1_002', 'football', 'Ligue 1', 'Lyon', 'Monaco', 'upcoming', NOW() + INTERVAL '2.5 hours', NULL, NULL, NULL),

-- NBA (Basketball - USA)
('nba_001', 'basketball', 'NBA', 'Los Angeles Lakers', 'Boston Celtics', 'live', NOW(), 98, 95, 38),
('nba_002', 'basketball', 'NBA', 'Golden State Warriors', 'Denver Nuggets', 'live', NOW() - INTERVAL '10 minutes', 110, 108, 42),
('nba_003', 'basketball', 'NBA', 'Miami Heat', 'Chicago Bulls', 'upcoming', NOW() + INTERVAL '3 hours', NULL, NULL, NULL),
('nba_004', 'basketball', 'NBA', 'New York Knicks', 'Los Angeles Clippers', 'upcoming', NOW() + INTERVAL '5 hours', NULL, NULL, NULL),

-- ATP Tennis
('atp_001', 'tennis', 'ATP', 'Novak Djokovic', 'Carlos Alcaraz', 'live', NOW(), 2, 0, NULL),
('atp_002', 'tennis', 'ATP', 'Jannik Sinner', 'Daniil Medvedev', 'live', NOW() - INTERVAL '1 hour', 1, 2, NULL),
('atp_003', 'tennis', 'ATP', 'Dominic Thiem', 'Casper Ruud', 'upcoming', NOW() + INTERVAL '2 hours', NULL, NULL, NULL),

-- Cricket (International Test)
('cricket_001', 'cricket', 'Test Match', 'India', 'England', 'live', NOW(), 287, 156, NULL),
('cricket_002', 'cricket', 'Test Match', 'Australia', 'Pakistan', 'upcoming', NOW() + INTERVAL '6 hours', NULL, NULL, NULL),
('cricket_003', 'cricket', 'Test Match', 'West Indies', 'South Africa', 'upcoming', NOW() + INTERVAL '12 hours', NULL, NULL, NULL),

-- American Football (NFL - USA)
('nfl_001', 'american_football', 'NFL', 'New England Patriots', 'Kansas City Chiefs', 'upcoming', NOW() + INTERVAL '4 hours', NULL, NULL, NULL),
('nfl_002', 'american_football', 'NFL', 'Dallas Cowboys', 'Green Bay Packers', 'upcoming', NOW() + INTERVAL '8 hours', NULL, NULL, NULL);
