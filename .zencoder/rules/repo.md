---
description: Repository Information Overview
alwaysApply: true
---

# Sports Lottery Prediction Platform Information

## Summary
This repository is a **single-project TypeScript/React application** built with **Vite**, backed by **Supabase** (PostgreSQL, Auth, Realtime), and extended with **Supabase Edge Functions** for AI prediction and live sports ingestion. The frontend renders prediction workflows, authentication, and history views, while backend logic is split between SQL migrations and Deno-based serverless functions.

The codebase also includes operational helper scripts in **Node.js** and a **Python bridge** script for SofaScore integration.

## Structure
- **`src/`**: Main frontend application (pages, components, hooks, contexts, library modules).
- **`supabase/`**: Backend infrastructure assets:
  - `migrations/` SQL schema and policy definitions.
  - `functions/` Deno edge functions (`predict-match`, `fetch-sports-data`, `refresh-live-data`).
  - `config.toml` local Supabase runtime configuration.
- **`scripts/`**: TypeScript utility scripts (e.g., fixture seeding).
- **`public/`**: Static assets served by Vite.
- **`dist/`**: Built frontend output.
- **Root operational scripts**: `fetch-real-matches.js`, `load-fixtures.js`, `load-demo-matches.js`, `sofascore-bridge.js`, `sofascore-bridge.py`.

### Main Repository Components
- **Frontend SPA**: React + TypeScript UI and routing, Supabase client calls, state providers.
- **Supabase database layer**: SQL migrations for user profiles, matches, predictions, bet slips, odds, and lottery tables.
- **Edge function layer**: Serverless APIs for prediction generation and match synchronization.
- **Data ingestion helpers**: Local scripts to seed fixtures and fetch live match feeds from external APIs.

## Language & Runtime
**Primary Languages**:
- TypeScript/TSX (frontend + scripts + edge functions)
- JavaScript (Node helper scripts)
- SQL (Supabase schema/migrations)
- Python (optional SofaScore bridge)

**Runtime/Target Information**:
- **Node.js**: README declares `Node.js 16+` prerequisite.
- **Frontend toolchain**:
  - TypeScript `^5.5.3`
  - Vite `^5.4.1`
  - React `^18.3.1`
  - `tsconfig.app.json` target: `ES2020`
- **Edge Functions**:
  - Deno runtime style imports (`deno.land`, `Deno.env` usage)
  - Standard library pinned to `std@0.168.0` via import map
  - Supabase JS in edge functions pinned to `@supabase/supabase-js@2.44.0`
- **Database**:
  - Supabase config sets PostgreSQL `database_version = "15"`

**Build System**: Vite + TypeScript + PostCSS/Tailwind

**Package Managers / Dependency Managers**:
- **npm** (root `package.json`, `package-lock.json`)
- **pip** (optional for `sofascore-bridge.py`, via `pip install sofascore-wrapper`)

## Dependencies
**Main Dependencies (frontend/app runtime)**:
- React ecosystem: `react`, `react-dom`, `react-router-dom`
- Data/query/state: `@tanstack/react-query`
- Backend client: `@supabase/supabase-js`, `@supabase/auth-ui-react`
- Validation/forms: `zod`, `react-hook-form`, `@hookform/resolvers`
- UI stack: extensive Radix UI packages, `sonner`, `lucide-react`, `recharts`, `next-themes`
- Utility libs: `uuid`, `clsx`, `tailwind-merge`, `date-fns`, `marked`

**Development Dependencies**:
- Build/dev: `vite`, `@vitejs/plugin-react-swc`, `typescript`
- Linting: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`
- Styling pipeline: `tailwindcss`, `@tailwindcss/typography`, `postcss`, `autoprefixer`, `tailwindcss-animate`

## Build & Installation
```bash
npm install
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
```

### Supabase and Function Operations (as documented)
```bash
# Apply schema (manual SQL migration execution in Supabase)
# supabase/migrations/001_initial_schema.sql

# Deploy edge functions
supabase functions deploy predict-match
supabase functions deploy fetch-sports-data
supabase functions deploy refresh-live-data
```

### Local Utility Script Operations
```bash
node load-fixtures.js
node fetch-real-matches.js
npx ts-node scripts/seed-fixtures.ts
python3 sofascore-bridge.py
```

## Main Entry Points & Application Flow
**Frontend entry points**:
- `src/main.tsx` mounts `<App />`
- `src/App.tsx` configures providers and routes (`/`, `/auth`, `/history`, fallback not-found)

**Backend integration entry points**:
- `src/lib/supabase.ts` initializes client and exposes auth/data/edge-function helper calls.
- Edge function handlers:
  - `supabase/functions/predict-match/index.ts`
  - `supabase/functions/fetch-sports-data/index.ts`
  - `supabase/functions/refresh-live-data/index.ts`

**Database bootstrap files**:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_lottery_tables.sql`

**Key configuration files**:
- `package.json`
- `vite.config.ts`
- `eslint.config.js`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `supabase/config.toml`
- `supabase/functions/import_map.json`

## External Services & Integrations
- **Supabase**: Auth, database, realtime, edge function invocation.
- **Google Gemini API**: Used in `predict-match` function (`gemini-2.5-flash` endpoint).
- **Sports data providers**:
  - SofaScore (primary in ingestion logic)
  - football-data.org (fallback path)
  - API-Football and TheSportsDB (used in helper scripts)

## Testing & Validation
**Automated test framework**:
- No project-level automated test framework/configuration was found in root configuration files.
- `package.json` does **not** define a `test` script.

**Validation and quality checks present**:
- ESLint configured via `eslint.config.js` for TypeScript/React rules.
- Type checking through TypeScript configuration and Vite build flow.

**Validation commands**:
```bash
npm run lint
npm run build
```

**Testing approach documented**:
- README includes a **manual testing workflow** (auth, live/upcoming matches, prediction generation, bet slip save, history checks, realtime behavior).

## Project Organization Assessment
This is a **single-project repository with layered architecture**, not a multi-package monorepo:
1. **Presentation layer** in `src/`.
2. **Platform backend layer** in Supabase (SQL + RLS policies).
3. **Serverless integration layer** in `supabase/functions`.
4. **Operational data scripts** at repository root and `scripts/`.

The repository is operationally cohesive around one product domain (sports lottery prediction) with multiple runtime contexts (browser, Node scripts, Deno edge functions, optional Python helper) coordinated through shared Supabase resources.
