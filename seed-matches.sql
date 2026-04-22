-- Seed sample matches
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time) VALUES
('match_001', 'football', 'Premier League', 'Manchester United', 'Arsenal', 'live', NOW()),
('match_002', 'football', 'Premier League', 'Liverpool', 'Chelsea', 'live', NOW()),
('match_003', 'football', 'La Liga', 'Real Madrid', 'Barcelona', 'upcoming', NOW() + INTERVAL '1 hour'),
('match_004', 'basketball', 'NBA', 'Lakers', 'Celtics', 'upcoming', NOW() + INTERVAL '2 hours'),
('match_005', 'tennis', 'ATP', 'Djokovic', 'Alcaraz', 'live', NOW()),
('match_006', 'cricket', 'Test', 'India', 'England', 'upcoming', NOW() + INTERVAL '3 hours');
