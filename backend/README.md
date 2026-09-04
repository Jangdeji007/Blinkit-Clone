# Blinkit Clone — Backend

Django REST API backend for the Blinkit clone assignment. Uses **Microsoft SQL Server** as the database and JWT for authentication.

## Prerequisites

- Python 3.12+
- Microsoft SQL Server (local or remote)
- [ODBC Driver 17 or 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Quick start

### 1. Virtual environment

```powershell
cd F:\blinkit-clone
python -m venv venv
.\venv\Scripts\pip install -r backend\requirements.txt
```

### 2. Environment variables

```powershell
copy backend\.env.example backend\.env
```

Edit `backend\.env` for your SQL Server connection. On Windows with the default instance, leave `DB_PORT` empty and keep `DB_TRUSTED_CONNECTION=yes`.

### 3. Create the database

Django does not create the SQL Server database automatically:

```powershell
sqlcmd -S localhost -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'blinkit_db') CREATE DATABASE blinkit_db;"
```

For SQL Server Authentication, replace `-E` with `-U sa -P your_password`.

### 4. Run migrations

```powershell
cd backend
..\venv\Scripts\python manage.py migrate
```

### 5. Create admin user

```powershell
..\venv\Scripts\python manage.py createsuperuser
```

This automatically sets `role=admin` and `is_staff=True`.

### 6. Seed demo data (optional)

Load sample categories and products for local demos:

```powershell
..\venv\Scripts\python manage.py seed_demo
```

Safe to run multiple times — existing records are skipped.

### 7. Run the server

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
├── products/        # Product catalog (Step 3)
├── orders/          # Cart & orders (Step 3)
├── .env             # Local secrets (gitignored)
└── requirements.txt
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | required in production |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | React dev server origins | `http://localhost:5173` |
| `DB_NAME` | SQL Server database name | `blinkit_db` |
| `DB_HOST` | SQL Server host | `localhost` |
| `DB_TRUSTED_CONNECTION` | Windows auth (`yes`/`no`) | `yes` |
| `DB_USER` / `DB_PASSWORD` | SQL auth credentials | — |

## Production notes

- Set `DEBUG=False` and a strong `SECRET_KEY`
- Set `CORS_ALLOWED_ORIGINS` to your frontend domain
- Never commit `.env` to git
