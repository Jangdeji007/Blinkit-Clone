# Blinkit Clone — Backend

Django REST API backend for the Blinkit clone assignment. Uses **PostgreSQL** as the database and JWT for authentication.

## Prerequisites

- Python 3.12+
- PostgreSQL 16+ (Docker recommended for local dev)

## Quick start

### 1. Virtual environment

```powershell
cd F:\blinkit-clone
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
```

### 2. PostgreSQL (Docker)

```powershell
docker run --name blinkit-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=blinkit_db -p 5432:5432 -d postgres:16
```

If the container already exists: `docker start blinkit-postgres`

### 3. Environment variables

```powershell
copy backend\.env.example backend\.env
```

Defaults match the Docker command above (`postgres` / `postgres` / `blinkit_db` on port 5432).

### 4. Run migrations

```powershell
cd backend
..\venv\Scripts\python manage.py migrate
```

### 5. Seed demo data

Creates sample categories, products, and demo login accounts:

```powershell
..\venv\Scripts\python manage.py seed_demo
```

Safe to run multiple times — existing records are updated/skipped.

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Customer | `customer` | `Customer@123` |

Alternatively, create a custom admin with `createsuperuser` (sets `role=admin` automatically).

### 6. Run the server

```powershell
..\venv\Scripts\python manage.py runserver
```

- Health check: http://127.0.0.1:8000/api/health/
- Django admin: http://127.0.0.1:8000/admin/

## Project structure

```
backend/
├── config/          # Django project settings, URLs, WSGI
├── users/           # Custom User model (admin / customer roles)
├── products/        # Product catalog
├── orders/          # Cart & orders
├── build.sh         # Render build script (migrate + seed)
├── .env             # Local secrets (gitignored)
└── requirements.txt
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | required in production |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | React frontend origins | `http://localhost:5173` |
| `DATABASE_URL` | Full PostgreSQL URL (Render/Neon) | — |
| `DATABASE_SSL` | Require SSL for DB connection | `false` |
| `DB_NAME` | Database name (local dev) | `blinkit_db` |
| `DB_USER` | Database user (local dev) | `postgres` |
| `DB_PASSWORD` | Database password (local dev) | `postgres` |
| `DB_HOST` | Database host (local dev) | `localhost` |
| `DB_PORT` | Database port (local dev) | `5432` |

## Production notes

- Set `DEBUG=False` and a strong `SECRET_KEY`
- Set `CORS_ALLOWED_ORIGINS` to your frontend domain
- On Render: use `DATABASE_URL` from Neon and `DATABASE_SSL=true`
- Build command: `./build.sh` — Start command: `gunicorn config.wsgi:application`
- Never commit `.env` to git

## Deploy on Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `./build.sh` |
| Start Command | `gunicorn config.wsgi:application` |

Required env vars: `DATABASE_URL`, `DATABASE_SSL=true`, `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS=.onrender.com`, `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
