# StudyBuddy Deployment

This repo is prepared for:

- Backend: Render
- Frontend: Vercel
- Database: Render PostgreSQL

## Before You Deploy

1. Initialize a Git repository in the project root if you have not already.
2. Push the project to GitHub, GitLab, or Bitbucket.
3. Rotate the API keys currently stored in `backend/.env` and move the new values into provider dashboards only.

## Render Backend

Render will read [`render.yaml`](/D:/CODE/Django/StudyBuddy/render.yaml) from the repo root.

### Backend build and start

- Root directory: `backend`
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start command: `python manage.py migrate && gunicorn studybuddy.wsgi:application --bind 0.0.0.0:$PORT`

### Render environment variables

Set these on the `studybuddy-backend` service:

- `FRONTEND_URL=https://your-frontend.vercel.app`
- `BACKEND_URL=https://your-backend.onrender.com`
- `ALLOWED_HOSTS=localhost,127.0.0.1,your-backend.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.onrender.com`
- `OPENAI_API_KEY=...`
- `GEMINI_API_KEY=...`
- `GROQ_API_KEY=...`

`DATABASE_URL` is supplied automatically by the Render PostgreSQL resource in the blueprint.

### AI and ML note

The deployed requirements include the API clients and PDF parser needed by the current runtime paths. The repo also contains optional heavier ML code paths. If you later want full server-side sentence-transformer embeddings or on-server model training, add those heavier packages separately or move them to a worker service.

## Vercel Frontend

Set the Vercel project root to `frontend`.

### Frontend environment variables

- `VITE_GOOGLE_CLIENT_ID=...`
- `VITE_APP_BASE_URL=https://your-frontend.vercel.app`
- `VITE_BACKEND_BASE_URL=https://your-backend.onrender.com`
- `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

The frontend includes [`frontend/vercel.json`](/D:/CODE/Django/StudyBuddy/frontend/vercel.json) so React Router routes rewrite to `index.html`.

## Google OAuth Setup

Update the Google Cloud OAuth app to use your production URLs.

### Authorized JavaScript origins

- `https://your-frontend.vercel.app`

### Authorized redirect URIs

- `https://your-backend.onrender.com/accounts/google/login/callback/`

If you keep local development, also retain your localhost origins and redirect URIs.
