# 🔎 Content correction sheet — verify with the school

Every value below is currently a **placeholder** in `src/content/siteContent.ts`. Cross out
what's wrong and write the real value. When you're done, paste the corrected values back here
or directly edit `siteContent.ts`.

**How to hand back:** just list the fields that changed, e.g.
> phone: +234 803 555 0198
> whatsapp: 2348035550198
> fees: Primary tuition 130000 (was 120000)

I'll update the file and re-seed.

---

## A. School identity (`school` object)

| Field | Current placeholder | Real value? |
|---|---|---|
| `name` | Temidire International College | |
| `short` | Temidire | |
| `motto` (English) | Knowledge with character | |
| `crestMotto` (Latin, in crest) | Scientia et Virtus | |
| `founded` (year) | 2006 | |
| `address` (full) | 18 Adegoke Street, Ondo Town, Ondo State, Nigeria | |
| `phone` | +234 803 555 0142 | |
| `whatsapp` (no +) | 2348035550142 | |
| `email` | info@temidirecollege.ng | |
| `session` | 2026/2027 | |
| `hours` | Mon–Fri, 7:30am – 4:00pm | |
| `socials.facebook` | https://facebook.com/temidireinternationalcollege | |
| `socials.instagram` | https://instagram.com/temidirecollege | |
| `socials.x` | https://x.com/temidirecollege | |
| `socials.youtube` | https://youtube.com/@temidirecollege | |

---

## B. Fees — per term, in Naira (`fees[]` array)

These appear on the Admissions page and in the fee schedule. Confirm with the Bursar.

| Level | Tuition (₦) | Levies (₦) | Transport (₦) | Correct? |
|---|---|---|---|---|
| Creche | 85,000 | 15,000 | 30,000 | |
| Nursery | 95,000 | 16,000 | 30,000 | |
| Primary 1–6 | 120,000 | 20,000 | 32,000 | |
| JSS 1–3 | 150,000 | 25,000 | 34,000 | |
| SSS 1–3 | 175,000 | 30,000 | 34,000 | |

**Also confirm:**
- Application form fee (one-off): ______ ₦
- Acceptance/enrolment fee (one-off): ______ ₦
- WAEC/NECO exam fee per subject: ______ ₦
- Sibling discount (e.g. 3rd child 10% off): ______

---

## C. School bus routes (`routes[]` array)

For each route, confirm the **exact stops in order**, the **morning pickup time**, and the **per-term fee**.

| Route | Stops (in order) | Pickup time | Term fee (₦) | Correct? |
|---|---|---|---|---|
| Yaba – Odojomu | Yaba Junction → Odojomu Market → Ondo Poly Gate → School | 6:45am | 34,000 | |
| Fagun – Sabo | Fagun Roundabout → Sabo Park → Lagos Garage → School | 6:50am | 32,000 | |
| Akure Road | Akure Road Junction → Bolorunduro → Town Hall → School | 6:40am | 36,000 | |
| Ife Road | Ife Road Filling Station → Oke-Odo → Market Square → School | 6:55am | 32,000 | |

**Additional routes?** List any others: ______

---

## D. People (`principal`, `leadership[]`, `staff[]`, `classTeachers[]` in Phase 2)

Replace all AI placeholder names with real, consented people.

### Principal (`principal`)
- Name: Mrs. Olufunmilayo Akinwale
- Title: Principal
- Photo: `/images/principal.webp` (replace with real photo before launch)
- Welcome message: keep / rewrite? ______

### Leadership team (`leadership[]`)
| Current name | Role | Real name? | Photo? |
|---|---|---|---|
| Mrs. Olufunmilayo Akinwale | Principal | | |
| Mr. Adebayo Fasanya | Vice Principal (Academics) | | |
| Mrs. Bukola Oyelade | Vice Principal (Student Welfare) | | |
| Mr. Segun Adewale | Bursar | | |

### Teaching staff (`staff[]`)
| Current name | Role | Real name? |
|---|---|---|
| Mrs. Titilayo Bamidele | Head of Primary | |
| Mr. Kayode Ogunleye | Head of Science | |
| Mrs. Folake Ajayi | Class Teacher, JSS 1 A | |
| Mr. Tunde Ogundele | Class Teacher, JSS 2 B | |
| Mrs. Ronke Adegoke | Class Teacher, Primary 4 | |
| Miss Damilola Ojo | Class Teacher, Nursery 2 | |

### Class teachers for Phase 2 portals (all classes Creche → SSS 3)
| Class | Class teacher name | Portal login? |
|---|---|---|
| Creche | | |
| Nursery 1 | | |
| Nursery 2 | | |
| Primary 1 | | |
| Primary 2 | | |
| Primary 3 | | |
| Primary 4 | | |
| Primary 5 | | |
| Primary 6 | | |
| JSS 1 A | | |
| JSS 1 B | | |
| JSS 2 A | | |
| JSS 2 B | | |
| JSS 3 A | | |
| JSS 3 B | | |
| SSS 1 A | | |
| SSS 1 B | | |
| SSS 2 A | | |
| SSS 2 B | | |
| SSS 3 A | | |
| SSS 3 B | | |

---

## E. Numbers & claims (`stats[]`, `whyTemidire[]`)

| Stat | Current | Real? |
|---|---|---|
| Students | 512 | |
| Years of excellence | 20 | |
| WAEC credit passes | 96% | (only publish if school agrees) |
| Qualified teachers | 46 | |

### Why Temidire statements
1. "Classes small enough to know every child." — keep / rewrite?
2. "Teachers who stay." — keep / rewrite?
3. "Results you can see each term." — keep / rewrite?

---

## F. Story content

### Timeline (`timeline[]`)
| Year | Title | Text | Correct? |
|---|---|---|---|
| 2006 | Founded | Twelve pupils, two teachers and one borrowed classroom. | |
| 2011 | Secondary section opens | First JSS 1 class admitted. | |
| 2016 | First full WAEC set | Our first SSS 3 class sits the exam on campus. | |
| 2021 | School bus service | Four routes across Ondo Town. | |
| 2025 | New science block | Purpose-built laboratories for every year group. | |

### News posts (`news[]`) — currently 4 demo posts in the DB
Delete all 4 and replace with real term news. List the first 3:
1. ______
2. ______
3. ______

### Events (`events[]`) — upcoming term dates
| Date | Title | Location | Correct? |
|---|---|---|---|
| 2026-10-17 | Open day | Main campus | |
| 2026-10-31 | Mid-term break begins | — | |
| 2026-11-14 | Entrance assessment | Main hall | |
| 2026-12-10 | First term examination begins | All classrooms | |
| 2026-12-19 | End of first term / vacation | — | |

### Testimonials (`testimonials[]`) — 3 placeholder quotes
Replace with real quotes (get written parent/alumnus permission first):
1. ______
2. ______
3. ______

### Alumni (`alumni[]`) — 4 placeholder alumni
Replace with real alumni (get permission first):
1. ______
2. ______
3. ______
4. ______

---

## G. Admission requirements (`admissionRequirements`, `admissionSteps`)

| Level | Required documents | Correct? |
|---|---|---|
| Creche | Birth certificate, 2 passport photos, immunisation card, guardian's ID | |
| Nursery | Birth certificate, 2 passport photos, immunisation card, guardian's ID | |
| Primary | Birth certificate, 2 passport photos, last school report, guardian's ID | |
| Secondary | Birth certificate, 2 passport photos, last school report, PSLC, guardian's ID | |

- Application fee: ______ ₦
- Entrance assessment day: ______ (currently "first Saturday of the month")
- Acceptance fee: ______ ₦

---

## H. Departments & curriculum (`departments[]`, `gradingSystem[]`)

Keep / confirm:
- Sciences: Maths, Further Maths, Physics, Chemistry, Biology, Agricultural Science
- Arts & Humanities: English, Literature, Government, CRS/IRS, History, Yoruba
- Commercial: Economics, Accounting, Commerce, Office Practice

WAEC/NECO grading scale (A1–F9) — keep as-is.

---

## I. Before launch account setup (done in /admin/users by SUPER_ADMIN)

| Role | Email | Temp password | Real? |
|---|---|---|---|
| SUPER_ADMIN (you) | admin@temidirecollege.ng | SUPER_ADMIN_PASSWORD from .env | |
| Administrator | | | |
| Principal | | | |
| Vice Principal (Academics) | | | |
| Vice Principal (Welfare) | | | |
| Bursar | | | |
| (class teachers — Phase 2) | | | |

---

*Generated from `src/content/siteContent.ts`. Fields without a value are the current placeholder — fill in the real one.*
