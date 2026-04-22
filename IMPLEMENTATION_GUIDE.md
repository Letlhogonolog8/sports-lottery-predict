# Sports Lottery Prediction Platform - Implementation Guide

## Overview

This document describes the complete integration of AI-powered predictions, real-time sports data, and user authentication for the Sports Lottery Prediction platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  (Authentication, Predictions, Bet Slips, History)          │
└──────────────┬────────────────────────────────────────────────┘
               │
               ├── Real-time Subscriptions (WebSocket)
               └── API Calls
               │
┌──────────────▼────────────────────────────────────────────────┐
│                  Supabase Backend                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL)                                 │  │
│  │  - Users & Profiles                                    │  │
│  │  - Teams & Statistics                                  │  │
│  │  - Matches & Real-time Updates                         │  │
│  │  - AI Predictions                                      │  │
│  │  - User Bet Slips & History                            │  │
│  │  - Live Odds                                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Edge Functions (Deno)                                 │  │
│  │  - predict-match (Gemini API)                          │  │
│  │  - fetch-sports-data (Sports APIs)                     │  │
│  │  - refresh-live-data (Scheduled)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Auth & RLS (Row Level Security)                       │  │
│  │  - User authentication                                 │  │
│  │  - Data isolation per user                             │  │
│  │  - Public/private data policies                        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
               │
               └── External APIs
                   - Google Gemini 2.5 Flash
                   - Football-data.org
                   - SofaScore
                   - Sports data providers
```

## Implemented Features

### 1. User Authentication ✅

**Location**: `src/contexts/AuthContext.tsx`, `src/pages/Auth.tsx`

**Features**:
- Email/password registration
- Email/password login
- Session persistence
- User profile creation

**Implementation Details**:
```typescript
// Sign up
await signUp(email, password, username)

// Sign in
await signIn(email, password)

// Access current user
const { user, profile, isAuthenticated } = useAuth()
```

**Database Tables**:
- `user_profiles` - User account info and stats

### 2. AI Predictions with Gemini ✅

**Location**: `supabase/functions/predict-match/index.ts`

**Features**:
- Analyzes match data using Google Gemini 2.5 Flash
- Generates home win, draw, and away win probabilities
- Calculates confidence scores
- Identifies key factors influencing prediction
- Stores predictions in database

**Factors Analyzed**:
- Team form (last 5 matches)
- Head-to-head records
- Home/away performance
- Player availability
- Defensive strength
- Offensive strength
- Weather conditions
- Venue statistics

**Example Response**:
```json
{
  "homeWinProbability": 58.5,
  "drawProbability": 22.3,
  "awayWinProbability": 19.2,
  "confidenceScore": 75.8,
  "recommendedBet": "home_win",
  "factorsAnalyzed": {
    "formAdvantage": 12.5,
    "homeAdvantage": 8.3,
    "defensiveStrength": 72,
    "offensiveStrength": 68,
    "headToHeadTrend": 5
  }
}
```

### 3. Real-Time Sports Data ✅

**Location**: `supabase/functions/fetch-sports-data/index.ts`

**Features**:
- Fetches live match data from sports APIs
- Updates match scores, statistics, and status in real-time
- Broadcasts changes via WebSocket subscriptions
- Supports multiple sports and leagues

**Real-Time Subscriptions**:
```typescript
// Subscribe to live match updates
subscribeToLiveMatches((payload) => {
  // Handle match updates: scores, stats, status
})

// Subscribe to specific match
subscribeToMatchUpdates(matchId, (payload) => {
  // Handle individual match updates
})
```

**Supported Updates**:
- Score changes
- Match status (upcoming, live, finished)
- Player statistics
- Possession and shot data
- Corner and card information

### 4. Scheduled Data Refresh ✅

**Location**: `supabase/functions/refresh-live-data/index.ts`

**Features**:
- Automatically refreshes live match data at intervals
- Updates statistics and scores
- Broadcasts real-time updates to all connected clients
- Can be deployed as a cron job

**Deployment Options**:
1. Supabase Cron (built-in)
2. GitHub Actions
3. AWS Lambda
4. Vercel Cron
5. External scheduler (n8n, Zapier)

### 5. User Bet Slips & Prediction History ✅

**Location**: `src/pages/PredictionHistory.tsx`, `src/lib/supabase.ts`

**Features**:
- Save predictions for matches
- Track win/loss records
- Calculate overall accuracy
- Display profit/loss
- Bet slip management

**Statistics Tracked**:
- Total predictions made
- Number of wins
- Number of losses
- Win percentage (accuracy)
- Profit/loss tracking

**Database Tables**:
- `bet_slips` - Individual user predictions
- `prediction_history` - Historical record

### 6. Components Created

#### MatchPredictionCard
**Location**: `src/components/MatchPredictionCard.tsx`

Displays:
- Match details
- AI-generated probabilities
- Confidence score with progress bar
- Recommended bet
- Key factors analysis
- Bet slip creation form

#### PredictionHistory
**Location**: `src/pages/PredictionHistory.tsx`

Displays:
- User statistics dashboard
- Filterable bet slip table
- Win/loss/pending status
- Profit/loss calculations
- Date filtering

## Database Schema

### User Management
```sql
user_profiles (
  id UUID,
  username TEXT UNIQUE,
  email TEXT,
  total_predictions INT,
  wins INT,
  losses INT,
  accuracy_percentage DECIMAL
)
```

### Match Data
```sql
matches (
  id UUID,
  match_id TEXT UNIQUE,
  sport TEXT,
  league TEXT,
  home_team_name TEXT,
  away_team_name TEXT,
  home_score INT,
  away_score INT,
  status TEXT,
  start_time TIMESTAMP,
  minute INT,
  -- Stats fields
  possession_home DECIMAL,
  possession_away DECIMAL,
  shots_home INT,
  shots_away INT,
  ...
)
```

### Predictions
```sql
match_predictions (
  id UUID,
  match_id UUID,
  home_win_probability DECIMAL,
  draw_probability DECIMAL,
  away_win_probability DECIMAL,
  confidence_score DECIMAL,
  recommended_bet TEXT,
  factors_analyzed JSONB
)
```

### User Predictions
```sql
bet_slips (
  id UUID,
  user_id UUID,
  match_id UUID,
  prediction_type TEXT,
  odds DECIMAL,
  stake DECIMAL,
  status TEXT,
  profit_loss DECIMAL
)
```

## Setup Instructions

### 1. Database Setup
```bash
# Run migration in Supabase SQL Editor
# Copy content of: supabase/migrations/001_initial_schema.sql
```

### 2. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
GOOGLE_API_KEY=your_google_api_key
```

### 3. Deploy Edge Functions
```bash
npm install -g supabase
supabase link --project-ref your_project_id
supabase functions deploy predict-match
supabase functions deploy fetch-sports-data
supabase functions deploy refresh-live-data
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

## API Endpoints

### Predict Match
```
POST /functions/v1/predict-match

Request:
{
  "matchId": "match123",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "league": "Premier League",
  "sport": "football",
  "homeTeamStats": {...},
  "awayTeamStats": {...}
}

Response:
{
  "homeWinProbability": 58.5,
  "drawProbability": 22.3,
  "awayWinProbability": 19.2,
  "confidenceScore": 75.8,
  "recommendedBet": "home_win",
  "factorsAnalyzed": {...}
}
```

### Fetch Sports Data
```
POST /functions/v1/fetch-sports-data

Response:
{
  "success": true,
  "matchesUpdated": 5,
  "timestamp": "2026-01-15T12:00:00Z"
}
```

### Real-Time Subscriptions
```typescript
// Subscribe to all live matches
subscribeToLiveMatches(callback)

// Subscribe to specific match
subscribeToMatchUpdates(matchId, callback)

// Subscribe to user's bet slips
subscribeToUserBetSlips(userId, callback)
```

## Usage Examples

### Generate Prediction for a Match
```typescript
import { predictMatch } from '@/lib/supabase'

const prediction = await predictMatch({
  matchId: 'match123',
  homeTeam: 'Manchester City',
  awayTeam: 'Liverpool',
  league: 'Premier League',
  sport: 'football'
})
```

### Save a Bet Slip
```typescript
import { saveBetSlip } from '@/lib/supabase'

await saveBetSlip(
  userId,
  matchId,
  'home_win',  // prediction type
  1.85,         // odds
  50            // stake in dollars
)
```

### Get User Prediction History
```typescript
import { getUserBetSlips } from '@/lib/supabase'

const bets = await getUserBetSlips(userId, 50)
```

### Subscribe to Live Updates
```typescript
import { subscribeToMatchUpdates } from '@/lib/supabase'

const subscription = subscribeToMatchUpdates(matchId, (payload) => {
  console.log('Match updated:', payload)
})

// Cleanup
subscription.unsubscribe()
```

## Security Features

### Row Level Security (RLS)
- Users can only view their own predictions
- Public data (matches, predictions) visible to all
- Teams and stats are publicly readable

### Authentication
- Supabase Auth handles password security
- JWT tokens for session management
- Automatic session persistence

### API Security
- Edge functions validate API keys
- CORS headers configured
- Rate limiting recommended for production

## Performance Optimizations

### Database Indexes
- `matches(status)` - Fast live match filtering
- `matches(start_time)` - Fast upcoming match sorting
- `bet_slips(user_id, status)` - Fast user bet lookup
- `prediction_history(user_id, created_at)` - Fast history access

### Caching
- React Query for client-side caching
- Automatic refetch on window focus
- Real-time updates via WebSocket

### Real-Time Updates
- Postgres LISTEN/NOTIFY
- WebSocket broadcasting
- Automatic client reconnection

## Testing

### Manual Testing Checklist
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] View live matches
- [ ] Generate AI prediction
- [ ] Save bet slip with stake
- [ ] Navigate to prediction history
- [ ] Verify stats display correctly
- [ ] Test real-time updates (open 2 tabs)
- [ ] Check mobile responsiveness

### Automated Testing
```bash
npm run test
```

## Monitoring & Logging

### Supabase Dashboard
- View edge function logs
- Monitor database performance
- Check auth usage
- Review real-time subscriptions

### Browser DevTools
- Network tab: Monitor API calls
- Console: Check for errors
- Application: Verify auth tokens
- Elements: Check component state

## Production Deployment

### Frontend
```bash
npm run build
# Deploy to Vercel, Netlify, or custom server
```

### Database
- Enable SSL connections
- Configure backups
- Set up monitoring alerts
- Review RLS policies

### Edge Functions
- Set environment variables in Supabase dashboard
- Monitor function logs
- Set up error alerting

## Common Issues & Solutions

### "Gemini API not working"
- Verify `GOOGLE_API_KEY` is set in edge function
- Check API key has Generative AI access
- Check API usage limits

### "Real-time updates not showing"
- Verify WebSocket connection in browser
- Check RLS policies allow SELECT
- Ensure subscription is active

### "Predictions not saving"
- Check user is authenticated
- Verify match exists in database
- Check error in browser console

### "Performance slow"
- Check database query performance
- Enable indexes
- Reduce real-time subscription frequency

## Future Enhancements

1. **Machine Learning**
   - Train custom model on historical data
   - Fine-tune predictions over time

2. **Integrations**
   - More sports API providers
   - Payment processing (betting)
   - SMS/email notifications

3. **Features**
   - Betting leaderboards
   - Social sharing
   - Advanced filtering
   - Mobile app

4. **Monetization**
   - Subscription tiers
   - Premium predictions
   - Sponsored odds

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **React Query**: https://tanstack.com/query/latest
- **Shadcn/ui**: https://ui.shadcn.com

## License

Project-specific license information.
