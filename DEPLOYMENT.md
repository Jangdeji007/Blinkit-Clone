# Blinkit Clone — Deployment Guide

Complete step-by-step guide to deploy this project on the **free tier** using Neon (PostgreSQL), Render (Django API), and Vercel (React frontend).

**Stack:** Django REST Framework + React (Vite) + PostgreSQL + JWT

---

## Architecture

```mermaid
flowchart LR
  User[Browser] --> Vercel[Vercel React]
  Vercel -->|HTTPS API| Render[Render Django]
  Render --> Neon[Neon PostgreSQL]
```

| Service | Role | URL example |
|---------|------|-------------|
| **Vercel** | React website (what users open) | `https://your-project.vercel.app` |
| **Render** | Django REST API (backend only) | `https://your-service.onrender.com` |
| **Neon** | PostgreSQL database | Connection string (not public) |

**Cost:** $0 on free tier for assignment/demo use.

**Note:** Render free tier sleeps after ~15 minutes idle. The first request after sleep may take ~30 seconds.

---

## Prerequisites

Before deploying, ensure you have:

1. This project pushed to a **GitHub** repository
2. Free accounts (no credit card required for basic tier):
   - [GitHub](https://github.com)
   - [Neon](https://neon.tech) — PostgreSQL
   - [Render](https://render.com) — Django backend
   - [Vercel](https://vercel.com) — React frontend

---

## Optional: Local development first

Test locally before deploying.

### 1. Start PostgreSQL (Docker)

```powershell
docker run --name blinkit-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=blinkit_db -p 5432:5432 -d postgres:16
```

If the container already exists:

```powershell
docker start blinkit-postgres
```

### 2. Backend

```powershell
cd blinkit-clone
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
cd backend
..\venv\Scripts\python manage.py migrate
..\venv\Scripts\python manage.py seed_demo
..\venv\Scripts\python manage.py runserver
```

Backend: http://127.0.0.1:8000

### 3. Frontend (separate terminal)

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

### Demo login credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Customer | `customer` | `Customer@123` |

---

## Deployment overview (order matters)

```
1. Neon     →  Create PostgreSQL database, copy DATABASE_URL
2. Render   →  Deploy Django backend
3. Vercel   →  Deploy React frontend
4. Render   →  Set CORS to your Vercel URL (if needed)
5. Test     →  Health check, login, cart flow
```

---

## Step 1: Neon — PostgreSQL database

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub login works well).
2. Click **New Project**.
3. Settings:
   - **Project name:** e.g. `blinkit-db`
   - **Region:** closest to your users (e.g. Singapore, Mumbai)
   - **PostgreSQL version:** default (16) is fine
4. Click **Create Project**.
5. On the dashboard, copy the **connection string**. It looks like:

   ```
   postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

6. Save this string — you will paste it into Render as `DATABASE_URL`.

Neon creates the database automatically. You do not need to run `CREATE DATABASE` manually.

---

## Step 2: Render — Django backend

1. Go to [render.com](https://render.com) and sign up with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select the **blinkit-clone** repository.
4. Configure the service:

| Field | Value |
|-------|-------|
| **Name** | e.g. `blinkit-api` |
| **Region** | Same region as Neon if possible |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn config.wsgi:application` |
| **Instance Type** | **Free** |

### Environment variables (Render)

Add these under **Environment**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Full Neon connection string from Step 1 |
| `DATABASE_SSL` | `true` |
| `DEBUG` | `False` |
| `SECRET_KEY` | A long random string (e.g. `blinkit-prod-secret-xyz-2026-random`) |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `PYTHON_VERSION` | `3.12.0` |

**CORS** (set after Vercel deploy in Step 4, or skip if using default regex — see Step 4):

| Key | Value (optional) |
|-----|------------------|
| `CORS_ALLOWED_ORIGINS` | `https://your-project.vercel.app` |
| `CORS_ALLOWED_ORIGIN_REGEXES` | `^https://[\w.-]+\.vercel\.app$` |

> By default, production code allows any `*.vercel.app` origin via regex. You only need `CORS_ALLOWED_ORIGINS` if you use a custom domain.

5. Click **Create Web Service** and wait for the deploy to finish (~5–10 minutes on first build).

### What `build.sh` does

The build script at [`backend/build.sh`](backend/build.sh) runs on each deploy:

1. `pip install -r requirements.txt`
2. `python manage.py collectstatic --noinput`
3. `python manage.py migrate --noinput`
4. `python manage.py seed_demo` (creates demo products and login accounts)

### Verify backend

Replace `YOUR-SERVICE` with your Render service name:

```
https://YOUR-SERVICE.onrender.com/api/health/
```

Expected response:

```json
{"status": "ok"}
```

**Important:** Opening `https://YOUR-SERVICE.onrender.com/` (root URL) shows **Not Found** — that is normal. This is an API-only backend, not a website.

---

## Step 3: Vercel — React frontend

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New Project** and import the same repository.
3. Configure the project:

| Field | Value |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | **`frontend`** (NOT `backend`) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Environment variable (Vercel)

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com/api` |

Use your actual Render URL from Step 2 (no trailing slash on the base URL; `/api` at the end).

4. Click **Deploy** and wait ~2–3 minutes.
5. Copy your production URL from the Vercel dashboard, e.g.:

   ```
   https://your-project.vercel.app
   ```

### Common mistake

| Wrong | Correct |
|-------|---------|
| Root Directory = `backend` | Root Directory = **`frontend`** |
| Framework = Django | Framework = **Vite** |

Deploying `backend` on Vercel will fail or show the wrong app. Django runs on **Render**, not Vercel.

### SPA routing

[`frontend/vercel.json`](frontend/vercel.json) already rewrites all routes to `index.html` for React Router. No extra config needed.

### Redeploy after env changes

`VITE_API_URL` is embedded at **build time**. If you change it, trigger a **Redeploy** on Vercel (Deployments → ⋮ → Redeploy).

---

## Step 4: CORS — connect frontend to backend

Production runs with `DEBUG=False`, so the backend only accepts requests from allowed frontend origins.

### Option A: Rely on default (easiest)

The backend automatically allows any Vercel URL matching:

```
^https://[\w.-]+\.vercel\.app$
```

No extra Render env vars needed if your frontend is on `*.vercel.app`.

### Option B: Exact Vercel URL (recommended for custom domains)

On Render → your web service → **Environment**, add or update:

```
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Rules:

- Use `https://` (not `http://`)
- **No trailing slash**
- Use the **Vercel** URL, not the Render URL

### Remove wrong CORS values

If you copied local dev settings to Render, **delete** this from production:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Localhost is not allowed when `DEBUG=False`.

Click **Save Changes** and wait for Render to redeploy.

### Test CORS (optional)

PowerShell:

```powershell
curl.exe -s -I "https://YOUR-SERVICE.onrender.com/api/products/" -H "Origin: https://your-project.vercel.app"
```

Look for:

```
access-control-allow-origin: https://your-project.vercel.app
```

---

## Step 5: Final verification

Use this checklist after both services are live:

- [ ] Backend health: `https://YOUR-SERVICE.onrender.com/api/health/` → `{"status":"ok"}`
- [ ] Frontend opens at your Vercel URL
- [ ] Home page shows product list (may take ~30s if Render was sleeping)
- [ ] Login as admin: `admin` / `Admin@123` → admin dashboard loads
- [ ] Login as customer: `customer` / `Customer@123` → browse, add to cart
- [ ] Checkout → Place Order → Pay Now → order appears on Orders page

**Tip:** Test in an **incognito/private** window to avoid cached old builds.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Render root `/` shows **Not Found** | No route at `/`; API-only backend | Test `/api/health/` instead |
| **CORS** error in browser console | Frontend origin not allowed | Set `CORS_ALLOWED_ORIGINS` on Render; remove `localhost` from production env |
| API calls go to `your-app.vercel.app/api/...` | `VITE_API_URL` missing or wrong | Set to `https://YOUR-SERVICE.onrender.com/api` and **redeploy Vercel** |
| Vercel build fails or wrong app | Root Directory is `backend` | Change to `frontend`, Framework **Vite** |
| Render build fails: `build.sh: permission denied` | Script not executable or CRLF line endings | Use Build Command: `bash build.sh` |
| Database connection error on Render | SSL or wrong connection string | Set `DATABASE_SSL=true`; paste full Neon URL including `?sslmode=require` |
| `ImproperlyConfigured: SECRET_KEY` | Weak/missing secret in production | Set a strong unique `SECRET_KEY` on Render |
| **502** / timeout on first visit | Render free tier waking from sleep | Wait ~30 seconds and refresh |
| Login returns **401** | Wrong password or CORS blocking preflight | Use `admin` / `Admin@123`; fix CORS first |
| Product **images 404** on production | Media files not served on Render free tier; disk is ephemeral | Demo works without images; see [Product images](#product-images-on-production) below |

### Product images on production

- Uploaded images are stored on Render's **temporary disk** and are **not served** when `DEBUG=False`.
- Seeded demo products work **without images** — login, cart, checkout, and orders all function normally.
- For persistent images in production, integrate cloud storage (e.g. Cloudinary) — not included in this guide.

---

## Re-deploying after code changes

### Backend (Render)

1. Push to GitHub:

   ```powershell
   git add .
   git commit -m "Your message"
   git push
   ```

2. Render auto-redeploys from the connected branch.

### Frontend (Vercel)

- Vercel auto-redeploys on push to the connected branch, or manually: **Deployments → Redeploy**.

### Re-seed demo data

If login accounts or products are missing, open Render **Shell** for your service:

```bash
python manage.py seed_demo
```

Safe to run multiple times — existing records are updated or skipped.

---

## Environment variables — quick reference

### Render (production backend)

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `DATABASE_SSL` | Yes | `true` |
| `DEBUG` | Yes | `False` |
| `SECRET_KEY` | Yes | long random string |
| `ALLOWED_HOSTS` | Yes | `.onrender.com` |
| `PYTHON_VERSION` | Recommended | `3.12.0` |
| `CORS_ALLOWED_ORIGINS` | Optional | `https://your-project.vercel.app` |
| `CORS_ALLOWED_ORIGIN_REGEXES` | Optional | `^https://[\w.-]+\.vercel\.app$` |

### Vercel (production frontend)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `https://your-service.onrender.com/api` |

### Local — `backend/.env`

Copy from [`backend/.env.example`](backend/.env.example):

| Variable | Default (local) |
|----------|-----------------|
| `DB_NAME` | `blinkit_db` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DATABASE_SSL` | `false` |
| `DEBUG` | `True` |

### Local — `frontend/.env`

Copy from [`frontend/.env.example`](frontend/.env.example):

| Variable | Default (local) |
|----------|-----------------|
| `VITE_API_URL` | `/api` (proxied by Vite dev server) |

---

## Project files related to deployment

| File | Purpose |
|------|---------|
| [`backend/build.sh`](backend/build.sh) | Render build script |
| [`backend/requirements.txt`](backend/requirements.txt) | Python dependencies (gunicorn, whitenoise, psycopg2) |
| [`backend/config/settings.py`](backend/config/settings.py) | Production DB, CORS, static files |
| [`frontend/vercel.json`](frontend/vercel.json) | SPA route rewrites for React Router |
| [`backend/.env.example`](backend/.env.example) | Local backend env template |
| [`frontend/.env.example`](frontend/.env.example) | Local frontend env template |

---

## Submitting your assignment

Share the **Vercel frontend URL** (not the Render URL):

```
https://your-project.vercel.app
```

Demo credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Customer | `customer` | `Customer@123` |

For local setup details, see [README.md](README.md). For backend API specifics, see [backend/README.md](backend/README.md).
