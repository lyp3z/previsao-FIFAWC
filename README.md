# ⚽ GoalForge

**Real-time World Cup 2026 tracker and scenario simulator API.**

Track live matches, compute group standings with official tiebreaker rules, generate the knockout bracket from actual results, and simulate "what-if" scenarios — all through a clean REST API built for Vercel.

> Built by [lypecs](https://github.com/lypecs)

---

## What it does

- Live match tracking with near real-time polling
- Group standings with full FIFA tiebreaker logic (points → goal diff → goals scored → head-to-head)
- Auto-generated Round of 32 bracket from qualified teams (top 2 per group + 8 best thirds)
- Scenario simulator: override any match score and instantly see recalculated standings, bracket and team paths — without touching official data
- Automated sync via Vercel Cron (every 1–10 min depending on entity)
- Redis cache layer (Upstash) for hot responses with post-sync invalidation

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (Neon or Supabase) |
| Cache | Upstash Redis |
| Validation | Zod |
| HTTP client | Axios |
| Scheduler | Vercel Cron |
| Deploy | Vercel |

---

## Project structure

```
prisma/
  schema.prisma        # Full data model
  seed.ts              # 48 teams · 12 groups · 72 matches · full bracket

src/
  app/api/             # Route Handlers (one file per endpoint)
    competitions/
    competition/current-stage/
    groups/
    teams/
    matches/
    standings/
    knockout/
    simulator/
    sync/              # Internal Cron endpoints
    healthz/
  lib/
    prisma.ts          # Singleton client
    redis.ts           # Upstash with graceful fallback
    env.ts             # Zod env validation
    api-response.ts    # ok() / fail() helpers
    cron-auth.ts       # Bearer + x-cron-secret guard
  modules/
    competitions/      # service
    groups/            # service
    teams/             # service
    matches/           # service
    standings/         # service + computeGroupStandings()
    knockout/          # service + bracket + team path
    simulator/         # stateless simulation engine
    sync/              # syncMatches, syncStandings, syncKnockout …
  providers/sports/
    types.ts           # SportsDataProvider interface
    mock-provider.ts   # Reads from local DB (dev)
    real-provider.ts   # Calls external API (prod)
  shared/validators/
    common.ts          # matchFiltersSchema
    simulator.ts       # simulatorPayloadSchema
```

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/lypecs/goalforge.git
cd goalforge
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in at minimum:

```env
DATABASE_URL=postgres://...      # pooled URL (Neon / Supabase pgBouncer)
DIRECT_DATABASE_URL=postgres://... # direct URL for migrations
CRON_SECRET=<random-secret>      # openssl rand -hex 32
```

Redis and the external sports provider are optional in development — both have graceful fallbacks.

### 3. Database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # apply schema to DB
npm run db:seed       # seed 48 teams, 12 groups, 72 group stage matches
```

### 4. Run

```bash
npm run dev           # http://localhost:3000
```

The root page (`/`) shows a full index of all available endpoints.

---

## API endpoints

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | DB + Redis health check |
| GET | `/api/competitions` | All competitions |
| GET | `/api/competitions/current` | Current competition |
| GET | `/api/competition/current-stage` | Active stage |
| GET | `/api/groups` | All 12 groups |
| GET | `/api/groups/:code` | Single group + teams |
| GET | `/api/groups/:code/standings` | Group standings |
| GET | `/api/teams` | All 48 teams |
| GET | `/api/teams/:id` | Team detail |
| GET | `/api/teams/:id/matches` | Team match schedule |
| GET | `/api/teams/:id/path` | Team knockout path |
| GET | `/api/matches` | Matches (filterable) |
| GET | `/api/matches/live` | Live matches only |
| GET | `/api/matches/today` | Today's matches |
| GET | `/api/matches/upcoming` | Next scheduled |
| GET | `/api/matches/results` | Finished matches |
| GET | `/api/standings` | All standings |
| GET | `/api/standings/:code` | Standings by group |
| GET | `/api/knockout` | All knockout slots |
| GET | `/api/knockout/bracket` | Bracket by stage |
| GET | `/api/knockout/path/:teamId` | Team bracket path |

`GET /api/matches` accepts query params: `date`, `stage`, `group`, `status`, `team`, `liveOnly`

### Simulator

Non-persistent. Applies score overrides in memory, recalculates everything and returns results without writing to the database.

| Method | Path | Body |
|---|---|---|
| POST | `/api/simulator/standings` | `{ overrides }` |
| POST | `/api/simulator/knockout` | `{ overrides }` |
| POST | `/api/simulator/full` | `{ overrides }` |
| POST | `/api/simulator/team-path` | `{ teamId, overrides }` |

Example:

```json
{
  "teamId": "team_bra",
  "overrides": [
    { "matchId": "match_001", "homeScore": 3, "awayScore": 0 },
    { "matchId": "match_007", "homeScore": 1, "awayScore": 2 }
  ]
}
```

### Sync (Vercel Cron — protected)

All sync endpoints require `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`.

| Method | Path | Schedule |
|---|---|---|
| POST | `/api/sync/live` | Every 2 min |
| POST | `/api/sync/matches` | Every 10 min |
| POST | `/api/sync/standings` | Every 10 min |
| POST | `/api/sync/knockout` | Every 10 min |
| POST | `/api/sync/current-stage` | Every 5 min |
| POST | `/api/sync/competitions` | Every 30 min |
| POST | `/api/sync/teams` | On demand |
| POST | `/api/sync/groups` | On demand |

---

## Vercel deploy

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in **Project Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled connection (Neon / Supabase) |
| `DIRECT_DATABASE_URL` | Yes | Direct connection for migrations |
| `CRON_SECRET` | Yes | `openssl rand -hex 32` |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash console |
| `SPORTS_PROVIDER` | No | `mock` (default) or `real` |
| `SPORTS_API_KEY` | If `real` | External provider key |
| `SPORTS_API_BASE_URL` | If `real` | External provider URL |

4. Deploy. Cron jobs in `vercel.json` activate automatically on Vercel Pro / paid plans.

### Recommended stack
- **Vercel** (hosting + cron)
- **Neon** (serverless Postgres — free tier available)
- **Upstash Redis** (serverless Redis — free tier available)

---

## Architecture notes

- Every route handler is stateless — no in-memory state between requests
- All routes use `export const runtime = 'nodejs'` (Prisma is not Edge-compatible)
- Prisma client uses a global singleton to avoid connection leaks on hot reload
- The simulator never writes to the database — overrides are computed in memory only
- Cache keys are namespaced by entity + competitionId; all invalidated after sync runs
- The sports provider is swappable: `SPORTS_PROVIDER=mock` reads from DB, `real` calls an external API

---

## License

MIT — do whatever you want with it.

---

*GoalForge — forged for the beautiful game.*
