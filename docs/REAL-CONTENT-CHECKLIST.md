# ✅ Real-content checklist — collect these from the school

Every item below is currently a **placeholder** marked `TODO-REAL` in `src/content/siteContent.ts`
(and a few in `prisma/seed.ts`). Tick them off and send me the details — I'll swap them in.

## 1. Identity & legal
- [ ] Official school name exactly as registered (`school.name`) — "Temidire International College"?
- [ ] Real motto (English and/or Latin for the crest) (`school.motto`, `school.crestMotto`)
- [ ] Year founded (`school.founded`, `timeline[0].year`)
- [ ] Full street address in Ondo Town (`school.address`)
- [ ] Ondo State MoE approval/registration number (for the About page badge)
- [ ] WAEC centre number · NECO centre number (if held)
- [ ] Proprietor/Administrator's full name & title (the special admin account is yours — give me the name to display)

## 2. Contact
- [ ] Office phone number(s) (`school.phone`)
- [ ] WhatsApp number in international format, no "+" (`school.whatsapp`) — used by the floating chat button
- [ ] School email address (`school.email`)
- [ ] Office hours (`school.hours`)
- [ ] Social media handles: Facebook / Instagram / X / YouTube (`school.socials`)

## 3. Fees (per term, in ₦) — `fees[]` and seed `FeeStructure`
- [ ] Creche — tuition, levies
- [ ] Nursery — tuition, levies
- [ ] Primary 1–6 — tuition, levies
- [ ] JSS 1–3 — tuition, levies
- [ ] SSS 1–3 — tuition, levies
- [ ] Any one-off fees (application form fee, acceptance fee, WAEC/NECO exam fee)
- [ ] Sibling discount policy (from 3rd child?)

## 4. School bus — `routes[]`
For **each route**: name, exact stops in order, morning pickup time, per-term fee:
- [ ] Route 1: Yaba–Odojomu area — stops / time / ₦
- [ ] Route 2: Fagun–Sabo area — stops / time / ₦
- [ ] Route 3: Akure Road — stops / time / ₦
- [ ] Route 4: Ife Road — stops / time / ₦
- [ ] Any additional routes

## 5. People
- [ ] Principal: full name, photo, short welcome-message approval (`principal`)
- [ ] Administrator (school admin): name, photo
- [ ] Vice Principal(s), Bursar: names, photos (`leadership[]`)
- [ ] Head of Primary / Head of Science etc. (`staff[]`)
- [ ] **Class teachers** per class (Creche → SSS 3) — needed for Phase 2 portals (`classTeachers[]`)
- [ ] Written consent from every staff member whose photo is published

## 6. Admission requirements per level — `admissionRequirements`
- [ ] Confirm the document list for Creche / Nursery / Primary / Secondary
- [ ] Application fee amount (if any) and how to pay before Phase 3
- [ ] Entrance assessment day (currently "first Saturday of the month"?)

## 7. Numbers & claims — `stats[]`, `whyTemidire`
- [ ] Real student count (all arms)
- [ ] Years of operation
- [ ] WAEC credit-pass percentage (only if the school wants it published)
- [ ] Number of qualified teachers
- [ ] Average class size (the "18 per class" claim)
- [ ] Confirm the three "Why Temidire" statements with the school

## 8. Story & content
- [ ] Timeline milestones (5 events with years) — `timeline[]`
- [ ] 3–4 real testimonials with written parent/alumni permission — `testimonials[]`
- [ ] Alumni names + "where now" (with permission) — `alumni[]`
- [ ] 3 launch news posts (replaces the 4 demo posts in the database)
- [ ] Upcoming term dates (resumption, open day, mid-term, exams, vacation) — `events[]`

## 9. Accounts to create on launch (SUPER_ADMIN does this in /admin/users)
- [ ] Administrator — name, email, temp password
- [ ] Principal — name, email, temp password
- [ ] Vice Principal(s) — name, email
- [ ] Bursar — name, email
- [ ] Class teachers (Phase 2 logins)

## 10. Phase 3 (payments) — later, not blocking
- [ ] Paystack business account (register at paystack.com with the school's CAC + bank account)
- [ ] Bank account for settlements
- [ ] Decision: full-term payment only, or allow instalments?

---

**How to hand these over:** just paste them in chat in any order (e.g. "Fees: Creche 75k, levies 12k…").
I'll update `siteContent.ts`, re-seed the database, and the whole site reflects it instantly.
Nothing here blocks going live with placeholders — launch first, refine after.
