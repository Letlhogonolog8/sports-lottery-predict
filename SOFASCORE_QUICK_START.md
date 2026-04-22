# 🚀 SofaScore Quick Start (5 minutes)

## What Just Happened?

Your app now has **FREE real sports data** from SofaScore!

✅ **No setup needed** - it's already integrated  
✅ **No API keys required** - completely free  
✅ **Multi-sport support** - Football, Basketball, Tennis, etc.  
✅ **Real-time updates** - WebSocket to your database  

---

## Try It Now (Pick One)

### Option 1: Node.js (Easiest - No Dependencies)
```bash
node fetch-real-matches.js
```
Loads real matches into your database. That's it!

### Option 2: Python (Most Reliable - Recommended)
```bash
pip install sofascore-wrapper
python3 sofascore-bridge.py
```
Uses official SofaScore library. Best reliability.

### Option 3: Supabase (Automatic - No Manual Run)
Already deployed! Runs every minute automatically.

---

## What Gets Loaded?

```
Match Data:
├── Team Names (Home & Away)
├── Current Score (if live)
├── Match Status (live/upcoming/finished)
├── Sport Type (football/basketball/etc)
├── League Information
├── Start Time
└── Current Minute (if live)
```

---

## Next: Check Your Database

1. Go to Supabase Dashboard
2. Click: **Tables → matches → Data**
3. You should see real matches!

---

## See It In Your App

1. Go to http://localhost:8080
2. Click **"Browse Matches"**
3. See REAL live sports data (no more hardcoded)

---

## How To Keep It Updated

### Option A: GitHub Actions (FREE - Recommended)
```bash
git push  # Workflows trigger automatically
```

### Option B: Manual Scheduler
```bash
# Every 5 minutes:
*/5 * * * * node /path/to/fetch-real-matches.js
```

### Option C: Already Running
Supabase Edge Function updates automatically.

---

## Files Changed

```
✅ NEW:
  • src/lib/sofascoreWrapper.ts        (TypeScript SDK)
  • fetch-real-matches.js              (Updated)
  • sofascore-bridge.py                (Python wrapper)
  • sofascore-bridge.js                (Node.js bridge)
  • SOFASCORE_SETUP.md                 (Full guide)
  • SOFASCORE_IMPLEMENTATION.md        (Technical details)

✅ UPDATED:
  • supabase/functions/fetch-sports-data/index.ts
  • fetch-real-matches.js              (SofaScore as primary)
```

---

## Troubleshooting

**Q: No matches showing?**  
A: No live matches right now. Check https://sofascore.com for upcoming matches.

**Q: Getting HTTP errors?**  
A: Normal during testing. Script has 3-level fallback (SofaScore → API-Football → TheSportsDB).

**Q: Python not found?**  
A: Use Node.js version instead: `node fetch-real-matches.js`

---

## What's Next?

1. ✅ **Run one of the commands above**
2. ✅ **Check Supabase for real data**
3. ✅ **Refresh your app**
4. ✅ **See live sports matches**
5. ✅ **AI predictions work on real data now**

---

## Links

- 📖 [Full Setup Guide](./SOFASCORE_SETUP.md)
- 🔧 [Technical Details](./SOFASCORE_IMPLEMENTATION.md)
- 🌐 [SofaScore Website](https://sofascore.com)
- 📚 [Python Library](https://pypi.org/project/sofascore-wrapper/)

---

**Status**: ✅ Everything is ready to go!

Pick your option above and run it now. 🎉
