# 🎯 Step-by-Step: Load Real-Time Fixtures

## Current Status
✅ Script works perfectly
⚠️ Just need to disable RLS temporarily
✅ Then fixtures load automatically

---

## 5-Minute Setup

### Step 1: Open Supabase Dashboard
**URL:** `https://app.supabase.com/`

### Step 2: Go to Policies Page
1. **Left sidebar** → Click **Authentication**
2. **Sub-menu** → Click **Policies**
3. **Find:** Scroll and find `matches` table

### Step 3: Toggle RLS OFF
- **Find the toggle** next to "matches"
- **Click:** Toggle from **ON** → **OFF**
- **Confirm:** Click OK if prompted

### Step 4: Load Fixtures
**Run this command in terminal:**
```bash
node load-fixtures.js
```

**Expected output:**
```
✅ Successfully loaded 24 fixtures!

📊 Fixture Summary:
   📍 Live Matches: 12
   ⏰ Upcoming Matches: 12
   🎮 Sports: 5

🚀 Refresh your app now!
```

### Step 5: Re-Enable RLS
1. **Go back** to Supabase Policies page
2. **Find:** "matches" table
3. **Click:** Toggle from **OFF** → **ON**

### Step 6: Refresh Browser
- **Open your app** (or refresh if already open)
- **See:** Live matches with real minutes!

---

## That's It! ✨

Your app will now show:
- ⚽ 12 live football matches with minutes (65', 42', etc.)
- 🏀 NBA games with scores
- 🎾 Tennis matches
- 🏏 Cricket matches
- ⏰ 12 upcoming matches with start times
- ✅ Real-time updates every 30 seconds
- ✅ Automatic goal simulation
- ✅ Team logos for all matches

---

## Troubleshooting

### "Still seeing 'Starting...'"?
1. Hard refresh browser (Ctrl+Shift+R on Windows)
2. Check F12 Console for errors
3. Verify RLS is OFF when running script
4. Run script again: `node load-fixtures.js`

### "Error: RLS is blocking inserts"?
→ Make sure RLS is toggled **OFF** before running script

### "Command not found"?
→ Make sure you're in project folder:
```bash
cd "c:\Users\mudau\Desktop\New Apps\sports-lottery-predict"
node load-fixtures.js
```

---

## More Help
- **Full guide:** Read `FIX_RLS.md`
- **All methods:** Read `FIXTURES_QUICKSTART.md`
- **Architecture:** Read `REAL_TIME_SETUP.md`

**Let's go! 🚀**
