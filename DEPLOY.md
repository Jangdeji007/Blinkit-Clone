# Production Deploy Checklist

Live backend: `https://blinkit-clone-8c3z.onrender.com`

## Render environment variables

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon connection string |
| `DATABASE_SSL` | `true` |
| `DEBUG` | `False` |
| `SECRET_KEY` | strong random string |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `PYTHON_VERSION` | `3.12.0` |

### CORS (fix API blocked from Vercel)

Option A — exact frontend URL (recommended if you know it):

```
CORS_ALLOWED_ORIGINS=https://YOUR-PROJECT.vercel.app
```

Option B — allow any Vercel deploy URL (default in code after latest push):

```
CORS_ALLOWED_ORIGIN_REGEXES=^https://[\w.-]+\.vercel\.app$
```

If `CORS_ALLOWED_ORIGINS` is set to `http://localhost:5173`, remove it or replace with your Vercel URL.

After changing env vars, save and wait for Render to redeploy.

## Vercel environment variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://blinkit-clone-8c3z.onrender.com/api` |

Project settings:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework | Vite |
| Output Directory | `dist` |

Redeploy Vercel after changing `VITE_API_URL` (baked in at build time).

## Verify

1. Backend: https://blinkit-clone-8c3z.onrender.com/api/health/ → `{"status":"ok"}`
2. Frontend: open your Vercel URL → products load
3. Login: `admin` / `Admin@123`

### CORS test (PowerShell)

```powershell
curl.exe -s -I "https://blinkit-clone-8c3z.onrender.com/api/products/" -H "Origin: https://YOUR-PROJECT.vercel.app"
```

Response must include: `access-control-allow-origin: https://YOUR-PROJECT.vercel.app`
