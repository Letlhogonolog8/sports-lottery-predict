# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         React Frontend (Port 8080)                       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Pages & Components                                               │   │
│  │ ├── Auth.tsx              (Sign up / Sign in)                    │   │
│  │ ├── Index.tsx             (Dashboard, Match list)                │   │
│  │ ├── PredictionHistory.tsx (User stats & history)                 │   │
│  │ └── MatchPredictionCard   (AI prediction display & betting)      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ State Management                                                 │   │
│  │ ├── AuthContext.tsx       (User session & profile)               │   │
│  │ ├── AppContext.tsx        (App-wide state)                       │   │
│  │ └── React Query            (Data caching & synchronization)      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Custom Hooks                                                     │   │
│  │ ├── useAuth()              (Access auth state)                   │   │
│  │ ├── useLiveMatches()       (Get live matches + subscribe)        │   │
│  │ ├── useUpcomingMatches()   (Get upcoming matches)                │   │
│  │ └── useMatchSubscription() (Real-time match updates)             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Supabase Client (src/lib/supabase.ts)                            │   │
│  │ ├── Auth functions                                               │   │
│  │ ├── Match functions                                              │   │
│  │ ├── Prediction functions                                         │   │
│  │ ├── Real-time subscriptions                                      │   │
│  │ └── Edge function callers                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ HTTP & WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────────────────┐
│                      Supabase Backend                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                              │   │
│  │                                                                   │   │
│  │ Tables:                                                           │   │
│  │ ├── user_profiles         (User accounts, stats)                 │   │
│  │ ├── teams                 (Team info & metadata)                 │   │
│  │ ├── team_stats            (Historical stats)                     │   │
│  │ ├── matches               (Live & upcoming matches)              │   │
│  │ ├── match_predictions     (AI-generated predictions)             │   │
│  │ ├── bet_slips             (User predictions & stakes)            │   │
│  │ ├── prediction_history    (Historical predictions)               │   │
│  │ └── live_odds             (Current odds from providers)          │   │
│  │                                                                   │   │
│  │ Features:                                                         │   │
│  │ ├── RLS Policies          (Row-level security)                   │   │
│  │ ├── Indexes               (Performance optimization)             │   │
│  │ ├── Triggers              (Auto-update stats)                    │   │
│  │ └── Realtime              (WebSocket pub/sub)                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Authentication (Supabase Auth)                                   │   │
│  │                                                                   │   │
│  │ Features:                                                         │   │
│  │ ├── Email/Password auth                                          │   │
│  │ ├── JWT token management                                         │   │
│  │ ├── Session persistence                                          │   │
│  │ └── Password hashing (bcrypt)                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Edge Functions (Deno Runtime)                                    │   │
│  │                                                                   │   │
│  │ 1. predict-match                                                 │   │
│  │    Input:  Match data (teams, league, sport, stats)              │   │
│  │    Output: Probabilities, confidence, factors                    │   │
│  │    Action: Calls Gemini API, saves to DB                         │   │
│  │                                                                   │   │
│  │ 2. fetch-sports-data                                             │   │
│  │    Input:  Sports API credentials                                │   │
│  │    Output: Match data, scores, stats                             │   │
│  │    Action: Fetches from APIs, updates DB, broadcasts updates     │   │
│  │                                                                   │   │
│  │ 3. refresh-live-data                                             │   │
│  │    Input:  None (scheduled)                                      │   │
│  │    Output: Update count, timestamp                               │   │
│  │    Action: Updates live matches, broadcasts to clients           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Real-Time Subscriptions (Postgres LISTEN/NOTIFY)                │   │
│  │                                                                   │   │
│  │ Channels:                                                         │   │
│  │ ├── match:{matchId}       (Updates to specific match)            │   │
│  │ ├── user:{userId}:bets    (User's bet slip changes)              │   │
│  │ ├── live_matches          (All live match changes)               │   │
│  │ └── match_updates         (General match broadcast)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ API Calls
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼───────┐  ┌──▼──────────┐  ┌──▼────────────────┐
│ Gemini API    │  │ Sports APIs │  │ Other Services   │
│               │  │             │  │                  │
│ - Predictions │  │ - Scores    │  │ - Email (SMTP)   │
│ - Analysis    │  │ - Stats     │  │ - SMS (Twilio)   │
│ - Confidence  │  │ - Odds      │  │ - Payments       │
│ - Factors     │  │ - Teams     │  │ - Analytics      │
└───────────────┘  └─────────────┘  └──────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
User                                Frontend                 Backend
  │                                    │                        │
  ├─ Enter email & password ────────→ │                        │
  │                                    ├─ signUp() ───────────→ │
  │                                    │   or signIn()          │
  │                                    │                        ├─ Auth check
  │                                    │                        ├─ Hash password
  │                                    │                        ├─ Create/verify JWT
  │                                    │ ←────────── Session ───┤
  │                                    │                        ├─ Create profile
  │                                    ├─ Save session ────────→ │
  │ ←────── User logged in ──────────┤                        │
  │                                    │                        │
```

### 2. AI Prediction Generation Flow

```
User clicks                        Frontend                Backend (Edge Fn)
"Get Prediction"                      │                            │
  │                                    │                            │
  ├─────────────────────────────────→ │                            │
  │                                    ├─ Gather match data        │
  │                                    ├─ Call predict-match ─────→│
  │                                    │   (REST API)              │
  │                                    │                           ├─ Format prompt
  │                                    │                           ├─ Call Gemini API
  │                                    │                           │  (Process: 2-5s)
  │                                    │                           ├─ Parse response
  │                                    │ ←────── Prediction data ──┤
  │                                    │                           ├─ Save to DB
  │                                    │  (JSON response)          │
  │ ←────── Display probabilities ───┤                            │
  │  Home Win: 58.5%                  │                            │
  │  Draw:     22.3%                  │                            │
  │  Away Win: 19.2%                  │                            │
  │                                    │                            │
```

### 3. Real-Time Match Update Flow

```
Sports API (External)        refresh-live-data       Database        Frontend
or Manual Update             (Edge Function)           & Realtime      Client
       │                            │                    │               │
       ├─ Match update ────────────→│                    │               │
       │  (new score, stats)        ├─ Format data      │               │
       │                            ├─ Update DB ──────→│               │
       │                            │                    ├─ NOTIFY ─────→│
       │                            │                    │  (WebSocket)  │
       │                            └─ Broadcast ──────→│  listening    │
       │                                                 │               ├─ Update UI
       │                                                 │               │
```

### 4. Bet Slip Creation & Tracking Flow

```
User selects prediction         Frontend                Database
and stakes amount                 │                        │
       │                           │                        │
       ├─ Pick prediction type ──→ │                        │
       │  (Home Win, Draw, etc)    │                        │
       │                           │                        │
       ├─ Enter stake amount ────→ │                        │
       │  (e.g., $50)              │                        │
       │                           │                        │
       ├─ Click "Save" ───────────→ │                        │
       │                           ├─ saveBetSlip() ──────→ │
       │                           │                        ├─ Insert record
       │                           │                        ├─ Update stats
       │                           │ ←────── Confirmation ──┤
       │ ←────── "Saved!" ────────┤                        │
       │                           ├─ Refresh history ────→ │
       │                           │                        │
       │                           ←───── Real-time sub ───┤
       │                           │  (bet_slip channel)    │
       │ ←────── Auto-update ─────┤                        │
       │   prediction history      │                        │
```

### 5. User Statistics Update Flow

```
Match Result Published          Database Trigger        User Profile
       │                               │                    │
       ├─ Mark bet as Won/Lost ──────→│                    │
       │  (Update bet_slips)           │                    │
       │                               ├─ Trigger fired
       │                               │  (update_user_stats)
       │                               │                    │
       │                               ├─ Calculate:
       │                               │  - Total predictions
       │                               │  - Wins/Losses
       │                               │  - Win percentage
       │                               │  - Profit/loss ──→│
       │                               │                    ├─ Update user_profiles
       │                               │                    │
       │                               │ ←───── Updated ────┤
       │                               │   stats
       │ ←────── Display new stats ──┤                    │
       │  (Automatic refresh)         │                    │
```

## Technology Stack

### Frontend
```
React 18.3
├── React Router (Navigation)
├── React Query (Data management)
├── Shadcn/ui (Components)
├── Tailwind CSS (Styling)
├── TypeScript (Type safety)
└── Vite (Build tool)
```

### Backend
```
Supabase
├── PostgreSQL (Database)
├── Postgres Realtime (WebSocket)
├── Supabase Auth (Authentication)
├── Edge Functions (Deno)
└── Storage (File uploads)
```

### External APIs
```
Google Cloud
└── Gemini 2.5 Flash (AI predictions)

Sports Data
├── football-data.org (Football)
├── SofaScore (Multiple sports)
├── ESPN API (Sports data)
└── TheSportsDB (Metadata)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│           Frontend Security Layer                   │
│ ├── HTTPS only                                      │
│ ├── Secure session storage (localStorage)          │
│ ├── Token refresh on auth state change             │
│ └── Client-side input validation                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│        Backend Security Layer (Supabase)            │
│ ├── JWT token verification                         │
│ ├── Row Level Security (RLS) policies              │
│ ├── Password hashing (bcrypt)                      │
│ ├── API key management                             │
│ └── CORS configuration                             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│      Database Security Layer (PostgreSQL)           │
│ ├── User isolation via RLS                         │
│ ├── No direct DB access (via API only)             │
│ ├── Encrypted connection (SSL)                     │
│ └── Automated backups                              │
└─────────────────────────────────────────────────────┘
```

## Scaling Considerations

### Current Capacity
- ✅ Single user concurrent
- ✅ 100s of concurrent users (Supabase free tier)
- ✅ 10k+ match records
- ✅ Real-time for 50+ concurrent subscriptions

### Scaling Path
1. **Tier 1**: Supabase free → Pro ($25/month)
2. **Tier 2**: Add caching layer (Redis)
3. **Tier 3**: Separate read replicas
4. **Tier 4**: Database sharding by sport/league
5. **Tier 5**: CDN for static assets

### Optimization Strategies
- Database indexing (✅ implemented)
- Query optimization (✅ done)
- Real-time batching (future)
- Prediction caching (future)
- API rate limiting (future)

## Deployment Architecture

### Development
```
Local Machine
├── npm run dev (Port 8080)
├── Supabase local (optional)
└── Connected to cloud Supabase
```

### Production
```
CDN (Vercel/Netlify)
├── Static assets
├── Edge caching
└── Automatic deployments

Supabase Cloud
├── PostgreSQL (managed)
├── Edge Functions (serverless)
├── Auth (managed)
└── Realtime (managed)
```

## Performance Optimization

### Metrics
- **API Response**: < 500ms
- **Prediction Generation**: 2-5s
- **Real-time Update Latency**: < 100ms
- **Page Load**: < 3s (cached)

### Optimizations Applied
1. ✅ Database indexes on frequently queried columns
2. ✅ React Query caching
3. ✅ Real-time WebSocket subscriptions (no polling)
4. ✅ Component lazy loading
5. ✅ Code splitting in build

### Potential Further Optimizations
1. Redis cache for predictions
2. Materialized views for statistics
3. Query result caching
4. Batch prediction generation
5. Client-side infinite scroll

## Monitoring & Observability

### Metrics to Track
- API response times
- Real-time subscription count
- Active user sessions
- Prediction accuracy
- System errors & failures

### Tools
- Supabase Dashboard (logs)
- Browser DevTools (client)
- Google Cloud Console (Gemini API)
- Custom analytics (future)

---

This architecture is designed to be:
- **Scalable**: From 1 user to 100k+ concurrent
- **Reliable**: Auto-healing, backup/recovery
- **Performant**: Real-time updates, optimized queries
- **Secure**: RLS, JWT, encrypted connections
- **Maintainable**: Modular code, clear separation of concerns
