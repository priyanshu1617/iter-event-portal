# ITER Events Setup Guide

This workspace now has two clearly named apps:

- `iter-events-backend`
- `iter-events-frontend`

The frontend is connected directly to the Express backend API. The backend uses the local in-memory data store in `src/data/store.js`, so no external MongoDB setup is required.

## Backend setup

The backend already has a ready-to-use `.env` file:

```bash
cd iter-events-backend
npm install
npm run dev
```

Default backend settings:

- `PORT=5000`
- `CORS_ORIGIN=http://localhost:3000`
- `JWT_SECRET=iter-events-dev-secret-change-me`

## Frontend setup

The frontend already has `.env.local` pointing at the backend:

```bash
cd iter-events-frontend
npm install
npm run dev
```

Frontend env value:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Login details

All seeded clubs use:

- Password: `demo123`

Example club IDs:

- `ITER_CSE_TECH`
- `ITER_ROBOTICS`
- `ITER_MUSIC`
- `ITER_CULTURAL`

## What works now

- Club login against the Express backend
- Event listing with backend filters and sorting
- Event creation and deletion for the logged-in club
- Attendee registration and waitlisting
- Bookmarking by attendee email
- Club directory view from the backend

## Run order

1. Start `iter-events-backend`
2. Start `iter-events-frontend`
3. Open `http://localhost:3000`
