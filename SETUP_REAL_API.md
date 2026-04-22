# ⚡ Set Up Real Live Matches with API-Football

## Why API-Football?

SuperSport.com doesn't have a public API, BUT **API-Football covers all the same leagues that SuperSport broadcasts**:

✅ Premier League (England)  
✅ La Liga (Spain)  
✅ Serie A (Italy)  
✅ Bundesliga (Germany)  
✅ Ligue 1 (France)  
✅ CAF Champions League  
✅ CAF African Cup of Nations  
✅ Local African leagues  
✅ NBA, ATP, Rugby, etc.

**API-Football has real-time data updated every 15 seconds** - exactly what you need!

---

## Setup (2 minutes)

### Step 1: Get Free API Key

1. Go to: **https://www.api-football.com/**
2. Click: **Free Plan** or **Sign Up**
3. Register with email
4. Get your API key from dashboard

### Step 2: Add to .env.local

Open `.env.local` and add:

```
FOOTBALL_DATA_API_KEY=your_api_key_here
```

Save the file.

### Step 3: Enable RLS OFF in Supabase

1. Go to Supabase → Authentication → Policies
2. Find "matches" table
3. Toggle RLS: OFF

### Step 4: Run the Fetcher

```bash
node fetch-real-matches.js
```

**Expected Output:**
```
🚀 Real Match Auto-Fetcher Started

🔄 Fetching from API-Football...
✅ Got 15 matches from API-Football

📝 Loading 15 real matches to Supabase...
✅ Matches loaded successfully!
   📊 15 matches from 5 leagues

✨ Ready! Refresh your app to see REAL live matches.
```

### Step 5: Refresh App

Your app now shows **real current matches** from SuperSport's broadcast leagues!

---

## Re-Enable Security

After loading matches:

1. Go back to Supabase → Authentication → Policies
2. Toggle RLS: ON (to secure again)
3. Done!

---

## Automatic Updates (Optional)

### Every 5 Minutes Auto-Update

Edit `fetch-real-matches.js` - find the bottom and uncomment:

```javascript
// setInterval(main, 5 * 60 * 1000);
```

Change to:

```javascript
setInterval(main, 5 * 60 * 1000);
```

Save and run:

```bash
node fetch-real-matches.js
```

Now matches update automatically every 5 minutes! ✨

---

## What You'll See

**Live Matches (Real Time):**
- ⚽ Manchester City 2-1 Brighton (67')
- ⚽ Arsenal 3-2 Chelsea (45')
- ⚽ Real Madrid 2-1 Barcelona (58')

**Upcoming Matches:**
- ⏰ Liverpool vs Everton (in 2 hours)
- ⏰ Bayern Munich vs Dortmund (in 4 hours)

All updated in real-time from API-Football!

---

## API-Football Pricing

| Plan | Price | Requests/Day |
|------|-------|--------------|
| **Free** | $0 | 100 |
| **Pro** | $19 | 7,500 |
| **Ultra** | $29 | 75,000 |
| **Mega** | $39 | 150,000 |

For development, the **Free plan (100/day) is perfect** - you get a request every ~15 minutes!

---

## Benefits

✅ Real-time data (updated every 15 seconds)  
✅ Covers 2,000+ leagues worldwide  
✅ Includes all SuperSport broadcast leagues  
✅ Free plan available  
✅ Easy integration  
✅ Reliable & accurate  

---

## That's It!

Your app will now have **real live matches** from the same leagues as SuperSport! ⚽

**Questions?** See `AUTO_REAL_MATCHES.md` for more details.
