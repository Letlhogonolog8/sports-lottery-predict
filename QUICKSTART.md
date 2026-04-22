# Quick Start Guide

Get the Sports Prediction AI platform running in 10 minutes.

## Prerequisites
- Supabase account (free)
- Google API key for Gemini
- Node.js 16+
- npm or pnpm

## Step 1: Clone & Install (2 min)

```bash
cd sports-lottery-predict
npm install
```

## Step 2: Create Supabase Project (2 min)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter a project name
4. Copy your **Project URL** and **Anon Key** from Settings > API

## Step 3: Setup Database (2 min)

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy entire content from `supabase/migrations/001_initial_schema.sql`
4. Paste and execute
5. ✅ Tables created

## Step 4: Get Google Gemini API Key (1 min)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

## Step 5: Configure Environment (1 min)

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_API_KEY=your-google-api-key-here
```

## Step 6: Deploy Edge Functions (2 min)

### Option A: Using CLI (Recommended)

```bash
npm install -g supabase
supabase link --project-ref your-project-id
supabase functions deploy predict-match --no-verify-jwt
supabase functions deploy fetch-sports-data --no-verify-jwt
supabase functions deploy refresh-live-data --no-verify-jwt
```

### Option B: Manual (Supabase Dashboard)

1. Go to Edge Functions
2. Create function: `predict-match`
3. Paste code from `supabase/functions/predict-match/index.ts`
4. Add environment variable: `GOOGLE_API_KEY`
5. Repeat for other 2 functions

## Step 7: Run App (1 min)

```bash
npm run dev
```

Visit http://localhost:8080

## Step 8: Test It Out

1. Sign up with email/password
2. Go to homepage
3. Find a match
4. Click "Get AI Prediction"
5. View AI probabilities
6. Save to bet slip
7. Check prediction history

## What Works Now ✅

- ✅ User authentication (sign up/sign in)
- ✅ AI predictions using Gemini 2.5 Flash
- ✅ Real-time match updates
- ✅ Save bet slips and predictions
- ✅ View prediction history & stats
- ✅ Accuracy tracking

## Next Steps (Optional)

1. **Add Real Sports Data**
   - Register at football-data.org
   - Add API key to environment
   - Update fetch-sports-data function

2. **Deploy Live**
   - `npm run build`
   - Deploy to Vercel/Netlify

3. **Enable Notifications**
   - Setup email in Supabase Auth
   - Add SMS with Twilio

4. **Add Payments**
   - Integrate Stripe
   - Track paid predictions

## Troubleshooting

### Functions not deploying
```bash
# Check CLI is linked
supabase link --project-ref your-project-id

# Check you're in right directory
cd supabase/functions/predict-match
```

### API key errors
- Verify `.env.local` exists in root (not in src/)
- Restart dev server after changing .env
- Check Supabase URL has https://

### Predictions not generating
- Check Google API key is valid
- Verify edge function has GOOGLE_API_KEY set
- Check browser console for errors

### Can't sign up
- Check email confirmation is disabled in Supabase Auth
- Verify RLS policies are correct
- Check database migration ran successfully

## File Structure

```
├── src/
│   ├── components/        # React components
│   ├── contexts/          # Auth & App context
│   ├── hooks/             # Custom hooks
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client & functions
│   │   └── sportsData.ts # Types & mock data
│   ├── pages/             # Route pages
│   └── App.tsx            # Main app
├── supabase/
│   ├── migrations/        # Database schema
│   ├── functions/         # Edge functions
│   │   ├── predict-match/
│   │   ├── fetch-sports-data/
│   │   └── refresh-live-data/
│   └── config.toml        # Local dev config
├── .env.example           # Environment template
└── vite.config.ts         # Build config
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | All backend functions |
| `src/contexts/AuthContext.tsx` | Auth state management |
| `src/pages/Auth.tsx` | Sign up/login UI |
| `src/pages/PredictionHistory.tsx` | User stats & history |
| `supabase/migrations/001_initial_schema.sql` | Database schema |

## Need Help?

- **Supabase Issues**: https://github.com/supabase/supabase
- **Gemini API**: https://ai.google.dev/docs
- **React**: https://react.dev

## Performance Tips

1. **Predictions slow?**
   - Gemini takes 2-5 seconds
   - This is normal

2. **Updates lag?**
   - Check browser connection
   - Verify WebSocket in DevTools

3. **Build slow?**
   - Run `npm run build` once
   - Test with `npm run preview`

## What's Next?

After getting comfortable:

1. Add more sports APIs
2. Build mobile app
3. Add leaderboards
4. Integrate betting
5. Train custom ML model

---

**Ready to go?** Start the dev server: `npm run dev` 🚀
