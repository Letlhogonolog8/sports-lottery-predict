# 📝 Manual Real Fixtures Loader

## How to Get REAL Match Data

### Step 1: Find Real Matches
Go to any of these sites:
- **Flashscore.com** (best for all sports)
- **ESPN.com** (football)
- **BBC Sport** (football)
- **Sofascore.com** (live scores)

### Step 2: Copy Real Teams Playing RIGHT NOW

For example, if you see on Flashscore:
```
Serie A - Today
Juventus vs Roma - 20:45 (LIVE - 65 minutes, 2-0)
Inter Milan vs Napoli - 18:00 (LIVE - 42 minutes, 1-1)
```

### Step 3: Create `real-matches.json`

Create a file in your project root:

```json
{
  "matches": [
    {
      "match_id": "real_001",
      "sport": "football",
      "league": "Serie A",
      "home_team_name": "Juventus",
      "away_team_name": "Roma",
      "status": "live",
      "home_score": 2,
      "away_score": 0,
      "minute": 65
    },
    {
      "match_id": "real_002",
      "sport": "football",
      "league": "Serie A",
      "home_team_name": "Inter Milan",
      "away_team_name": "Napoli",
      "status": "live",
      "home_score": 1,
      "away_score": 1,
      "minute": 42
    }
  ]
}
```

### Step 4: Load into Supabase

Option A - **Manual SQL:**
1. Go to Supabase → SQL Editor
2. Copy this:

```sql
DELETE FROM public.matches;

INSERT INTO public.matches (match_id, sport, league, home_team_name, away_team_name, status, start_time, home_score, away_score, minute) VALUES
('real_001', 'football', 'Serie A', 'Juventus', 'Roma', 'live', NOW(), 2, 0, 65),
('real_002', 'football', 'Serie A', 'Inter Milan', 'Napoli', 'live', NOW(), 1, 1, 42),
-- Add more matches here
;
```

3. Click Run

### Step 5: Refresh App

Your app will now show **REAL current matches**!

---

## What Websites Show Real Data

| Site | Best For | Real-Time |
|------|----------|-----------|
| **Flashscore** | All sports | ✅ Yes |
| **ESPN** | Football/Basketball | ✅ Yes |
| **Sofascore** | Live scores | ✅ Yes |
| **BBC Sport** | Football | ✅ Yes |
| **Sky Sports** | All sports | ✅ Yes |

---

## Example: How to Extract Data

**On Flashscore.com right now:**

```
Serie A
⚽ Juventus 2 - 0 Roma (Live, 65')
⚽ Inter Milan 1 - 1 Napoli (Live, 42') 
⚽ AC Milan 2 - 1 Lazio (Live, 78')
⚽ Atalanta 3 - 1 Verona (Upcoming, 20:45)
```

**Copy into your fixtures:**
```json
{
  "home_team_name": "Juventus",
  "away_team_name": "Roma",
  "status": "live",
  "home_score": 2,
  "away_score": 0,
  "minute": 65
}
```

---

## Next Step

1. **Open Flashscore or ESPN**
2. **Find TODAY's real Serie A matches**
3. **Copy the teams and scores**
4. **Send me the list** and I'll create a proper loader

Or use this format to update yourself:

```sql
INSERT INTO public.matches (...) VALUES
('match_001', 'football', 'Serie A', 'REAL_HOME_TEAM', 'REAL_AWAY_TEAM', 'live', NOW(), HOME_SCORE, AWAY_SCORE, MINUTE);
```

---

## I Recommend

**Get an API key** from API-Football.com (free) → Then we can auto-fetch real matches instead of manual entry.

Let me know how you want to proceed!
