# SeismicScope Backend

REST API for earthquake data — import, storage, spatial queries, analytics, and caching. Handles 800k+ records with PostGIS spatial indexing and Redis caching layer.

## Links

|              | URL                                                            |
| ------------ | -------------------------------------------------------------- |
| Frontend     | [seismic-scope.vercel.app](https://seismic-scope.vercel.app)   |
| Backend      | [https://seismic-scope-be.rest](https://seismic-scope-be.rest) |
| Swagger Docs | [/api/docs](https://seismic-scope-be.rest/api/docs)            |
| Health check | [health check](https://seismic-scope-be.rest/health)           |

## Tech Stack

|            | Technology                     |
| ---------- | ------------------------------ |
| Framework  | NestJS 10, TypeScript          |
| ORM        | Prisma 7                       |
| Database   | PostgreSQL 15 + PostGIS 3.4    |
| Cache      | Redis 7                        |
| Queue      | BullMQ                         |
| Docs       | Swagger / OpenAPI              |
| Monitoring | Sentry                         |
| CI/CD      | GitHub Actions, Docker Compose |

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Docker & Docker Compose

### Setup

```bash
cp .env.example .env             # edit with your values
docker compose up -d             # start PostgreSQL + Redis
npm install
npx prisma db push               # apply schema + indexes
npm run start:dev                 # http://localhost:3000
```

Swagger docs available at `/api/docs`.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/seismic
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=seismic
IO_REDIS_HOST=localhost
IO_REDIS_PORT=6379
PORT=3000
JWT_SECRET=your-secret
NODE_ENV=develop
FRONTEND_URL=http://localhost:3000
SENTRY_DSN=your-dsn
```

## API

| Method | Endpoint                           | Description                           |
| ------ | ---------------------------------- | ------------------------------------- |
| `GET`  | `/health`                          | Health check + DB status              |
| `POST` | `/auth/login`                      | Login (sets HttpOnly cookie)          |
| `POST` | `/auth/logout`                     | Logout                                |
| `GET`  | `/auth/me`                         | Current user                          |
| `GET`  | `/earthquakes`                     | Paginated list with filters + sorting |
| `GET`  | `/earthquakes/:id`                 | Single earthquake                     |
| `GET`  | `/earthquakes/magnitude-histogram` | Magnitude distribution                |
| `GET`  | `/analytics/time-series`           | Time-series by interval               |
| `GET`  | `/analytics/stats`                 | Aggregate statistics                  |
| `GET`  | `/map`                             | Points within viewport (PostGIS)      |
| `POST` | `/import/upload`                   | Upload CSV (admin, max 100MB)         |
| `GET`  | `/import/status/:id`               | Import job progress                   |

## Project Structure

```
src/
  modules/
    earthquakes/     Cursor pagination, sorting, magnitude histogram
    analytics/       Time-series (DATE_TRUNC), aggregate stats
    map/             Spatial queries (ST_MakeEnvelope), zoom-based limits
    import/          CSV upload + BullMQ processor (batch 5000 rows)
    auth/            JWT cookie strategy, RolesGuard
    redis/           Global cache service (get/set/del with TTL)
    health/          Health check endpoint
  lib/
    build-earthquake-where.ts    Prisma + raw SQL filter builders
  constants/
    index.ts                     SORT_MAP, SRID, defaults
prisma/
  schema.prisma                  Earthquake (geom, GIST indexes), ImportJob
```

## Redis Caching

| Key pattern           | TTL   | Endpoint                           |
| --------------------- | ----- | ---------------------------------- |
| `ts:{filters}`        | 5 min | `/analytics/time-series`           |
| `stats:{filters}`     | 5 min | `/analytics/stats`                 |
| `histogram:{filters}` | 5 min | `/earthquakes/magnitude-histogram` |
| `map:{bounds}:{zoom}` | 1 min | `/map`                             |

## Testing

```bash
npm test
npm run test:cov      # coverage report
```

[![codecov](https://codecov.io/github/SeismicScope/seismic-backend/graph/badge.svg?token=OF1NT5SQB2)](https://codecov.io/github/SeismicScope/seismic-backend)

## Deployment

GitHub Actions: push to `main` → run tests → SSH to Droplet → `docker compose up -d --build` → `prisma db push`.

```
Docker Compose services:
  backend     Node.js (port 8080, 1.2GB mem limit)
  postgres    postgis/postgis:15-3.4
  redis       redis:7
```
