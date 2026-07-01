# Transformer Manufacturing Material Alert & Procurement System

Full-stack scaffold matching the spec: production planning, stock checks, shortage detection, purchaser mapping, and automated email reminders.

## Structure

```
transformer-mms/
├── backend/   Node.js + Express + MongoDB (Mongoose) API, node-cron schedulers, Nodemailer
└── frontend/  React + Tailwind + React Query + React Hook Form + Axios
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, SMTP_* details
npm run seed            # creates an admin/planner/purchaser user + sample materials
npm run dev              # starts on http://localhost:5000
```

Seeded logins (from `npm run seed`):
- `admin@transformer.com` / `Admin@123`
- `planner@transformer.com` / `Planner@123`
- `rajesh@transformer.com` / `Purchase@123` (purchaser)

If `SMTP_USER`/`SMTP_PASS` aren't set, emails are logged to the console instead of failing — useful for local testing without a real mailbox.

## Running with Docker

Spins up MongoDB, the backend API, and the frontend (built + served via nginx) together.

```bash
cp .env.example .env   # fill in JWT_SECRET, SMTP_* details if you want real emails
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017 (persisted in the `mongo_data` volume)

Seed the database (sample users/materials/purchasers) once the containers are up:

```bash
docker compose exec backend npm run seed
```

Stop everything with `docker compose down` (add `-v` to also wipe the MongoDB volume).

**Note on `VITE_API_URL`**: Vite bakes env vars into the build at build time, not at container runtime. The default in `docker-compose.yml` (`http://localhost:5000/api`) works for running everything on your own machine. If you deploy frontend and backend on different hosts, set `VITE_API_URL` in your `.env` before running `docker compose build`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:5000
npm run dev              # starts on http://localhost:5173
```

## What's implemented

- **Auth**: JWT login, role-based middleware (admin / planner / purchaser).
- **Materials, Purchasers, Material-Purchaser Mapping**: full CRUD, matching the spec's collections exactly.
- **Production Plans**: create a plan with a list of required materials. On creation, each material's available stock (`currentStock - reservedStock`) is checked; sufficient quantities get reserved immediately, shortages get recorded on `planMaterials` and trigger a `notifications` record + email to the mapped purchaser.
- **Schedulers** (`node-cron`):
  - Hourly: re-checks all plans starting within `PLAN_LOOKAHEAD_DAYS` (default 2) for shortages and (re-)alerts purchasers.
  - Every `REMINDER_INTERVAL_HOURS` (default 2): re-sends emails for any notification still `pending`, incrementing `reminderCount`.
- **Stop conditions**: acknowledging or resolving a notification clears `nextReminderAt`, so the reminder loop stops picking it up.
- **Dashboard**: the four summary cards, upcoming plans table, and material shortage table from the spec, plus the notifications table on its own screen.

## Notes / things to wire up next

- The spec's API list didn't include a way to create users — `POST /api/auth/register` (admin-only) was added so you can create planner/purchaser logins beyond the seed data.
- `PUT /api/plans/:id/status` was added beyond the spec's API list so plans can move through draft → approved → completed/cancelled (cancelling releases reserved stock).
- Production plans are created directly as `approved` (stock is reserved/short-checked immediately on submit) — adjust `planController.createPlan` if you'd rather plans start as `draft` and only check stock on approval.
