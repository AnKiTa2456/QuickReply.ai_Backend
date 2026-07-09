# Research Paper Reading Tracker — Backend

Express + PostgreSQL API for a research paper reading tracker. Serves paper
CRUD/filtering and reading analytics to the companion
[frontend](https://github.com/AnKiTa2456/QuickReply.ai_Frontend).

## Stack

Node.js, Express, `pg` (works with any Postgres — local, Supabase, RDS, etc).

## Local development

### 1. Database

Either a local Postgres instance:
```bash
createdb quickreply_papers
```
or a hosted one (e.g. Supabase — *Project Settings → Database → Connection
string → URI*).

### 2. Backend

```bash
cp .env.example .env   # set DATABASE_URL
npm install
npm run migrate        # creates the papers table
npm run seed             # optional: 8 sample papers across all domains/stages
npm run dev              # http://localhost:4000
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `PORT` | no | Defaults to `4000` |

## Verifying it works

```bash
curl http://localhost:4000/api/meta
npm run seed
curl http://localhost:4000/api/papers
curl http://localhost:4000/api/analytics
```

## API reference

Base URL: wherever this is deployed. All bodies are JSON. No authentication.

### `GET /api/meta`
Returns the fixed dropdown/enum values the frontend uses.
```json
{
  "domains": ["Computer Science", "Biology", "Physics", "Chemistry", "Mathematics", "Social Sciences"],
  "readingStages": ["Abstract Read", "Introduction Done", "Methodology Done", "Results Analyzed", "Fully Read", "Notes Completed"],
  "impactScores": ["High Impact", "Medium Impact", "Low Impact", "Unknown"],
  "dateRanges": ["this_week", "this_month", "last_3_months", "all_time"]
}
```

### `GET /api/papers`
Lists papers, most recent first. All query params optional, combine with AND;
`readingStage`/`domain`/`impactScore` are repeatable (OR within the same param).

| Query param | Repeatable | Example |
|---|---|---|
| `readingStage` | yes | `?readingStage=Fully Read&readingStage=Notes Completed` |
| `domain` | yes | `?domain=Biology&domain=Physics` |
| `impactScore` | yes | `?impactScore=High Impact` |
| `dateRange` | no | `this_week` \| `this_month` \| `last_3_months` \| `all_time` |

### `POST /api/papers`
```json
{
  "title": "Attention Is All You Need",
  "firstAuthor": "Vaswani",
  "domain": "Computer Science",
  "readingStage": "Fully Read",
  "citationCount": 90000,
  "impactScore": "High Impact",
  "dateAdded": "2026-07-01"
}
```
`title`/`firstAuthor` required non-empty; `domain`/`readingStage`/`impactScore`
must match the `/api/meta` enums; `citationCount` a non-negative integer;
`dateAdded` optional (`YYYY-MM-DD`, defaults to today). Returns `201` with the
created paper, or `400` with `{ "error": "..." }` on validation failure.

### `DELETE /api/papers/:id`
Returns `204`.

### `GET /api/analytics`
Returns `funnel` (count per reading stage, all 6 always present), `scatter`
(citation count + impact score per paper), `stackedByDomain` (all 6 domains ×
all 6 stage keys), and `summary` (`papersByStage`, `avgCitationsPerDomain`,
`completionRate`, `totalPapers`, `fullyReadCount`).

## Deploying

Render/Railway/Fly all work — set `DATABASE_URL` (a Supabase project works
well for a free hosted Postgres), run `npm run migrate` once against it, then
`npm start`. Point the frontend's `VITE_API_URL` at this service's URL.
