# ULCRS — University of Lagos Course Registration System

A course registration system for the University of Lagos: students register courses online, the system validates prerequisites, timetable clashes, capacity, credit load and fee clearance automatically, and registrations move through academic adviser and HOD approval before the registry finalises them.

Based on the MIT 811 (Systems Analysis & Design) Group 13 report.

## Actors

| Role | What they do |
| --- | --- |
| Student | Register courses, add/drop, view status, print course form, check fee status |
| Academic adviser | Approve or reject advisees' registrations, see students needing attention |
| Head of department | Define courses, prerequisites, capacity and timetable; authorise registrations; department report |
| Registry officer | Manage academic calendar, finalise and lock registrations, final lists, transcripts |
| Bursary officer | Record fee payments, issue fee clearance |
| Lecturer | Update capacity and prerequisites for own courses, view class lists |
| ICT admin | Manage user accounts, faculties and departments, system settings, audit log, system reports |

## Repository layout

```
backend/    NestJS 11 API (TypeORM, Postgres, JWT cookie auth, Swagger)
frontend/   Next.js 15 web app (Tailwind v4, shadcn/ui, TanStack Query)
```

## Prerequisites

- [bun](https://bun.sh)
- Docker (for Postgres)

## Getting started

```bash
# 1. Database
docker compose up -d

# 2. API  (http://localhost:4000, Swagger at /docs)
cd backend
cp .env.example .env
bun install
bun run migration:run
bun run seed
bun run dev

# 3. Web app  (http://localhost:3000)
cd frontend
cp .env.example .env.local
bun install
bun dev
```

### Seeded logins

`bun run seed` (idempotent, safe to re-run) creates 2 faculties, 8 departments, ~40 courses with prerequisites/timetables/a deliberate clash, the current session ("2025/2026", registration open now) plus a prior session for past results, ~30 students and one staff account per role. Every seeded account (staff and student) shares the password `Seed@12345!`:

| Role | Login |
| --- | --- |
| System admin | `admin@ulcrs.edu.ng` (see `backend/.env.example` for `BOOTSTRAP_ADMIN_*` to change it) |
| Academic adviser | `academic.adviser@ulcrs.edu.ng` |
| HOD (Computer Science) | `hod@ulcrs.edu.ng` |
| Registry officer | `registry@ulcrs.edu.ng` |
| Bursary officer | `bursary@ulcrs.edu.ng` |
| Lecturer | `lecturer@ulcrs.edu.ng` |
| Student | any seeded matric no., e.g. `CSC/24/003` (login accepts email, matric no. or staff ID) |

> Work in progress. See [PROGRESS.md](./PROGRESS.md) for what currently runs.

## Docs

- [PLAN.md](./PLAN.md) — approved plan: domain model, rules, pages, delivery order
- [PROGRESS.md](./PROGRESS.md) — status and handoff notes
- [CLAUDE.md](./CLAUDE.md) — rules for contributors and agents (commits, vocabulary, architecture)
