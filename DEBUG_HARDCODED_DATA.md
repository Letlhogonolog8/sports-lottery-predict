# 🔍 Hardcoded Data Audit Report

**Status**: ⚠️ **Found mock/static data** that should be replaced with dynamic data

---

## Summary

| Category | Files | Severity | Status |
|----------|-------|----------|--------|
| Mock Matches | 1 | ⚠️ High | Needs removal |
| Static Stats | 4 | ⚠️ High | Needs removal |
| UI Strings | 2 | 🟡 Medium | OK for UI |
| Notifications | 1 | 🟡 Medium | OK for demo |
| **Total Issues** | **8** | | ⚠️ **Review needed** |

---

## 🔴 Critical Issues (Must Fix)

### 1. **Mock Match Data**
**File**: `src/lib/sportsData.ts` (Lines 71-240)

**Issue**: Hard-coded match data used as fallback
```typescript
export const liveMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 1,
    // ... more mock data
  },
  // 5 matches total
]

export const upcomingMatches: Match[] = [
  // 5 more mock matches
]
```

**Impact**: 
- ❌ Shows fake scores
- ❌ Not from database
- ❌ Doesn't update in real-time
- ❌ Misleads users

**Fix**: 
- Remove `liveMatches` and `upcomingMatches` exports
- Use database queries only via `supabase.ts` functions
- Show "Loading..." if no data

---

### 2. **Mock Sports Data in fetch-sports-data Edge Function**
**File**: `supabase/functions/fetch-sports-data/index.ts` (Lines 56-69)

**Issue**: Hard-coded sample match instead of fetching real data
```typescript
async function fetchLiveMatches(supabase) {
  const matches = [
    {
      match_id: "live_1",
      home_team_name: "Manchester City",  // ← HARD-CODED
      away_team_name: "Liverpool",         // ← HARD-CODED
      home_score: 2,                       // ← HARD-CODED
      // ...
    }
  ];
  return matches;
}
```

**Impact**: 
- ❌ Never fetches from real APIs
- ❌ Always returns same data
- ❌ No real-time updates

**Fix**: 
- Integrate football-data.org API
- Fetch from multiple leagues
- Update with real scores

---

### 3. **Hard-Coded Platform Statistics**
**File**: `src/lib/sportsData.ts` (Lines 323-332)

**Issue**: Static platform stats not from database
```typescript
export const platformStats = {
  totalPredictions: 15847,        // ← Should be: COUNT(*) from predictions
  accuracy: 73.2,                  // ← Should be: AVG(accuracy) from predictions
  activeLiveMatches: 24,           // ← Should be: COUNT(*) WHERE status='live'
  usersOnline: 12458,              // ← Should be: COUNT(*) active sessions
  todayPredictions: 342,           // ← Should be: COUNT(*) WHERE date=TODAY
  weeklyAccuracy: 76.8,            // ← Should be: calculated from last 7 days
  monthlyProfit: '+18.4%',         // ← Should be: calculated from profit_loss
  topSport: 'Football',            // ← Should be: group by sport
};
```

**Impact**: 
- ❌ Stats never update
- ❌ Don't reflect actual data
- ❌ Mislead users about accuracy

**Fix**: 
- Remove export
- Create functions to calculate dynamically from database
- Add to dashboard with real calculations

---

### 4. **Mock Model Factors (Analytics)**
**File**: `src/lib/sportsData.ts` (Lines 312-321)

**Issue**: Static prediction model factors
```typescript
export const modelFactors = [
  { name: 'Team Form (Last 5)', weight: 22, value: 85 },
  { name: 'Head-to-Head Record', weight: 15, value: 72 },
  // ... 6 more static factors
];
```

**Impact**: 
- ❌ Not calculated from real data
- ❌ Doesn't change per prediction
- ❌ Misleading analytics

**Fix**: 
- Remove export
- Calculate dynamically in `predict-match` edge function
- Return real factors from Gemini analysis

---

## 🟡 Medium Issues (Review)

### 5. **Hard-Coded User Profile Data**
**File**: `src/components/predictions/Header.tsx` (Line 162)

**Issue**: Static user name in profile dropdown
```typescript
<p className="text-sm font-semibold text-white">John Doe</p>
<p className="text-xs text-slate-400">Premium Member</p>
```

**Status**: ✅ OK - Will be replaced with `useAuth()` hook in production

**Fix**: 
```typescript
const { profile } = useAuth();
<p className="text-sm font-semibold text-white">{profile?.username}</p>
```

---

### 6. **Hard-Coded Statistics in HeroBanner**
**File**: `src/components/predictions/HeroBanner.tsx` (Lines 11-15)

**Issue**: Static stats that don't match real platform data
```typescript
const stats = [
  { value: '73.2%', label: 'Prediction Accuracy' },        // ← Hard-coded
  { value: '15,847', label: 'Total Predictions' },          // ← Hard-coded
  { value: '24/7', label: 'Real-Time Analysis' },           // ← Hard-coded
];
```

**Status**: 🟡 Should be dynamic

**Fix**: 
```typescript
const { profile } = useAuth();
const stats = [
  { value: `${profile?.accuracy_percentage || 0}%`, label: 'Your Accuracy' },
  { value: profile?.total_predictions || 0, label: 'Total Predictions' },
];
```

---

### 7. **Hard-Coded Notifications**
**File**: `src/components/predictions/Header.tsx` (Lines 15-20)

**Issue**: Static notification list
```typescript
const notifications = [
  { id: 1, title: 'High Confidence Alert', message: 'Bayern Munich vs PSG - 92% confidence prediction', time: '2m ago' },
  { id: 2, title: 'Prediction Won', message: 'Man United vs Tottenham - Home Win confirmed', time: '15m ago' },
  // ... more static notifications
];
```

**Status**: 🟡 OK for UI demo, but should load real notifications

**Fix**: 
- Fetch from `bet_slips` and `prediction_history` tables
- Show real user notifications
- Subscribe to real-time updates

---

### 8. **Mock Lottery Draws**
**File**: `src/lib/sportsData.ts` (Lines 242-299)

**Issue**: Hard-coded lottery data with fake jackpots
```typescript
export const lotteryDraws: LotteryDraw[] = [
  {
    id: 'powerball',
    name: 'Powerball',
    jackpot: '$785 Million',              // ← Hard-coded
    hotNumbers: [23, 32, 61, 53, 69, 21], // ← Hard-coded
    coldNumbers: [13, 36, 5, 49, 51, 60], // ← Hard-coded
  },
  // ... more mock lotteries
];
```

**Status**: ✅ OK - This is demo feature, can stay or move to database

---

## 🔧 Recommended Actions

### Priority 1 (Remove Immediately)
- [ ] Delete `liveMatches` from `sportsData.ts`
- [ ] Delete `upcomingMatches` from `sportsData.ts`
- [ ] Delete `platformStats` from `sportsData.ts`
- [ ] Delete `modelFactors` from `sportsData.ts`
- [ ] Update `fetch-sports-data` to use real API or remove mock data

### Priority 2 (Implement Dynamic)
- [ ] Make HeroBanner stats dynamic from `useAuth()`
- [ ] Make Header notifications dynamic from database
- [ ] Make profile info dynamic from `useAuth()`

### Priority 3 (Keep or Move)
- [ ] Keep `lotteryDraws` as demo (or move to database)
- [ ] Keep `sportsCategories` as static reference

---

## Before & After Examples

### Match Data

**BEFORE** (Mock):
```typescript
// src/lib/sportsData.ts
export const liveMatches = [
  { id: '1', homeTeam: 'Man City', awayTeam: 'Liverpool', homeScore: 2 }
];
```

**AFTER** (Dynamic):
```typescript
// src/lib/supabase.ts
export async function getLiveMatches() {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live');
  return data;
}

// In component:
const { matches } = useLiveMatches();
```

---

### Statistics

**BEFORE** (Mock):
```typescript
const platformStats = {
  totalPredictions: 15847,
  accuracy: 73.2,
};
```

**AFTER** (Dynamic):
```typescript
// Create new function in supabase.ts
export async function getPlatformStats() {
  const { data: totalCount } = await supabase
    .from('prediction_history')
    .select('*', { count: 'exact' });
  
  const { data: predictions } = await supabase
    .from('prediction_history')
    .select('result');
  
  const wins = predictions.filter(p => p.result === 'win').length;
  return {
    totalPredictions: totalCount,
    accuracy: (wins / totalCount * 100).toFixed(1)
  };
}
```

---

## Testing Checklist

After fixing hardcoded data:

- [ ] Dashboard loads matches from database only
- [ ] Real-time updates work for live matches
- [ ] User stats show their actual data
- [ ] Notifications show real events
- [ ] Platform stats are calculated from database
- [ ] No console errors about missing data
- [ ] "Loading..." shows while fetching
- [ ] Empty state shows if no data

---

## Files to Update

```
src/lib/sportsData.ts                        ← DELETE or keep only types/interfaces
supabase/functions/fetch-sports-data/index.ts ← INTEGRATE REAL API
src/components/predictions/HeroBanner.tsx     ← MAKE DYNAMIC
src/components/predictions/Header.tsx         ← MAKE DYNAMIC
src/pages/Index.tsx                           ← USE DATABASE QUERIES
```

---

## Current Usage of Mock Data

| Mock Data | Currently Used In | Should Use |
|-----------|-------------------|-----------|
| `liveMatches` | Dashboard | Database via `getLiveMatches()` |
| `upcomingMatches` | Dashboard | Database via `getUpcomingMatches()` |
| `platformStats` | HeroBanner | Dynamic calculation function |
| `modelFactors` | Analytics | Calculated from Gemini response |
| `lotteryDraws` | Lottery section | Database or external API |
| `recentPredictions` | History | Database via `getUserPredictionHistory()` |

---

## Summary

✅ **Good News**:
- Core features (Auth, Predictions, Betting) are properly using database
- Real-time subscriptions are configured correctly
- Edge functions are in place

⚠️ **Issues**:
- Old UI components still reference mock data
- `src/lib/sportsData.ts` has outdated exports
- Some UI components show fake stats

🔧 **Action**:
- Remove/refactor mock data exports
- Replace with dynamic database queries
- Update components to use `useAuth()` and custom hooks

---

## Is This Critical?

**For Development**: ❌ No - Mock data helpful for testing
**For Production**: ✅ Yes - Must use real database

**Recommendation**: 
- Keep mock data in dev environment (helpful for testing)
- Create production flag to disable in `.env`
- Add fallbacks that show "Loading..." instead

---

**Next Steps**:
1. Review this report
2. Decide: Keep mock data or remove?
3. If removing: Update components to use database
4. Test with real data from Supabase
5. Deploy to production

---

*Generated: January 15, 2026*
