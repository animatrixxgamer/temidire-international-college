# 🏫 Temidire International College — Website & School Management System

The complete website for **Temidire International College, Ondo Town, Ondo State** — public
site + admin dashboard + student/parent portal, built with an animation-rich design system
("The Bookmark": one gold ribbon motif, calm everywhere except the hero).

**Live now:** animated public website · online admission applications · admin dashboard
(applications pipeline, students, staff directory, news/events/gallery CMS, announcements,
assignments, fees, attendance, scores, reports, timetable, contact inbox, audit log) ·
student/parent portal (results, attendance, timetable, homework, notices, fee records).

**Still to come:** Paystack school-fees payments (schema already in place).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 (design tokens in `globals.css`) |
| Animation | Framer Motion + Lenis smooth scroll (custom cursor, preloader, page transitions, scroll reveals) |
| Database | Prisma ORM — SQLite locally, Postgres/Neon in production (one-line switch) |
| Auth | Custom JWT sessions (jose) + bcrypt, role-based access |
| Validation | Zod on every API route |
| Hosting | Vercel (free) + Neon Postgres (free) — ₦0/month |

## Quick start (local)

```bash
npm install
npm run db:push     # create SQLite dev.db from prisma/schema.prisma
npm run db:seed     # super admin + demo data (reads .env automatically)
npm run dev         # http://localhost:3000
```

`.env` (already created for dev):
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."                      # generate: openssl rand -base64 32
SUPER_ADMIN_EMAIL="admin@temidirecollege.ng"
SUPER_ADMIN_PASSWORD="TemidireAdmin2026!"
```

`npm run db:seed` loads `.env` itself — you don't need to export `DATABASE_URL` first. A real
environment variable always wins over the file.

### Logins after seeding
| Role | Email | Password |
|---|---|---|
| **SUPER_ADMIN (you)** | `admin@temidirecollege.ng` | value of `SUPER_ADMIN_PASSWORD` |
| Principal (demo) | `principal@temidirecollege.ng` | same |
| School Admin (demo) | `schooladmin@temidirecollege.ng` | same |
| Vice Principal (demo) | `vp@temidirecollege.ng` | same |
| Bursar (demo) | `bursar@temidirecollege.ng` | same |

Login at `/login` → lands in `/admin`. Every demo account shares the super-admin password, so
change them in **Admin → Users** before the site goes public.

## What's inside

```
src/
  app/                    # pages (public site + /admin dashboard + /portal)
    about/leadership/     # public leadership + staff directory (reads StaffProfile;
                          #   falls back to src/content/siteContent.ts when empty)
    admissions/apply/     # 4-step application form (autosaves locally)
    admin/                # dashboard: applications, students, staff, news, events,
                          #   gallery, announcements, assignments, fees, attendance,
                          #   scores, reports, timetable, inbox, users, settings, audit
    portal/               # student & parent dashboard: results, attendance,
                          #   timetable, homework, notices, fee balance
    sitemap.ts, robots.ts # generated for search engines
  components/
    motion/               # the animation kit: CustomCursor, Preloader (crest),
                          # PageTransition, SmoothReveal (Lenis), MagneticButton,
                          # Testimonials, Timeline, AdmissionsSteps, Portal, Extras
    Header / Footer / WhatsAppButton / SchoolSpines / WhyRibbon
  content/siteContent.ts  # ⚠️ ALL placeholder content lives here (search TODO-REAL)
  lib/                    # prisma, auth, audit, rate limit, guards
prisma/schema.prisma      # full multi-phase schema (portals + fees ready)
scripts/backup-db.mjs     # `npm run db:backup` — timestamped SQLite copy in backups/
docs/
  PLACEHOLDER-IMAGES.md   # which images to generate + where each goes
  REAL-CONTENT-CHECKLIST.md  # everything to collect from the school
  DEPLOYMENT.md           # go-live guide (Vercel + Neon, 15 minutes)
```

### Who can do what

| Area | Roles |
|---|---|
| Staff directory (public details) | edits: `SUPER_ADMIN`, `ADMINISTRATOR`, `PRINCIPAL`, `VICE_PRINCIPAL`; all staff can read it |
| Fees (invoices, payments) | `SUPER_ADMIN`, `ADMINISTRATOR`, `BURSAR` |
| Students, news, events, gallery, announcements, assignments | any staff account |
| Users, roles, settings, audit log | `SUPER_ADMIN` |

Unauthorised actions are rejected server-side (`Not authorized`), not just hidden in the UI.

## Roles

`SUPER_ADMIN` (special owner rights: users, roles, settings, audit) · `ADMINISTRATOR` ·
`PRINCIPAL` · `VICE_PRINCIPAL` · `BURSAR` · `CLASS_TEACHER` · `TEACHER` · `STUDENT` · `PARENT`

## Backups

```bash
npm run db:backup    # copies the SQLite database to backups/temidire-YYYY-MM-DD….db
```

Works with a local `file:` database. On Vercel the database is Neon Postgres, so use Neon's
own backups/branches instead (see `docs/DEPLOYMENT.md`).

## Deploying to Vercel

1. Create a free Neon Postgres project and copy its connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and
   commit — Vercel has no persistent disk, so SQLite cannot back a deployed site.
3. Import the GitHub repo at vercel.com. The Next.js preset is detected automatically and
   `npm run build` runs `prisma generate` first.
4. Add these Environment Variables in the Vercel project:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string (`postgresql://…?sslmode=require`) |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `SUPER_ADMIN_EMAIL` | the owner's login email |
   | `SUPER_ADMIN_PASSWORD` | a strong launch password |

5. Deploy, then create the schema and first admin against the production database:
   ```bash
   DATABASE_URL="<neon-url>" npx prisma db push
   DATABASE_URL="<neon-url>" npm run db:seed
   ```
6. Log in at `/login` and change every demo password in **Admin → Users**.

Full walkthrough with custom-domain notes: `docs/DEPLOYMENT.md`.

## Before launch

1. Work through `docs/REAL-CONTENT-CHECKLIST.md` (fees, staff, routes, photos…).
2. Generate/copy images per `docs/PLACEHOLDER-IMAGES.md` into `public/images/`.
3. Replace the placeholder crest in `src/components/motion/Crest.tsx` with the real one.
4. Fill in **Admin → Staff** so the public directory stops using the placeholder list.
5. Deploy: `docs/DEPLOYMENT.md`.

---
---
**Live repo:** https://github.com/animatrixxgamer/temidire-international-college

Built with Buffy 🤖 · All placeholder people/figures are fictional and must be replaced before public launch.
