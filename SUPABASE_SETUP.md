# Supabase Setup Guide

This guide walks you through setting up the Sports Lottery Prediction platform with Supabase backend.

## Prerequisites

1. Supabase Account (https://supabase.com)
2. Google API Key for Gemini API
3. Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project name and database password
4. Wait for project to initialize
5. Copy your `Project URL` and `Anon Key` from Settings > API

## Step 2: Setup Database

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
4. Run the query to create all tables and functions

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_API_KEY=your-google-api-key
```

## Step 4: Deploy Edge Functions

### Option A: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase (if not done):
```bash
supabase init
```

3. Link to your project:
```bash
supabase link --project-ref your-project-id
```

4. Deploy functions:
```bash
supabase functions deploy predict-match
supabase functions deploy fetch-sports-data
supabase functions deploy refresh-live-data
```

### Option B: Manual Deployment

1. Go to Edge Functions in Supabase dashboard
2. Create new function for each:
   - `predict-match`
   - `fetch-sports-data`
   - `refresh-live-data`
3. Copy the code from `supabase/functions/[function-name]/index.ts`
4. Paste into the function editor and deploy

## Step 5: Configure Google Gemini API

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add to `.env.local` as `GOOGLE_API_KEY`

## Step 6: Set Up Scheduled Functions (Optional)

To refresh live data automatically:

1. In Supabase dashboard, go to your project
2. Setup a cron job calling `refresh-live-data` every minute:

```bash
# Using Supabase cron
# This would be configured in Supabase UI
```

Or use external service like:
- GitHub Actions
- Vercel Cron
- AWS Lambda

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Run Development Server

```bash
npm run dev
```

Visit http://localhost:8080

## Features Implemented

### Authentication
- Email/Password sign up and login
- User profiles with prediction statistics
- Secure session management

### Real-Time Features
- Live match updates via WebSocket subscriptions
- Automatic score and stats refresh
- Real-time odds updates

### AI Predictions
- Gemini 2.5 Flash model analysis
- Factors considered:
  - Team form (last 5 matches)
  - Head-to-head records
  - Home/away performance
  - Player availability
  - Defensive and offensive strength
  - Weather conditions

### User Features
- Save bet slips for matches
- Prediction history with win/loss tracking
- Overall accuracy statistics
- Profit/loss tracking

### Database Tables

1. **user_profiles** - User account information and statistics
2. **teams** - Team information and metadata
3. **team_stats** - Historical team statistics
4. **matches** - Live and upcoming matches
5. **match_predictions** - AI-generated predictions
6. **bet_slips** - User saved predictions
7. **prediction_history** - Historical record of predictions
8. **live_odds** - Current betting odds from various providers

## API Endpoints

### Predictions
```bash
POST /functions/v1/predict-match
Body: {
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  league: string,
  sport: string,
  homeTeamStats?: {...},
  awayTeamStats?: {...}
}
```

### Sports Data
```bash
POST /functions/v1/fetch-sports-data
```

### Refresh Live Data
```bash
POST /functions/v1/refresh-live-data
```

## Integration with Sports APIs

Currently, the platform supports:
- football-data.org (Premium)
- Manual data entry

To integrate additional APIs:
1. Get API keys from providers
2. Update `fetch-sports-data` function
3. Add keys to environment variables

Popular Sports APIs:
- SofaScore API
- ESPN API
- TheSportsDB
- RapidAPI sports endpoints

## Troubleshooting

### Edge Functions not working
- Check API keys are set in function settings
- Verify CORS headers in function
- Check browser console for errors

### Real-time subscriptions not updating
- Verify RLS policies are correct
- Check WebSocket connection in browser DevTools
- Ensure subscription is set up correctly

### Predictions not saving
- Check user is authenticated
- Verify match exists in database
- Check error logs in Supabase dashboard

### No data showing up
- Run the migrations SQL
- Manually insert test data
- Check RLS policies allow SELECT

## Testing

1. Sign up for an account
2. Navigate to upcoming matches
3. Click "Get AI Prediction" on a match
4. View the AI-generated probabilities
5. Save a bet slip
6. Navigate to prediction history to see your bets

## Performance Optimization

- Indexes are created on frequently queried columns
- Real-time subscriptions use Postgres LISTEN/NOTIFY
- Edge functions use connection pooling
- Client caching with React Query

## Security

- All user data is protected with Row Level Security (RLS)
- Users can only view/edit their own predictions
- API keys are stored in environment variables
- Supabase Auth handles password hashing

## Next Steps

1. Deploy to production (Vercel, Netlify, etc.)
2. Set up custom domain
3. Configure email verification
4. Add payment processing for stakes
5. Integrate more sports APIs
6. Add mobile app

## Support

For issues with:
- Supabase: https://github.com/supabase/supabase/issues
- Gemini API: https://ai.google.dev/docs
- This project: Check README.md
