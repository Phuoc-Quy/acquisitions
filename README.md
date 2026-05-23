# Acquisitions API Docker Setup (Neon Local + Neon Cloud)
This project is dockerized for two environments:
- Development: app + Neon Local proxy (ephemeral Neon branches)
- Production: app + Neon Cloud database URL (no local proxy)

## Files added
- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`
- `.dockerignore`

## How environment switching works
The app reads `DATABASE_URL` from environment variables.

- Development (`.env.development`):
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`
  - `NEON_API_KEY` and `NEON_PROJECT_ID` are provided to Neon Local
  - Neon Local creates ephemeral branches by default when container starts

- Production (`.env.production`):
  - `DATABASE_URL=postgresql://...neon.tech...`
  - No Neon Local service is started
  - App connects directly to Neon Cloud

## Development (Neon Local)
1. Fill `.env.development`:
   - `NEON_API_KEY`
   - `NEON_PROJECT_ID`
   - Optional: `PARENT_BRANCH_ID` (to choose branch parent for ephemeral branches)
2. Start local stack:

```bash
docker compose -f docker-compose.dev.yml up --build
```

You can also use the default `docker-compose.yml` (same development setup):

```bash
docker compose up --build
```

3. App runs on `http://localhost:3000`.
4. App DB connection inside Docker network is:
   - `postgres://neon:npg@neon-local:5432/neondb`

When the stack stops, Neon Local deletes ephemeral branches by default (`DELETE_BRANCH=true` in compose).

## Production (Neon Cloud)
1. Fill `.env.production` with real secrets:
   - `DATABASE_URL` (Neon Cloud URL)
   - `JWT_SECRET`
   - Optional runtime vars (`PORT`, `LOG_LEVEL`)
2. Start production stack:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

3. In production, no Neon Local proxy is used. The app uses the cloud `DATABASE_URL` only.

## Notes about `@neondatabase/serverless` in local Docker
`src/config/database.js` is configured to detect Neon Local hosts (`neon-local`, `localhost`, `127.0.0.1`) and set:
- `neonConfig.fetchEndpoint=http://<host>:5432/sql`
- `neonConfig.useSecureWebSocket=false`
- `neonConfig.poolQueryViaFetch=true`

This enables the same app code to work with:
- Neon Local in development
- Neon Cloud in production

## Stop commands
Development:

```bash
docker compose -f docker-compose.dev.yml down
```

or, when using `docker-compose.yml`:

```bash
docker compose down
```

Production:

```bash
docker compose -f docker-compose.prod.yml down
```
