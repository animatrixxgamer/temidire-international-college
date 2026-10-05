# 🚀 Deployment guide — free, in about 15 minutes

The site deploys as **Next.js on Vercel** with a **Neon Postgres** database. Total cost: ₦0.

## 1. Create the database (Neon)

1. Sign up at **neon.tech** (free — no card needed).
2. Create a project called `temidire`.
3. Copy the **connection string** — it looks like:
   `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

## 2. Push the code to GitHub

```bash
cd temidire
git init
git add .
git commit -m "Temidire International College — Phase 1"
```
Create an empty repo on github.com named `temidire` (private recommended), then:
```bash
git remote add origin https://github.com/<your-username>/temidire.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Sign up at **vercel.com** with GitHub.
2. **Add New → Project → Import** the `temidire` repo.
3. Framework preset auto-detects Next.js. Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | your Neon connection string (step 1) |
| `AUTH_SECRET` | output of `openssl rand -base64 32` |
| `SUPER_ADMIN_EMAIL` | your admin email |
| `SUPER_ADMIN_PASSWORD` | a strong launch password |

4. **Deploy.** You get a live URL like `temidire.vercel.app`.

## 4. Switch the database to Postgres

One line in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```
Commit + push → Vercel redeploys automatically. Then seed the production database from your machine:
```bash
# temporarily point .env at Neon, then:
npm run db:push
npm run db:seed
```
(The seed creates your SUPER_ADMIN login and the demo content.)

## 5. Custom domain (optional, later)

- Buy `temidirecollege.ng` or `.com.ng` (~₦3,500–6,000/yr at WhoGoHost/Qservers).
- In Vercel: **Project → Settings → Domains → Add**, then point the domain's A/CNAME records as instructed.
- SSL is automatic.

## 6. After go-live checklist

- [ ] Log in at `/login` with your super admin account
- [ ] Create the Administrator / Principal / VP / Bursar accounts in **Admin → Users**
- [ ] Change their temp passwords
- [ ] Post the first real news item (delete the 4 demo posts)
- [ ] Replace placeholder fees in `src/content/siteContent.ts` (they also appear in the Admissions table)
- [ ] Test the application form on a phone — the reference number should appear in **Admin → Applications**

## Troubleshooting

- **"Error 500" on pages that read the DB** → the seed hasn't run on the production DB (repeat step 4's seed commands).
- **Login says "Wrong email or password"** → run the seed, or reset the password in Admin → Users.
- **Images broken** → files go in `public/images/` with the exact names from `docs/PLACEHOLDER-IMAGES.md`.
