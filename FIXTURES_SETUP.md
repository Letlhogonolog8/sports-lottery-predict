# Real-Time Fixtures Setup Guide

## Overview
The app now includes realistic match fixtures across multiple sports and leagues with real-time simulation.

## Available Fixtures

### Football/Soccer
**Premier League (England)**
- Manchester City vs Brighton (Live)
- Arsenal vs Tottenham (Live)
- Chelsea vs Manchester United (Live)
- Liverpool vs Aston Villa (Upcoming)
- Newcastle vs Fulham (Upcoming)
- West Ham vs Everton (Upcoming)

**La Liga (Spain)**
- Real Madrid vs Barcelona (Live)
- Atletico Madrid vs Valencia (Live)
- Real Sociedad vs Betis (Upcoming)
- Sevilla vs Villarreal (Upcoming)

**Serie A (Italy)**
- Juventus vs Inter Milan (Live)
- AC Milan vs Roma (Live)
- Napoli vs Lazio (Upcoming)

**Bundesliga (Germany)**
- Bayern Munich vs Borussia Dortmund (Live)
- RB Leipzig vs Union Berlin (Upcoming)

**Ligue 1 (France)**
- Paris Saint-Germain vs Marseille (Live)
- Lyon vs Monaco (Upcoming)

### Basketball
**NBA**
- Los Angeles Lakers vs Boston Celtics (Live)
- Golden State Warriors vs Denver Nuggets (Live)
- Miami Heat vs Chicago Bulls (Upcoming)
- New York Knicks vs Los Angeles Clippers (Upcoming)

### Tennis
**ATP**
- Novak Djokovic vs Carlos Alcaraz (Live)
- Jannik Sinner vs Daniil Medvedev (Live)
- Dominic Thiem vs Casper Ruud (Upcoming)

### Cricket
**Test Matches**
- India vs England (Live)
- Australia vs Pakistan (Upcoming)
- West Indies vs South Africa (Upcoming)

### American Football
**NFL**
- New England Patriots vs Kansas City Chiefs (Upcoming)
- Dallas Cowboys vs Green Bay Packers (Upcoming)

## Setup Instructions

### 1. Load Initial Fixtures

Run the SQL file to populate your Supabase database with all fixtures:

```bash
# Using Supabase CLI
supabase db push seed-fixtures.sql

# Or manually in Supabase SQL Editor
# Copy contents of seed-fixtures.sql and execute
```

### 2. Enable Real-Time Simulation

The app automatically:
- ✅ Starts live match simulation on app load
- ✅ Updates match scores every 30 seconds
- ✅ Progresses matches from upcoming to live when start time arrives
- ✅ Simulates realistic goals (5% chance per minute)
- ✅ Auto-ends matches at 90 minutes

### 3. Real-Time Updates

The app uses Supabase real-time subscriptions:
- Live score updates flow in real-time via websocket
- UI updates automatically without page refresh
- Match status changes are instant (upcoming → live → finished)

## Match Simulation Features

### What Gets Simulated:
1. **Match Progression**: Minute counter advances
2. **Goals**: Random goals with ~5% probability per minute
3. **Match Status**: Auto-transitions (upcoming → live → finished)
4. **Key Stats**: Possession, shots, shots on target, corners
5. **Momentum**: Calculated from current score

### Simulation Update Frequency:
- Every 30 seconds in background
- Real-time websocket push to all connected clients
- Last update timestamp shown on UI

## Customization

### Add New Matches

```sql
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES
('custom_001', 'football', 'League Name', 'Home Team', 'Away Team', 'live', NOW(), 0, 0, 0);
```

### Modify Simulation Frequency

Edit `src/lib/matchSimulator.ts`:
```typescript
}, 30000); // Change 30000 (ms) to desired interval
```

### Adjust Goal Probability

Edit `src/lib/matchSimulator.ts`:
```typescript
if (Math.random() < 0.05) { // Change 0.05 to desired probability
```

## API Integration Ready

When you're ready to use real API data instead of simulation:

1. Replace `seed-fixtures.sql` with live API data from:
   - **Football API**: API-Football, ESPN, TheSportsDB
   - **Basketball**: NBA Official API
   - **Tennis**: ATP Official API
   - **Cricket**: ESPN Cricinfo API

2. Update `src/lib/supabase.ts` functions to fetch from real APIs

3. Disable simulation in `AppLayout.tsx`:
```typescript
// Comment out or remove these lines:
// promoteUpcomingToLive();
// const simulationInterval = startLiveMatchSimulation();
```

## Database Schema

All match data is stored with these fields:
```typescript
{
  match_id: string;
  sport: string;
  league: string;
  home_team_name: string;
  away_team_name: string;
  status: 'upcoming' | 'live' | 'finished';
  start_time: datetime;
  home_score: number;
  away_score: number;
  minute?: number;
  prediction?: { homeWin, draw, awayWin, confidence };
  odds?: { homeWin, draw, awayWin };
  momentum?: 'home' | 'away' | 'neutral';
  keyStats?: { possession, shots, shotsOnTarget, corners };
}
```

## Testing

To test real-time updates:

1. Open app in 2 browser windows
2. Watch matches update every 30 seconds
3. Scores change in real-time across all windows
4. Upcoming matches transition to live automatically

## Troubleshooting

**Matches not updating?**
- Check browser console for errors
- Verify Supabase real-time is enabled
- Check database has matches with `status = 'live'`

**No live matches showing?**
- Run `seed-fixtures.sql` to populate initial data
- Check current time vs `start_time` in database

**Simulation not working?**
- Verify `startLiveMatchSimulation()` is called in AppLayout.tsx
- Check browser console for errors
- Ensure Supabase database is accessible
