# ScamSentry Backend — Production Deployment Guide

This guide details the step-by-step process of deploying the FastAPI backend, PostgreSQL database, and Redis cache.

---

## 1. Environment Variables Checklist

Ensure these variables are configured in your production hosting dashboard:

| Variable Name | Description | Recommended Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (must use `postgresql+asyncpg://`) | Mapped from database service |
| `REDIS_URL` | Redis connection URL | Mapped from cache service |
| `API_SECRET_KEY` | Secret key used to verify admin requests in the `X-Admin-Key` header | Generate a strong random key |
| `ENVIRONMENT` | Application running mode | `production` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins permitted to request APIs | E.g. `https://scam-sentry.vercel.app` (restricts CORS) |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing API Key for Layer 3 threat checks | Obtain from Google Developer Console |
| `GEMINI_API_KEY` | (Optional) Gemini API Key for future layer integration | Obtain from Google AI Studio |

---

## 2. Option A: Deploying on Render (Recommended)

We provide a **Render Blueprint** configuration ([render.yaml](render.yaml)) at the root of the repository, which automatically links the FastAPI app, PostgreSQL, and Redis cache.

### Steps:
1. Push your repository to your GitHub account.
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** (top right) and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` and display the blueprint configuration checklist:
   - Mappings for `DATABASE_URL` and `REDIS_URL` are established automatically.
   - `API_SECRET_KEY` is generated automatically.
6. Under environment parameters:
   - Provide your **`GOOGLE_SAFE_BROWSING_API_KEY`** (obtained from Google Cloud Console).
   - Provide your **`GEMINI_API_KEY`** (if utilizing AI checking layers).
   - Set **`CORS_ALLOWED_ORIGINS`** to your live Next.js Vercel frontend URL (e.g. `https://scam-sentry.vercel.app`).
7. Click **Apply**. Render will spin up all three services.
8. Once healthy, Render will provide a public URL for your backend (e.g., `https://scamsentry-backend.onrender.com`).

---

## 3. Option B: Deploying on Railway

Railway supports deploying multiple services together in a single project template.

### Steps:
1. Log in to [Railway](https://railway.app).
2. Click **New Project** > **Provision PostgreSQL**.
3. Click **New** > **Provision Redis**.
4. Click **New** > **GitHub Repo** and connect your ScamSentry repository.
5. In your web service settings, configure:
   - **Root Directory**: `backend` (Railway will build from `/backend/Dockerfile`).
6. Navigate to the **Variables** tab of the web service and reference your database and cache secrets:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (change protocol prefix from `postgresql://` to `postgresql+asyncpg://` if needed in template settings).
   - `REDIS_URL` = `${{Redis.REDIS_URL}}`
   - `ENVIRONMENT` = `production`
   - `API_SECRET_KEY` = (create a secure value)
   - `CORS_ALLOWED_ORIGINS` = `https://scam-sentry.vercel.app`
   - `GOOGLE_SAFE_BROWSING_API_KEY` = (your key)
7. Railway will build your container and deploy the server.

---

## 4. Option C: Deploying to a Self-Hosted VPS

For Virtual Private Servers (AWS EC2, DigitalOcean Droplet, Linode, etc.), use **Docker Compose**.

### Steps:
1. Install Docker and Docker Compose on the VPS.
2. Clone your repository onto the host:
   ```bash
   git clone https://github.com/Chaitanyahoon/ScamSentry.git
   cd ScamSentry/backend
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   nano .env # Set values
   ```
   *Note: In VPS, set `DATABASE_URL` to `postgresql+asyncpg://postgres:password@db:5432/scamsentry` and `REDIS_URL` to `redis://redis:6379` to route within the internal docker bridge network.*
4. Start the stack in detached mode:
   ```bash
   docker compose up -d --build
   ```
5. Set up an Nginx reverse proxy with SSL (using Let's Encrypt) to proxy requests on domain `api.yourdomain.com` to `http://localhost:8000`.

---

## 5. Database Migrations in Production

The backend is configured to **auto-run Alembic migrations on startup** (`run_migrations()` inside `lifespan` in `app/main.py`).
- During initial boot, SQLAlchemy creates the tables (`ledger`, `scans`, `scan_results`, `global_incidents`, `active_brand_lockdowns`) using Alembic automatically.
- **Scale Warning**: If scaling to multiple replicas (containers), multiple containers starting simultaneously can result in migration race conditions. For scaling, disable auto-migrations in `app/main.py` and run them as an independent build-step:
  ```bash
  alembic upgrade head
  ```

---

## 6. PgBouncer & Connection Pooling

FastAPI uses SQLAlchemy connection pooling natively (`pool_size=10`, `max_overflow=20`, `pool_recycle=300`). Under high concurrent traffic, it is recommended to connect via Render's **PgBouncer** proxy to multiplex connections:
1. In your Render Database dashboard, copy the **PgBouncer Connection String**.
2. Replace the connection string port `5432` with `6432`.
3. Prepend the driver prefix `postgresql+asyncpg://` to the connection string.
4. Set this as your backend `DATABASE_URL` environment variable.

---

## 7. Valkey Domain Caching

The backend automatically caches L2 domain reputation checks (WHOIS registration dates, SSL certificates validation status, low-reputation registrars) in Valkey under the `domain:rep:<hostname>` namespace for **24 hours**. 
- Subsequent scan requests targeting different URL paths on the same host are returned in milliseconds without triggering blocking socket connections, improving responsiveness and avoiding API limit blocks.

---

## 8. Scheduled Workflows (GitHub Actions Crons)

The project includes two pre-configured GitHub Action workflows under `.github/workflows/`:
1. **OSINT Database Sync (`osint-sync.yml`)**: Runs every 6 hours to fetch active URLhaus feeds and update the PostgreSQL threat ledger.
   - *Setup*: Add your `API_SECRET_KEY` as a GitHub Repository Secret.
2. **Keep-Alive Ping (`keep-alive.yml`)**: Pings the `/health` endpoint of your Render backend every 12 minutes to keep the Free tier web service awake, eliminating cold starts.

