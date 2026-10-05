# 🖼️ Placeholder imagery — what to generate and where it goes

Generate with **Leonardo AI → Phoenix (or Lucid Realism)**, style **Photography/Cinematic**, Alchemy ON.
Generate 4 per prompt, pick the best. Export as **WebP**, then drop into `temidire/public/images/` with the exact filename listed.

**Append this style line to every prompt:**
> natural warm daylight, shallow depth of field, shot on 35mm, realistic skin tones, candid, West African private school in Ondo, Nigeria, navy and gold uniform accents

**Always add this negative prompt:**
> text, letters, watermark, logo, signature, distorted hands, extra fingers, deformed faces, plastic skin, oversaturated, cartoon, nsfw

**Uniform rule for every image:** navy blazers/tunics with gold trim and white shirts — so all imagery matches the brand.

---

## Required images (14)

| # | File name (save to `public/images/`) | Used on | Ratio | Prompt |
|---|---|---|---|---|
| 1 | `hero-campus.webp` | Home hero (right side, shield mask) | 3:2 | Wide view of a modern two-storey school building with a green lawn and paved assembly area, a few pupils in navy uniforms walking, clear blue morning sky |
| 2 | `school-creche.webp` | Home "book spines" + Schools page | 4:3 | Nigerian toddlers playing with colourful wooden blocks on a soft mat, a caring female caregiver kneeling beside them, bright airy room |
| 3 | `school-nursery.webp` | Home "book spines" + Schools page | 4:3 | Nursery pupils painting at a low table, hands covered in paint, teacher smiling, colourful classroom walls |
| 4 | `school-primary.webp` | Home "book spines" + Schools page | 4:3 | Primary school pupils raising their hands in a bright classroom, a teacher at the whiteboard, tidy desks |
| 5 | `school-secondary.webp` | Home "book spines" + Schools page | 4:3 | Secondary students doing a science experiment with beakers in a school laboratory, white lab coats, focused expressions |
| 6 | `principal.webp` | About page (Principal's welcome) | 4:5 | Studio-style portrait of a friendly Nigerian female school principal in her 40s, navy blazer with gold trim, neutral background, soft light *(placeholder only — replace with the real Principal's photo before launch)* |
| 7 | `portrait-teacher-a.webp` | Leadership page | 4:5 | Studio-style portrait of a friendly Nigerian female teacher, navy blazer, neutral background, soft light |
| 8 | `portrait-teacher-b.webp` | Leadership page | 4:5 | Studio-style portrait of a friendly Nigerian male teacher, navy blazer, neutral background, soft light |
| 9 | `portrait-teacher-c.webp` | Leadership page | 4:5 | Studio-style portrait of a Nigerian female teacher in her 30s, navy blazer, warm smile, neutral background |
| 10 | `assembly.webp` | Home gallery + Student life | 16:9 | Morning assembly on a paved courtyard, rows of pupils in navy uniforms with gold-trim collars seen from behind and the side, flag pole in the distance |
| 11 | `science-lab.webp` | Home gallery | 3:2 | Modern school science lab, rows of benches, microscopes and glassware, a teacher guiding students |
| 12 | `sports-day.webp` | Home gallery + Student life | 3:2 | Children in house-coloured T-shirts running a relay race on a school field, joyful, motion in the legs |
| 13 | `library.webp` | Home gallery | 3:2 | Quiet school library with wooden shelves, students reading at long tables, warm light from tall windows |
| 14 | `graduation.webp` | Home gallery | 3:2 | Secondary school graduates in navy gowns with gold sashes throwing caps in the air on a lawn |

## Nice-to-have extras (gallery page uses these too)

| # | File name | Ratio | Prompt |
|---|---|---|---|
| 15 | `computer-lab.webp` | 3:2 | School computer room, students at desktop computers, screens softly glowing, orderly rows |
| 16 | `playground.webp` | 4:3 | Children playing on a school playground, laughing, bright afternoon |
| 17 | `school-bus.webp` | 3:2 | A yellow school bus parked at the school gate, children in navy uniforms boarding, driver smiling, early morning light |
| 18 | `classroom-wide.webp` | 16:9 | Wide shot of a bright secondary classroom, students at desks, teacher mid-explanation, large windows |

## Where each is referenced in code

- `src/content/siteContent.ts` → `schools[].image`, `principal.photo`, `leadership[].photo`, `galleryImages[]`
- Missing files simply show as broken images — the site still works; replace filenames in `siteContent.ts` if you change any.

## Two things NOT to AI-generate

1. **Staff & Principal photos** — AI faces are placeholders only; the final site must use real, consented photos of the actual people.
2. **The crest/logo** — image models draw heraldry and text badly. Use the built-in SVG placeholder crest until the school's real logo is ready (then I'll convert it to the animated SVG).
