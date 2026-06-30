# ITER Events 

ITER Events is a small full-stack campus event platform with:

- a Next.js frontend in `iter-events-frontend`
- an Express backend in `iter-events-backend`
- an in-memory data store seeded with demo clubs and demo events

The frontend is already connected to the backend API and the project has been verified to run in its current structure.

## Project structure

```text
iter-events-backend/
  src/
    app.js
    routes/
    controllers/
    data/store.js

iter-events-frontend/
  app/
  components/
  lib/
  .env.local
```

## Main features

- Club login with JWT authentication
- Event listing with search, status filtering, category filtering, and sorting
- Club event publishing
- Club-owned event deletion
- Attendee registration and automatic waitlisting when seats are full
- Bookmarking events by attendee email
- Club directory view
- Persistent frontend session in browser local storage

## Verified working

The following flows were tested successfully:

- Backend startup
- `GET /health`
- `GET /api/events`
- `POST /api/auth/login`
- `POST /api/events`
- `POST /api/registrations`
- `GET /api/registrations/check`
- `POST /api/bookmarks/toggle`
- `GET /api/bookmarks`
- `DELETE /api/events/:eventId`
- Frontend lint
- Frontend typecheck
- Frontend production build

## Important note about data

The backend uses an in-memory store in `iter-events-backend/src/data/store.js`.

That means:

- seeded clubs and seeded events are loaded from code
- registrations, bookmarks, and newly created events are reset when the backend restarts
- no MongoDB or external database setup is required

## Demo login

All seeded clubs use:

- Password: `demo123`

Example club IDs:

- `ITER_CSE_TECH`
- `ITER_ROBOTICS`
- `ITER_MUSIC`
- `ITER_CULTURAL`
- `ITER_GAMING`

## How to run

### 1. Start the backend

```bash
cd iter-events-backend
npm install
npm run dev
```

Backend defaults:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:3000`
- `JWT_SECRET=iter-events-dev-secret-change-me`

### 2. Start the frontend

```bash
cd iter-events-frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Frontend runtime note

The machine where this project was verified has global Node `18.19.1`.

To keep the frontend working without requiring a system-wide Node upgrade, the frontend scripts are configured to run through a project-local Node 20 binary from `iter-events-frontend/node_modules/node/bin/node`.

That means:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

all work through the local runtime defined in the frontend project.

## Environment files

### Backend

File:

- `iter-events-backend/.env`

### Frontend

File:

- `iter-events-frontend/.env.local`

Current frontend API target:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## API overview

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Events

- `GET /api/events`
- `GET /api/events/:eventId`
- `POST /api/events`
- `PATCH /api/events/:eventId`
- `DELETE /api/events/:eventId`

### Clubs

- `GET /api/clubs`
- `GET /api/clubs/me/events`
- `GET /api/clubs/:clubId/events`

### Registrations

- `POST /api/registrations`
- `GET /api/registrations/check`
- `GET /api/registrations`
- `DELETE /api/registrations/:id`

### Bookmarks

- `GET /api/bookmarks`
- `POST /api/bookmarks/toggle`

## Extra project docs

Frontend-specific setup details are also available in:

- `iter-events-frontend/SETUP-GUIDE.md`
