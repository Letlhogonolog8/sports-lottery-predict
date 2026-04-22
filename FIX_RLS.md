# 🔓 Fix RLS Error for Fixture Loading

## Error You're Seeing
```
❌ Error loading fixtures: new row violates row-level security policy for table "matches"
```

## Cause
Your Supabase `matches` table has **Row-Level Security (RLS)** enabled, which prevents data insertion.

## Solution (Choose One)

### Option 1: Disable RLS Temporarily (30 seconds)

1. **Go to Supabase Dashboard:**
   - URL: `https://app.supabase.com/project/[YOUR_PROJECT_ID]/auth/policies`

2. **Find "matches" table:**
   - Click: **Authentication** → **Policies** (left sidebar)
   - Find: **matches** table
   - Toggle: **RLS Off** (if it's currently On)

3. **Run the fixture loader:**
   ```bash
   node load-fixtures.js
   ```

4. **After fixtures load, re-enable RLS:**
   - Toggle: **RLS On** (to secure the table again)

---

### Option 2: Create RLS Policy for INSERT (5 minutes)

If you want to keep RLS enabled:

1. **Go to:** Supabase → Authentication → Policies

2. **Click: "New Policy" on matches table**

3. **Set these values:**
   - **Policy name:** `Allow inserts for fixture loading`
   - **For role:** `anon` or your service role
   - **Using:** Leave empty (or `TRUE` for all)
   - **With check:** Leave empty

4. **Click:** Create Policy

5. **Run fixtures:**
   ```bash
   node load-fixtures.js
   ```

---

### Option 3: Use Service Role Key (Advanced)

If you have service role key:

1. **Get your service role key from:**
   - Supabase Dashboard → Settings → API Keys → Service Role Key

2. **Update `load-fixtures.js` line ~31:**
   ```javascript
   const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
   ```

3. **Add to `.env.local`:**
   ```
   SERVICE_ROLE_KEY=eyJ...your_service_role_key
   ```

4. **Run:**
   ```bash
   node load-fixtures.js
   ```

---

## Recommended: Option 1

- **Simplest:** Just toggle RLS off/on
- **Fastest:** 30 seconds total
- **Safe:** You'll re-enable RLS after loading

## Steps Summary

```
1. Supabase Dashboard → Authentication → Policies
2. Find "matches" table
3. Toggle RLS: OFF
4. Run: node load-fixtures.js
5. Wait for: ✅ Successfully loaded 24 fixtures!
6. Toggle RLS: ON (re-enable security)
7. Refresh app browser
```

---

## Verify It Worked

After fixtures load, you should see:
```
✅ Successfully loaded 24 fixtures!

📊 Fixture Summary:
   📍 Live Matches: 12
   ⏰ Upcoming Matches: 12
   🎮 Sports: 5

🚀 Refresh your app now!
```

Then refresh your browser and you'll see live matches! ⚽

---

## Why RLS?

Row-Level Security is a **security feature** that:
- ✅ Prevents unauthorized data access
- ✅ Restricts who can read/write data
- ✅ Works with Supabase authentication

For **production**, you want RLS ON.
For **development/testing**, you can temporarily turn it OFF for loading fixtures.
