-- ================================================================
-- UPDATE THIS WITH REAL MATCHES FROM FLASHSCORE/ESPN/BBC SPORT
-- ================================================================
-- 
-- Instructions:
-- 1. Go to Flashscore.com or ESPN.com
-- 2. Find LIVE matches happening RIGHT NOW
-- 3. Copy team names and scores below
-- 4. Paste into Supabase SQL Editor
-- 5. Click RUN
--
-- Format: (match_id, sport, league, home_team, away_team, status, home_score, away_score, minute)
--
-- ================================================================

DELETE FROM public.matches;

-- EXAMPLE TEMPLATE (Update these with REAL data):
-- INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES

-- SERIE A - REPLACE WITH REAL TEAMS
('serie_a_001', 'football', 'Serie A', 'Juventus', 'Roma', 'live', NOW(), 2, 0, 65),
('serie_a_002', 'football', 'Serie A', 'Inter Milan', 'Napoli', 'live', NOW(), 1, 1, 42),
('serie_a_003', 'football', 'Serie A', 'AC Milan', 'Lazio', 'live', NOW(), 2, 1, 78),

-- PREMIER LEAGUE - REPLACE WITH REAL TEAMS
('prem_001', 'football', 'Premier League', 'Manchester City', 'Everton', 'live', NOW(), 2, 0, 67),
('prem_002', 'football', 'Premier League', 'Liverpool', 'Brighton', 'live', NOW(), 1, 1, 45),
('prem_003', 'football', 'Premier League', 'Arsenal', 'Chelsea', 'live', NOW(), 2, 1, 72),

-- LA LIGA - REPLACE WITH REAL TEAMS
('laliga_001', 'football', 'La Liga', 'Real Madrid', 'Atletico Madrid', 'live', NOW(), 2, 1, 58),
('laliga_002', 'football', 'La Liga', 'Barcelona', 'Valencia', 'live', NOW(), 3, 0, 82),

-- BUNDESLIGA - REPLACE WITH REAL TEAMS
('buli_001', 'football', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', 'live', NOW(), 3, 1, 61),

-- NBA - REPLACE WITH REAL TEAMS/SCORES
('nba_001', 'basketball', 'NBA', 'Los Angeles Lakers', 'Boston Celtics', 'live', NOW(), 98, 95, 38),
('nba_002', 'basketball', 'NBA', 'Golden State Warriors', 'Denver Nuggets', 'live', NOW(), 110, 108, 42),

-- UPCOMING MATCHES (Optional - add upcoming matches if needed)
('upcoming_001', 'football', 'Premier League', 'Manchester United', 'Tottenham', 'upcoming', NOW() + INTERVAL '45 minutes', NULL, NULL, NULL);

-- ================================================================
-- HOW TO FIND REAL DATA:
-- ================================================================
-- 
-- 1. Open Flashscore.com (BEST - all sports, live scores)
-- 2. Find matches with LIVE badge or current scores
-- 3. Copy: Home Team, Away Team, Current Score, Current Minute
-- 4. Paste into INSERT statements above
--
-- EXAMPLE from Flashscore today:
-- Serie A
-- ⚽ Juventus 2 - 0 Roma (Live 65')  →  ('id', 'football', 'Serie A', 'Juventus', 'Roma', 'live', NOW(), 2, 0, 65)
-- ⚽ Inter 1 - 1 Napoli (Live 42')   →  ('id', 'football', 'Serie A', 'Inter Milan', 'Napoli', 'live', NOW(), 1, 1, 42)
--
-- ================================================================

