# 🏫 Temidire International College — Website & School Management System

The complete website for **Temidire International College, Ondo Town, Ondo State** — public
site + admin dashboard, built with an animation-rich design system ("The Bookmark": one gold
ribbon motif, calm everywhere except the hero).

**Phase 1 (this repo):** animated public website · online admission applications · admin
dashboard (applications pipeline, news/events/gallery CMS, contact inbox, audit log).
**Phase 2 (next):** student / parent / class-teacher portals, timetable, curriculum, report cards.
**Phase 3 (after that):** Paystack school-fees payments (schema already in place).

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
npm run db:seed     # super admin + demo data
npm run dev         # http://localhost:3000
```

`.env` (already created for dev):
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."                      # generate: openssl rand -base64 32
SUPER_ADMIN_EMAIL="admin@temidirecollege.ng"
SUPER_ADMIN_PASSWORD="TemidireAdmin2026!"
```

### Logins after seeding
| Role | Email | Password |
|---|---|---|
| **SUPER_ADMIN (you)** | `admin@temidirecollege.ng` | value of `SUPER_ADMIN_PASSWORD` |
| Principal (demo) | `principal@temidirecollege.ng` | same |
| School Admin (demo) | `schooladmin@temidirecollege.ng` | same |
| Vice Principal (demo) | `vp@temidirecollege.ng` | same |
| Bursar (demo) | `bursar@temidirecollege.ng` | same |

Login at `/login` → lands in `/admin`.

## What's inside

```
src/
  app/                    # pages (public site + /admin dashboard)
    admissions/apply/     # 4-step application form (autosaves locally)
    admin/                # dashboard: applications, news, events, gallery,
                          #   inbox, users (super admin), settings, audit log
  components/
    motion/               # the animation kit: CustomCursor, Preloader (crest),
                          # PageTransition, SmoothReveal (Lenis), MagneticButton,
                          # Testimonials, Timeline, AdmissionsSteps, Portal, Extras
    Header / Footer / WhatsAppButton / SchoolSpines / WhyRibbon
  content/siteContent.ts  # ⚠️ ALL placeholder content lives here (search TODO-REAL)
  lib/                    # prisma, auth, audit, rate limit, guards
prisma/schema.prisma      # full multi-phase schema (portals + fees ready)
docs/
  PLACEHOLDER-IMAGES.md   # which images to generate + where each goes
  REAL-CONTENT-CHECKLIST.md  # everything to collect from the school
  DEPLOYMENT.md           # go-live guide (Vercel + Neon, 15 minutes)
```

## Roles

`SUPER_ADMIN` (special owner rights: users, roles, settings, audit) · `ADMINISTRATOR` ·
`PRINCIPAL` · `VICE_PRINCIPAL` · `BURSAR` · `CLASS_TEACHER` · `TEACHER` · `STUDENT` (P2) · `PARENT` (P2)

## Before launch

1. Work through `docs/REAL-CONTENT-CHECKLIST.md` (fees, staff, routes, photos…).
2. Generate/copy images per `docs/PLACEHOLDER-IMAGES.md` into `public/images/`.
3. Replace the placeholder crest in `src/components/motion/Crest.tsx` with the real one.
4. Deploy: `docs/DEPLOYMENT.md`.

---
---
**Live repo:** https://github.com/animatrixxgamer/temidire-international-college

Built with Buffy 🤖 · All placeholder people/figures are fictional and must be replaced before public launch.
