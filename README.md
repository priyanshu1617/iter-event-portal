# ITER Event Portal
**[Click here to view the live website!](https://iter-events-eight.vercel.app)**

ITER Event Portal is a full-stack, centralized platform for discovering, managing, and registering for campus events at ITER, SOA University. It features a modern, cinematic UI with interactive components and a seamless backend.

## 🚀 Features

- **Cinematic Frontend:** A stunning Next.js interface with custom CSS animations, translucent glassmorphism effects, and dynamic event carousels.
- **Club Admin Dashboard:** Secure JWT authentication for club administrators to publish, manage, and delete their own events.
- **Event Discovery:** Filter events by category, search by name, and check live availability of seats.
- **Instant Registration:** Attendee registration with automatic waitlisting when capacity is reached.
- **Bookmarking:** Save favorite events using email-based persistence.
- **Unified Dev Environment:** Run both the frontend and backend simultaneously with a single command.

## 📁 Project Structure

The project is structured as a monorepo containing both the frontend and backend:

```text
iter_event_portal/
├── iter-events-frontend/    # Next.js 15, React, Custom UI
│   ├── app/                 # Next.js App Router (page.tsx, globals.css)
│   ├── components/          # Reusable React components
│   └── public/              # Static assets (images, icons)
│
├── iter-events-backend/     # Express.js API
│   ├── src/                 # Controllers, Routes, and in-memory Data Store
│   └── package.json
│
├── package.json             # Root workspace config (concurrently)
└── .gitignore               # Root git ignores
```

## 🛠️ How to Run Locally

You only need one terminal! The project is configured with `concurrently` to run both the API and the web app together.

### 1. Install Dependencies
Install packages for the root, frontend, and backend all at once:
```bash
npm run install:all
```

### 2. Start the Application
Start both the Express backend and the Next.js frontend simultaneously:
```bash
npm run dev
```

- **Frontend Website:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🔐 Club Admin Login (Demo)

The backend runs an in-memory data store seeded with demo clubs. You can test the platform using the following credentials:

- **Password:** `demo123` (for all clubs)

**Available Club IDs:**
- `ITER_CSE_TECH` (CSE Tech Club)
- `ITER_ROBOTICS` (Robotics Club)
- `ITER_MUSIC` (Music Society)
- `ITER_CULTURAL` (Cultural Committee)
- `ITER_GAMING` (Gaming Club)

## 📡 API Overview

The backend provides a full REST API for the portal:

**Authentication**
- `POST /api/auth/login` - Authenticate club admins
- `GET /api/auth/me` - Verify session

**Events & Clubs**
- `GET /api/events` - List all events (supports filtering/search)
- `POST /api/events` - Publish a new event (Auth required)
- `DELETE /api/events/:eventId` - Delete an event (Auth required)
- `GET /api/clubs` - List all clubs

**Registrations & Bookmarks**
- `POST /api/registrations` - Register an attendee for an event
- `POST /api/bookmarks/toggle` - Toggle event bookmark for an email

## 📝 Important Notes

- **In-Memory Database:** The backend currently uses an in-memory store (`iter-events-backend/src/data/store.js`). This means newly created events, registrations, and bookmarks will reset when the server restarts. No external database (like MongoDB) is required to run the project.
- **Node Version:** The frontend is configured to run smoothly using a local Node binary to ensure compatibility. If you run into issues, ensure your global Node version is 18+. IPv6 local routing is disabled by using `127.0.0.1` for API calls to prevent Node 18+ networking conflicts.
