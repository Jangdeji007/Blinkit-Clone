# Blinkit Clone

A quick-commerce grocery delivery clone built as a full-stack assignment project. It includes an **Admin Panel** for product management and a **Customer Panel** for browsing, cart, checkout, and orders.

**Stack:** Django REST Framework + React (Vite) + PostgreSQL + JWT auth

## Prerequisites

- Python 3.12+
- Node.js 20+ (22.12+ recommended for Vite 7)
- Docker (for local PostgreSQL) or a PostgreSQL 16+ instance

## Quick start

### 1. PostgreSQL (Docker)

```powershell
docker run --name blinkit-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=blinkit_db -p 5432:5432 -d postgres:16
```

If the container already exists: `docker start blinkit-postgres`

### 2. Backend

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
cd backend
..\venv\Scripts\python manage.py migrate
..\venv\Scripts\python manage.py seed_demo
..\venv\Scripts\python manage.py runserver
```

Backend runs at http://127.0.0.1:8000 — see [backend/README.md](backend/README.md) for detailed setup and environment variables.

## Demo login credentials

Use these accounts at http://localhost:5173/login after running `seed_demo`:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `Admin@123` |
| **Customer** | `customer` | `Customer@123` |

- **Admin** → redirected to `/admin/dashboard` (product management)
- **Customer** → redirected to home (browse, cart, checkout, orders)

To reset passwords to the values above, run `python manage.py seed_demo` again.

### 3. Frontend

In a separate terminal:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs at http://localhost:5173

The dev server proxies `/api` and `/media` to the Django backend, so `VITE_API_URL=/api` works out of the box.

## Demo walkthrough

Use this flow to verify the assignment end-to-end:

### Admin flow

1. Open http://localhost:5173/login and sign in with **admin** / **Admin@123**.
2. You are redirected to `/admin/dashboard` with the seeded product table.
3. Click **Add Product** — category dropdown is populated from seeded data.
4. Create, edit, or delete a product and confirm changes appear on the customer home page.

### Customer flow

1. Log in at `/login` with **customer** / **Customer@123** (or sign up a new account).
2. On the home page, search and filter products by category or price.
3. Open a product, set quantity, and click **Add to Cart**.
4. Go to **Cart** — adjust quantities or remove items.
5. **Proceed to Checkout** → **Place Order** → **Pay Now (Mock)**.
6. Open **Orders** — verify the order shows `paid` status with correct items and total.

## Project structure

```
blinkit-clone/
├── backend/          # Django REST API (users, products, orders)
├── frontend/         # React SPA (customer + admin UI)
└── README.md         # This file
```

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/signup/`, `POST /api/auth/login/` |
| Products | `GET/POST /api/products/`, `GET/PATCH/DELETE /api/products/<id>/` |
| Categories | `GET /api/categories/` |
| Cart | `GET /api/cart/`, `POST /api/cart/add/`, `DELETE /api/cart/remove/<id>/` |
| Orders | `POST /api/orders/checkout/`, `POST /api/orders/<id>/pay/`, `GET /api/orders/` |

## Environment variables

| Location | Variable | Default |
|----------|----------|---------|
| `backend/.env` | PostgreSQL connection, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS` | See [backend/.env.example](backend/.env.example) |
| `frontend/.env` | `VITE_API_URL` | `/api` (proxied to Django in dev) |

## Deploy (free tier)

| Service | Purpose | Notes |
|---------|---------|-------|
| [Neon](https://neon.tech) | PostgreSQL database | Copy `DATABASE_URL` connection string |
| [Render](https://render.com) | Django backend | Root: `backend`, Build: `./build.sh`, Start: `gunicorn config.wsgi:application` |
| [Vercel](https://vercel.com) | React frontend | Root: `frontend`, set `VITE_API_URL=https://<render-url>/api` |

**Render env vars:** `DATABASE_URL`, `DATABASE_SSL=true`, `DEBUG=False`, `SECRET_KEY`, `ALLOWED_HOSTS=.onrender.com`, `CORS_ALLOWED_ORIGINS=https://<vercel-url>`

**Notes:**
- Render free tier sleeps after 15 min idle (~30s cold start on first request).
- Product images uploaded in admin do not persist on Render free tier (demo seed data works without images).

## Requirements reference

Full functional spec: [backend/blinkit-clone-requirement-analysis.md](backend/blinkit-clone-requirement-analysis.md)
