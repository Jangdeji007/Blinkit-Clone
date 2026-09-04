# Blinkit Clone

A quick-commerce grocery delivery clone built as a full-stack assignment project. It includes an **Admin Panel** for product management and a **Customer Panel** for browsing, cart, checkout, and orders.

**Stack:** Django REST Framework + React (Vite) + Microsoft SQL Server + JWT auth

## Prerequisites

- Python 3.12+
- Node.js 20+ (22.12+ recommended for Vite 7)
- Microsoft SQL Server (local or remote)
- [ODBC Driver 17 or 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Quick start

### 1. Backend

From the project root:

```powershell
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
```

Create the database, run migrations, create an admin user, and seed demo data:

```powershell
sqlcmd -S localhost -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'blinkit_db') CREATE DATABASE blinkit_db;"
cd backend
..\venv\Scripts\python manage.py migrate
..\venv\Scripts\python manage.py createsuperuser
..\venv\Scripts\python manage.py seed_demo
..\venv\Scripts\python manage.py runserver
```

Backend runs at http://127.0.0.1:8000 — see [backend/README.md](backend/README.md) for detailed setup and environment variables.

### 2. Frontend

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

1. Open http://localhost:5173/login and sign in with the admin account from `createsuperuser`.
2. You are redirected to `/admin/dashboard` with the seeded product table.
3. Click **Add Product** — category dropdown is populated from seeded data.
4. Create, edit, or delete a product and confirm changes appear on the customer home page.

### Customer flow

1. Sign up at `/signup` (or log in as an existing customer).
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
| `backend/.env` | SQL Server connection, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS` | See [backend/.env.example](backend/.env.example) |
| `frontend/.env` | `VITE_API_URL` | `http://127.0.0.1:8000/api` |

## Requirements reference

Full functional spec: [backend/blinkit-clone-requirement-analysis.md](backend/blinkit-clone-requirement-analysis.md)
