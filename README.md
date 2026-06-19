# TicketFlow

A full-stack event ticket booking application with seat reservation and booking confirmation. Built as a Bun monorepo with a Next.js frontend and Express + MongoDB backend.

## Prerequisites

- [Bun](https://bun.sh) 1.3+
- [MongoDB](https://www.mongodb.com/) running locally or a remote Atlas URI

## Installation

```bash
bun install
```

## Environment variables

### Backend (`apps/server/.env`)

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ticketflow
JWT_SECRET=your_jwt_secret_here
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Running the app

### Seed the database

```bash
cd apps/server
bun run seed
```

### Start the backend

```bash
cd apps/server
bun run dev
```

Server runs at `http://localhost:4000`.

### Start the frontend

```bash
cd apps/web
bun run dev
```

App runs at `http://localhost:3000`.

From the repo root you can also run `bun run dev` to start all apps via Turborepo.

## Project structure

```
apps/
  web/       Next.js 16 frontend (App Router)
  server/    Express + Mongoose API
packages/
  types/     Shared TypeScript interfaces
  ui/        Shared shadcn/ui components
```

## Design decisions

### Preventing double booking

Seat updates use MongoDB transactions with conditional `findOneAndUpdate` filters (`status: 'available'` when reserving, `status: 'reserved'` when booking). If any seat in a batch fails the condition, the entire transaction aborts and the client receives a `409` with the list of failed seats.

### Expired reservations

Two mechanisms work together:

1. **TTL index** on `Reservation.expiresAt` with `expireAfterSeconds: 0` removes expired reservation documents automatically.
2. **Cron job** (every minute) finds expired reservations, resets their seats from `reserved` back to `available`, then deletes the reservation. This handles seat status cleanup when the TTL index removes documents without updating seats.

### Next.js App Router + separate Express server

The frontend uses Next.js 16 for UI, routing, and client-side state. The backend is a standalone Express API so booking logic, MongoDB transactions, and cron jobs live in one Node process without coupling to the Next.js runtime. Communication is REST over HTTP with JWT auth.

### Authentication

Users register and login via the Express API. Passwords are hashed with bcrypt; the API returns a JWT. The frontend stores the token in `localStorage` and sends `Authorization: Bearer <token>` on protected requests. Protected pages redirect to `/login` when no token is present.

## Notes

- This project uses **Next.js 16** and **Biome** for linting (the hiring spec referenced Next.js 14 and ESLint).
- Ticket price is a flat **₹400 per seat**, calculated on the client.
- The `Download ticket` button on the confirmation page is a placeholder.
