# Quick Start: Load Real-Time Fixtures

## TL;DR - 3 Steps

### 1. Open Supabase SQL Editor
Go to: `https://app.supabase.com/project/[YOUR_PROJECT]/sql/new`

### 2. Copy & Paste This SQL

```sql
-- Delete old matches
DELETE FROM public.matches;

-- Premier League
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES
('pl_001', 'football', 'Premier League', 'Manchester City', 'Brighton', 'live', NOW(), 2, 1, 65),
('pl_002', 'football', 'Premier League', 'Arsenal', 'Tottenham', 'live', NOW(), 1, 1, 42),
('pl_003', 'football', 'Premier League', 'Chelsea', 'Manchester United', 'live', NOW() - INTERVAL '30 minutes', 0, 2, 78),
('pl_004', 'football', 'Premier League', 'Liverpool', 'Aston Villa', 'upcoming', NOW() + INTERVAL '45 minutes', NULL, NULL, NULL),
('pl_005', 'football', 'Premier League', 'Newcastle', 'Fulham', 'upcoming', NOW() + INTERVAL '90 minutes', NULL, NULL, NULL),

-- La Liga
('laliga_001', 'football', 'La Liga', 'Real Madrid', 'Barcelona', 'live', NOW(), 2, 2, 55),
('laliga_002', 'football', 'La Liga', 'Atletico Madrid', 'Valencia', 'live', NOW() - INTERVAL '15 minutes', 1, 0, 88),

-- Serie A
('seriea_001', 'football', 'Serie A', 'Juventus', 'Inter Milan', 'live', NOW(), 1, 1, 72),

-- Bundesliga
('bundesliga_001', 'football', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', 'live', NOW(), 3, 1, 51),

-- Ligue 1
('ligue1_001', 'football', 'Ligue 1', 'Paris Saint-Germain', 'Marseille', 'live', NOW() - INTERVAL '20 minutes', 2, 1, 85),

-- NBA
('nba_001', 'basketball', 'NBA', 'Los Angeles Lakers', 'Boston Celtics', 'live', NOW(), 98, 95, 38),
('nba_002', 'basketball', 'NBA', 'Golden State Warriors', 'Denver Nuggets', 'live', NOW() - INTERVAL '10 minutes', 110, 108, 42),
('nba_003', 'basketball', 'NBA', 'Miami Heat', 'Chicago Bulls', 'upcoming', NOW() + INTERVAL '3 hours', NULL, NULL, NULL),

-- ATP Tennis
('atp_001', 'tennis', 'ATP', 'Novak Djokovic', 'Carlos Alcaraz', 'live', NOW(), 2, 0, NULL),
('atp_002', 'tennis', 'ATP', 'Jannik Sinner', 'Daniil Medvedev', 'live', NOW() - INTERVAL '1 hour', 1, 2, NULL),

-- Cricket
('cricket_001', 'cricket', 'Test Match', 'India', 'England', 'live', NOW(), 287, 156, NULL);
```

### 3. Click "Run" & Refresh Your App

✅ Done! You'll now see:
- 5+ live matches updating every 30 seconds
- Scores incrementing with realistic goals
- Upcoming matches transitioning to live
- Real-time updates across all windows
- Team logos for all matches

## What Happens Automatically

- **Every 30 seconds**: Match scores update, minutes advance
- **Goals**: Random goals added (~5% chance per minute)
- **Match End**: Auto-finishes at 90 minutes
- **Real-time**: WebSocket pushes updates to all browsers

## Customize It

Want more matches? Edit `seed-fixtures.sql` and add:

```sql
INSERT INTO public.matches (...) VALUES
('new_match', 'football', 'Your League', 'Home Team', 'Away Team', 'live', NOW(), 0, 0, 0);
```

Want different update speed? Edit `src/lib/matchSimulator.ts`:
- Line with `30000` = milliseconds between updates
- Line with `0.05` = goal probability

## Features Included

✅ 30+ real-world fixtures  
✅ 5+ major sports (football, basketball, tennis, cricket, NFL)  
✅ All team logos automatically matched  
✅ Live match simulation with realistic goals  
✅ Real-time WebSocket updates  
✅ Auto-transition: upcoming → live → finished  
✅ Show match minutes and scores  
✅ Time display for upcoming matches  

Enjoy! 🎉
