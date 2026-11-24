# Temidire International College

Website and school management system for Temidire International College, Ondo Town, Ondo State.

The public site covers admissions, academics, school life, transport, news, the gallery and contact.
Staff sign in to an admin dashboard for applications, students, staff, fees, attendance, scores,
results, the timetable, news and announcements. Students and parents get a portal with their
results, fee balance, timetable, homework and school notices.

It is a Next.js 15 app (App Router) written in TypeScript, styled with Tailwind CSS v4, with Prisma
on top of the database. Local development uses SQLite so there is no database server to install.
Production uses Postgres.

## Running it locally

You need Node 20 or newer.

```bash
npm install
npm run db:push     # creates prisma/dev.db from the schema
npm run db:seed     # creates the owner login and demo data
npm run dev         # http://localhost:3000
```

Create a `.env` file in the project root:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."                      # openssl rand -base64 32
SUPER_ADMIN_EMAIL="admin@temidirecollege.ng"
SUPER_ADMIN_PASSWORD="pick-a-password"
```

The seed script reads `.env` itself, so you do not have to export `DATABASE_URL` first. If the same
variable is already set in your shell, that value wins.

## Signing in

All logins are at `/login`. Staff land in `/admin`, students and parents in `/portal`.

| Account | Email |
|---|---|
| Owner / super admin | `admin@temidirecollege.ng` |
| Principal (demo) | `principal@temidirecollege.ng` |
| School administrator (demo) | `schooladmin@temidirecollege.ng` |
| Vice principal (demo) | `vp@temidirecollege.ng` |
| Bursar (demo) | `bursar@temidirecollege.ng` |

The seed gives every demo account the same password as the super admin. Change them in
Admin > Users before anyone outside the school gets a login.

## What staff can do

- Applications: read the admissions pipeline and move applicants through it.
- Students: enrol a pupil, search the roll, move a pupil between classes, take one off the roll.
- Staff: edit the public directory details (name, title, role, phone, short bio). The bio appears
  on `/about/leadership`; the phone number and email do not.
- Fees: raise invoices for the current session and term, record payments, see billed and collected
  totals. Overpaying an invoice is rejected on the server.
- Attendance, scores and reports: mark registers, enter CA and exam scores, publish a term result.
- Timetable: build the week for each class.
- News, events, gallery and announcements: publish to the public site and the portal.
- Inbox: messages from the contact form.
- Users, roles, settings and the audit log: super admin only.

Every write goes through a server-side role check, so hiding a button is not the only protection.

## Project layout

```
src/app/                 public pages, /admin and /portal
  about/leadership/      leadership cards plus the staff directory from the database
  admissions/apply/      4-step application form
  admin/                 dashboard screens
  portal/                student and parent dashboard
  sitemap.ts, robots.ts  generated for search engines
src/components/          shared UI, including the motion components
src/content/siteContent.ts   copy, fees, demo news, testimonials and fallback staff
src/lib/                 database client, auth, guards, audit, rate limiting
prisma/schema.prisma     full schema
prisma/seed.ts           owner account and demo data
scripts/backup-db.mjs    local SQLite backup
docs/                    deployment notes and the content checklist
```

## Permissions

Staff directory edits are limited to the owner, administrators, principal and vice principals.
Invoices and payments are limited to the owner, administrators and the bursar. Other staff screens
are open to any staff account. Students and parents cannot reach `/admin`, and a disabled account
or a pupil taken off the roll loses access on their next request, even if they still hold an old
session cookie.

## Backups

There are two ways to keep the school's data safe.

**From the admin area.** Sign in as the owner, open Admin > Backups and press *Download a backup
file*. That single JSON file holds every account, pupil, result, invoice and payment. Keep it
somewhere private (it contains password hashes). The same page can restore a file; a restore runs
inside one database transaction, so a damaged file is rejected and the current data is left as it
was. Download a fresh file before exam results go out, before big imports and at the end of term.

**From the command line.** `npm run db:backup` copies the local SQLite file into `backups/` with a
timestamp, keeping the newest 14. On Neon Postgres use `npm run db:backup -- prod` (needs
`pg_dump`), or rely on Neon's own scheduled backups.

## Online fee payments (Paystack)

Students and parents can pay an outstanding invoice from the portal. The bursary can still record
cash or transfer payments by hand; both paths update the same invoice balance.

1. Copy the secret key from the Paystack dashboard into `PAYSTACK_SECRET_KEY`.
2. In Paystack, add the webhook URL `https://your-domain/api/paystack/webhook`.
3. Optionally set `NEXT_PUBLIC_APP_URL` to the public origin. If it is empty, the app uses the
   request origin for the callback.

The app creates a pending payment, sends the pupil to Paystack's checkout, and marks the invoice
paid only after Paystack posts a request signed with that secret key. Test keys work the same way;
leave the key empty to hide the button and keep online payments off.

A few safeguards sit around that flow, because a fee payment must never be recorded twice or lost:

- One open checkout per invoice. Pressing Pay again returns the same checkout link for 30 minutes
  instead of creating a second live payment, so a double-click cannot charge the fee twice.
- Confirmation on return. When the pupil comes back from Paystack, the portal asks Paystack
  directly about that reference. If the webhook was delayed or missed — a restart, a redeploy, a
  misconfigured URL — the balance still updates.
- Late payments still count. A checkout that timed out and was marked failed is credited if
  Paystack later confirms the money arrived.
- Duplicate webhooks and the return check are idempotent; only the first one moves the balance.
- An accidental overpayment is added to the invoice in full and written to the audit log, so the
  bursar can see it and refund or carry it forward rather than it disappearing.

## Deploying to Vercel

Vercel cannot keep a SQLite file, so switch the datasource first.

1. Create a free Neon Postgres project and copy the connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Push the repo and import it at vercel.com. Vercel detects Next.js; `npm run build` runs
   `prisma generate` before `next build`.
4. Add these environment variables in the Vercel project:

   ```
   DATABASE_URL          postgresql://...?sslmode=require
   AUTH_SECRET           openssl rand -base64 32
   SUPER_ADMIN_EMAIL     the owner's login email
   SUPER_ADMIN_PASSWORD  a strong launch password
   ```

5. Create the tables and the first admin against the production database:

   ```bash
   DATABASE_URL="<neon-url>" npx prisma db push
   DATABASE_URL="<neon-url>" npm run db:seed
   ```

6. Sign in and change the demo passwords.

`docs/DEPLOYMENT.md` has the longer version, including custom domains.

## Before the school goes live

- Replace the demo names, figures, fees and news in `src/content/siteContent.ts` and in the admin
  screens. The portraits and campus photographs in `public/images/` are placeholders too.
- Fill in the real staff list in Admin > Staff so the public directory stops using the fallback.
- Check the fee amounts with the bursar. They are repeated in the admissions table.
- Swap the crest in `src/components/motion/Crest.tsx` for the school's own.
- Work through `docs/REAL-CONTENT-CHECKLIST.md`.

## Not built yet

- Photo uploads. Images are referenced by path.
- Error monitoring beyond the app's own error pages.
- A parent with several children sees one child at a time (the first one still on the roll).

## Repo

https://github.com/animatrixxgamer/temidire-international-college

Maintained by Animatrixx Gamer. The demo people and figures in the seed data are fictional.
