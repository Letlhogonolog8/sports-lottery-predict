# Setup Checklist

Complete this checklist to get the platform fully operational.

## Phase 1: Project Setup (5 minutes)

- [ ] Clone repository or navigate to project folder
- [ ] Run `npm install` to install dependencies
- [ ] Verify build succeeds with `npm run build`
- [ ] Check no TypeScript errors exist

## Phase 2: Supabase Setup (15 minutes)

### Create Supabase Project
- [ ] Go to https://app.supabase.com
- [ ] Sign up/Login
- [ ] Click "New Project"
- [ ] Enter project name
- [ ] Choose region (closest to you)
- [ ] Set strong database password
- [ ] Wait for project to initialize (~3 minutes)

### Get API Keys
- [ ] Open project settings
- [ ] Go to "API" tab
- [ ] Copy **Project URL** (e.g., `https://xyz.supabase.co`)
- [ ] Copy **Anon Key** (public key)
- [ ] Save both for later

### Run Database Migration
- [ ] Go to "SQL Editor" in Supabase dashboard
- [ ] Click "+ New Query"
- [ ] Open `supabase/migrations/001_initial_schema.sql`
- [ ] Copy entire content
- [ ] Paste into SQL Editor
- [ ] Click "Run" button
- [ ] Wait for migration to complete (should see "Tables created")
- [ ] Verify tables appear in "Table Editor" view

### Enable Real-Time
- [ ] Go to "Database" > "Replication"
- [ ] Enable replication for:
  - [ ] `matches`
  - [ ] `match_predictions`
  - [ ] `bet_slips`
  - [ ] `prediction_history`

## Phase 3: Google Gemini API Setup (5 minutes)

### Get API Key
- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Sign in with Google account
- [ ] Click "Create API Key"
- [ ] Copy the generated key
- [ ] Save for later

### Verify API Key
- [ ] Test in free trial: https://aistudio.google.com
- [ ] Verify you can make API calls
- [ ] Check API has sufficient quota

## Phase 4: Environment Configuration (3 minutes)

### Create Environment File
- [ ] Create `.env.local` file in project root
- [ ] Add the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_API_KEY=your-google-api-key
```

- [ ] Replace values with your actual keys
- [ ] **DO NOT** commit `.env.local` to Git
- [ ] Verify `.gitignore` includes `.env.local`

## Phase 5: Deploy Edge Functions (10 minutes)

### Option A: Using Supabase CLI (Recommended)

- [ ] Install CLI: `npm install -g supabase`
- [ ] Authenticate: `supabase login`
- [ ] Link to project: `supabase link --project-ref your-project-id`
- [ ] Get Project ID from: https://app.supabase.com/project/[ID]/settings/general
- [ ] Deploy functions:
  - [ ] `supabase functions deploy predict-match --no-verify-jwt`
  - [ ] `supabase functions deploy fetch-sports-data --no-verify-jwt`
  - [ ] `supabase functions deploy refresh-live-data --no-verify-jwt`
- [ ] Verify deployment in Supabase dashboard

### Option B: Manual Deployment

If CLI doesn't work, use the dashboard:

- [ ] Go to "Edge Functions" in Supabase dashboard
- [ ] For each function:
  - [ ] Click "Create function"
  - [ ] Enter function name (e.g., `predict-match`)
  - [ ] Delete template code
  - [ ] Copy code from `supabase/functions/[name]/index.ts`
  - [ ] Paste into editor
  - [ ] Click "Deploy"
  - [ ] Go to function settings
  - [ ] Add environment variable:
    - Name: `GOOGLE_API_KEY`
    - Value: Your Google API key

## Phase 6: Test Backend Functions (5 minutes)

### Test Predict-Match Function

1. In Supabase dashboard, go to Edge Functions
2. Click on `predict-match`
3. Click "Invoke" button
4. In request body, enter:
```json
{
  "matchId": "test123",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "league": "Test League",
  "sport": "football"
}
```
5. Click "Invoke"
6. Should see prediction response with probabilities
7. If error, check:
   - [ ] Google API key is set correctly
   - [ ] API key has Generative AI access
   - [ ] No typos in function code

### Test Fetch-Sports-Data Function

1. Click on `fetch-sports-data`
2. Click "Invoke" with empty body
3. Should return success response
4. Check database shows test data inserted

## Phase 7: Local Development (3 minutes)

### Start Dev Server
- [ ] Open terminal in project root
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:8080 in browser
- [ ] Should see platform homepage
- [ ] Verify theme loads (dark mode by default)

### Check Console for Errors
- [ ] Open browser DevTools (F12)
- [ ] Check "Console" tab
- [ ] Should have no red errors
- [ ] May have yellow warnings (OK)

## Phase 8: Test Core Features (10 minutes)

### Authentication
- [ ] Click "Auth" or navigate to `/auth`
- [ ] Go to "Sign Up" tab
- [ ] Fill form:
  - [ ] Username: `testuser`
  - [ ] Email: `test@example.com`
  - [ ] Password: `TestPassword123!`
  - [ ] Confirm: `TestPassword123!`
- [ ] Click "Sign Up"
- [ ] Should see success toast
- [ ] Should redirect to dashboard
- [ ] Check user created in Supabase dashboard > Auth > Users

### Test Sign In
- [ ] Click sign out (if logged in)
- [ ] Click "Auth"
- [ ] Go to "Sign In" tab
- [ ] Enter credentials from above
- [ ] Click "Sign In"
- [ ] Should see dashboard

### Test Predictions
- [ ] Find a match on dashboard
- [ ] Click "Get AI Prediction"
- [ ] Wait 2-5 seconds
- [ ] Should see probabilities:
  - [ ] Home Win %
  - [ ] Draw %
  - [ ] Away Win %
  - [ ] Confidence score
  - [ ] Factors analyzed
- [ ] Click on a probability button
- [ ] Enter stake amount (e.g., 10)
- [ ] Click "Save to Bet Slip"
- [ ] Should see success toast

### Test Prediction History
- [ ] Navigate to `/history`
- [ ] Should see:
  - [ ] Total predictions
  - [ ] Wins count
  - [ ] Losses count
  - [ ] Accuracy percentage
  - [ ] Table of bet slips
- [ ] Should show the prediction you just saved

### Test Real-Time Updates
- [ ] Open browser dev tools: F12 > Application > Cookies
- [ ] Verify auth session cookie exists
- [ ] In one tab, navigate to match
- [ ] In another tab, open same match
- [ ] Simulate score update (manual or API)
- [ ] Both tabs should update simultaneously

## Phase 9: Testing Checklist Summary

### Sign Up/Login
- [ ] User registration works
- [ ] Email validation works
- [ ] Login with credentials works
- [ ] Session persists on refresh
- [ ] Sign out clears session

### Dashboard
- [ ] Live matches display
- [ ] Upcoming matches display
- [ ] Match cards show info
- [ ] Can filter by sport

### Predictions
- [ ] Can generate predictions
- [ ] Probabilities show
- [ ] Confidence score displays
- [ ] Factors appear
- [ ] Can save bet slip

### History Page
- [ ] Stats display correctly
- [ ] Bet slip table shows
- [ ] Can filter by status
- [ ] Dates format correctly

### Real-Time
- [ ] Updates appear without refresh
- [ ] Multiple tabs stay in sync
- [ ] No lag in updates
- [ ] WebSocket connection stable

## Phase 10: Optional Enhancements

### Add Real Sports Data
- [ ] Register at https://www.football-data.org
- [ ] Get free API key
- [ ] Add to `.env.local`:
  ```env
  FOOTBALL_DATA_API_KEY=your_key
  ```
- [ ] Update `fetch-sports-data` function
- [ ] Deploy updated function

### Add Email Notifications
- [ ] Setup Supabase Email (Configuration > Email Templates)
- [ ] Update auth settings for email confirmations
- [ ] Create email templates
- [ ] Test email sending

### Setup Cron Jobs for Refresh
- [ ] Deploy refresh function
- [ ] Setup external scheduler:
  - [ ] GitHub Actions
  - [ ] Vercel Cron
  - [ ] AWS Lambda + EventBridge
  - [ ] n8n Automation
- [ ] Run every 1 minute

## Phase 11: Deployment Preparation

### Build for Production
- [ ] Run `npm run build`
- [ ] Check build succeeds without errors
- [ ] Verify `dist/` folder created
- [ ] Check bundle size (~950KB gzipped)

### Prepare Deployment
Choose one:

#### Deploy to Vercel
- [ ] Create account at https://vercel.com
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run: `vercel`
- [ ] Follow prompts
- [ ] Set environment variables in Vercel dashboard

#### Deploy to Netlify
- [ ] Create account at https://netlify.com
- [ ] Connect Git repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Set environment variables

#### Deploy to Custom Server
- [ ] Run `npm run build`
- [ ] Copy `dist/` folder to server
- [ ] Configure web server (nginx/apache)
- [ ] Setup SSL certificate
- [ ] Point domain to server

## Phase 12: Final Verification

### Before Going Live
- [ ] [ ] All tests pass
- [ ] [ ] No console errors
- [ ] [ ] Authentication works
- [ ] [ ] Predictions generate
- [ ] [ ] Real-time updates work
- [ ] [ ] History page displays stats
- [ ] [ ] Mobile responsive
- [ ] [ ] Dark mode works
- [ ] [ ] Build is optimized
- [ ] [ ] Environment variables set

### Security Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] API keys not hardcoded anywhere
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] RLS policies enabled in DB
- [ ] User data isolated per user
- [ ] Passwords hashed
- [ ] Sessions expire appropriately

### Performance Checklist
- [ ] Predictions generation < 10s
- [ ] Real-time updates < 500ms
- [ ] Page load < 3s
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size reasonable

## Troubleshooting

### Issue: "API Key not found" Error
**Solution**:
- [ ] Check `.env.local` exists in root directory
- [ ] Verify `GOOGLE_API_KEY=` line is correct
- [ ] Restart dev server after changing .env
- [ ] Check key hasn't expired

### Issue: Real-time Not Updating
**Solution**:
- [ ] Check WebSocket connection in DevTools
- [ ] Verify replication enabled in Supabase
- [ ] Check RLS policies allow SELECT
- [ ] Refresh page and retry

### Issue: Can't Sign Up
**Solution**:
- [ ] Check database migration ran completely
- [ ] Verify user_profiles table exists
- [ ] Check email format is valid
- [ ] Ensure password meets requirements
- [ ] Check browser console for errors

### Issue: Predictions Not Generating
**Solution**:
- [ ] Verify Gemini API key is valid
- [ ] Check API has quota remaining
- [ ] Look at edge function logs
- [ ] Check match data is passed correctly
- [ ] Ensure internet connection active

### Issue: Slow Performance
**Solution**:
- [ ] Check database indexes exist
- [ ] Monitor network tab in DevTools
- [ ] Check real-time subscription count
- [ ] Verify API responses < 500ms
- [ ] Consider upgrading Supabase plan

## Next Steps After Setup

1. **Customize Branding**
   - Update colors in `tailwind.config.ts`
   - Change logo in `public/`
   - Update metadata in `index.html`

2. **Add More Matches**
   - Integrate real sports APIs
   - Seed database with teams
   - Setup automatic match creation

3. **Improve Predictions**
   - Collect historical accuracy data
   - Fine-tune Gemini prompts
   - Add more factors to analysis

4. **Grow User Base**
   - Setup email marketing
   - Create social media accounts
   - Build community features

5. **Monetize**
   - Add payment processing
   - Create premium tier
   - Sell advanced predictions

## Support Resources

- **Supabase**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/docs
- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind**: https://tailwindcss.com/docs

---

## Completion Status

Track your progress:

- [ ] Phase 1 Complete
- [ ] Phase 2 Complete
- [ ] Phase 3 Complete
- [ ] Phase 4 Complete
- [ ] Phase 5 Complete
- [ ] Phase 6 Complete
- [ ] Phase 7 Complete
- [ ] Phase 8 Complete
- [ ] Phase 9 Complete
- [ ] Phase 10 Complete
- [ ] Phase 11 Complete
- [ ] Phase 12 Complete

**🎉 When all phases complete, you're ready to launch!**

---

**Estimated Total Time**: 60-90 minutes
**Difficulty**: Beginner to Intermediate
**Support**: Check documentation files if stuck
