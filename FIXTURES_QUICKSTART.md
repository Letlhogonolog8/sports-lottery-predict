# 🎯 Load Live Fixtures - Quick Start (2 Minutes)

## The Problem
Your app shows "Starting..." instead of match minutes because **fixtures haven't been loaded into the database yet**.

## The Solution
Load fixtures using ONE of these 3 methods:

---

## ⚡ Method 1: Use Node Script (EASIEST - 30 seconds)

### Prerequisites
- Node.js installed
- `.env.local` file with Supabase credentials

### Steps

1. **Open terminal in project root**

2. **Run the loader:**
```bash
node load-fixtures.js
```

3. **Expected output:**
```
✅ Successfully loaded 24 fixtures!

📊 Fixture Summary:
   📍 Live Matches: 12
   ⏰ Upcoming Matches: 12
   🎮 Sports: 5

🚀 Refresh your app now!
```

4. **Refresh your browser** - Live matches should now show with minutes!

---

## 📋 Method 2: Supabase SQL Editor (5 minutes)

### Steps

1. **Go to Supabase Dashboard:**
   - `https://app.supabase.com/project/[YOUR_PROJECT]/sql/new`

2. **Copy this SQL and paste:**

```sql
-- Delete old matches
DELETE FROM public.matches;

-- Premier League (3 LIVE)
INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES
('pl_001', 'football', 'Premier League', 'Manchester City', 'Brighton', 'live', NOW(), 2, 1, 65),
('pl_002', 'football', 'Premier League', 'Arsenal', 'Tottenham', 'live', NOW(), 1, 1, 42),
('pl_003', 'football', 'Premier League', 'Chelsea', 'Manchester United', 'live', NOW() - INTERVAL '30 minutes', 0, 2, 78),
('pl_004', 'football', 'Premier League', 'Liverpool', 'Aston Villa', 'upcoming', NOW() + INTERVAL '45 minutes', NULL, NULL, NULL),

-- La Liga (2 LIVE)
('laliga_001', 'football', 'La Liga', 'Real Madrid', 'Barcelona', 'live', NOW(), 2, 2, 55),
('laliga_002', 'football', 'La Liga', 'Atletico Madrid', 'Valencia', 'live', NOW() - INTERVAL '15 minutes', 1, 0, 88),

-- Serie A (2 LIVE)
('seriea_001', 'football', 'Serie A', 'Juventus', 'Inter Milan', 'live', NOW(), 1, 1, 72),
('seriea_002', 'football', 'Serie A', 'AC Milan', 'Roma', 'live', NOW() - INTERVAL '45 minutes', 2, 0, 90),

-- Bundesliga (1 LIVE)
('bundesliga_001', 'football', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', 'live', NOW(), 3, 1, 51),

-- Ligue 1 (1 LIVE)
('ligue1_001', 'football', 'Ligue 1', 'Paris Saint-Germain', 'Marseille', 'live', NOW() - INTERVAL '20 minutes', 2, 1, 85),

-- NBA (2 LIVE)
('nba_001', 'basketball', 'NBA', 'Los Angeles Lakers', 'Boston Celtics', 'live', NOW(), 98, 95, 38),
('nba_002', 'basketball', 'NBA', 'Golden State Warriors', 'Denver Nuggets', 'live', NOW() - INTERVAL '10 minutes', 110, 108, 42),
('nba_003', 'basketball', 'NBA', 'Miami Heat', 'Chicago Bulls', 'upcoming', NOW() + INTERVAL '3 hours', NULL, NULL, NULL),

-- ATP Tennis (2 LIVE)
('atp_001', 'tennis', 'ATP', 'Novak Djokovic', 'Carlos Alcaraz', 'live', NOW(), 2, 0, NULL),
('atp_002', 'tennis', 'ATP', 'Jannik Sinner', 'Daniil Medvedev', 'live', NOW() - INTERVAL '1 hour', 1, 2, NULL),

-- Cricket (1 LIVE)
('cricket_001', 'cricket', 'Test Match', 'India', 'England', 'live', NOW(), 287, 156, NULL);
```

3. **Click "Run"**
4. **Refresh your app**

---

## 🐍 Method 3: Use TypeScript Script

```bash
npx ts-node scripts/seed-fixtures.ts
```

---

## ✅ How to Verify It Worked

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for this message:**
   ```
   Live matches loaded: {
     count: 12,
     firstMatch: {
       home: "Manchester City",
       away: "Brighton", 
       minute: 65,
       status: "live"
     }
   }
   ```

4. **If you see a warning instead:**
   ```
   ⚠️ No live matches found. Run LOAD_FIXTURES.md to populate database.
   ```
   → The fixtures weren't loaded. Try one of the methods above.

---

## 🎮 What You'll See After Loading

### Live Matches (update every 30 seconds):
- ✅ Manchester City 2-1 Brighton (65')
- ✅ Arsenal 1-1 Tottenham (42')
- ✅ Real Madrid 2-2 Barcelona (55')
- ✅ Bayern Munich 3-1 Dortmund (51')
- ✅ Lakers 98-95 Celtics (38)

### Upcoming Matches:
- ⏰ Liverpool vs Aston Villa (45 min from now)
- ⏰ Miami Heat vs Chicago Bulls (3 hours from now)

### Real-Time Features:
- ⚡ Scores update every 30 seconds
- ⚡ Minutes increment automatically
- ⚡ Goals appear randomly (~5% per minute)
- ⚡ Matches auto-finish at 90 minutes
- ⚡ Upcoming matches become live at start time

---

## 🔧 Troubleshooting

### "Command not found: node"
→ Install Node.js from https://nodejs.org/

### "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
→ Check your `.env.local` file has these:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
```

### "Error: ENOENT: no such file or directory"
→ Make sure you're in the project root directory:
```bash
cd "c:\Users\mudau\Desktop\New Apps\sports-lottery-predict"
```

### Still showing "Starting..." after loading?
1. Hard refresh browser (Ctrl+Shift+R on Windows)
2. Check console for errors (F12 → Console)
3. Verify fixtures are in database (Supabase SQL Editor → `SELECT * FROM matches;`)

---

## 📊 Live Fixtures Available

**Football:**
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (6 matches)
- 🇪🇸 La Liga (4 matches)
- 🇮🇹 Serie A (3 matches)
- 🇩🇪 Bundesliga (2 matches)
- 🇫🇷 Ligue 1 (2 matches)

**Basketball:**
- 🏀 NBA (4 matches)

**Tennis:**
- 🎾 ATP (3 matches)

**Cricket:**
- 🏏 Test Match (3 matches)

---

## 🎯 Next Steps

After loading fixtures:
1. ✅ Open app and see live matches
2. ✅ Watch scores update every 30 seconds
3. ✅ See goals appear randomly
4. ✅ Watch upcoming matches transition to live
5. ✅ Deploy to production when ready!

**Questions?** Check `FIXTURES_SETUP.md` for full documentation.
