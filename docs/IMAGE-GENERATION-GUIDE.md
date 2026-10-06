# 🖼️ Image generation guide — Temidire International College

Generate these in **Leonardo AI** and drop the WebP files into `temidire/public/images/`.
The site references them by exact filename — keep the names exactly as listed.

---

## How to generate

1. Go to **leonardo.ai** → create an account (free tier gives ~150 tokens/day).
2. Choose **Model: Leonardo Phoenix** (or Lucid Realism). **Style: Photography/Cinematic**. **Alchemy: ON**.
3. Paste the prompt, add the **style line** and **negative prompt** below.
4. Generate **4 images**, pick the best, download as **WebP** (≈1200–1600px wide).
5. Save to `temidire/public/images/<filename>.webp` — exact name from the table.
6. Repeat for each row.

---

### Style line — append to EVERY prompt
```
natural warm daylight, shallow depth of field, shot on 35mm, realistic skin tones, candid, West African private school in Ondo, Nigeria, navy and gold uniform accents
```

### Negative prompt — use for EVERY generation
```
text, letters, watermark, logo, signature, distorted hands, extra fingers, deformed faces, plastic skin, oversaturated, cartoon, nsfw
```

### Uniform rule
Every image with people: **navy blazers/tunics with gold trim and white shirts** — so all imagery matches the brand. Don't generate staff or principal photos for the final site (use real consented photos instead).

---

## Required images (14 files)

| # | Filename (save to `public/images/`) | Ratio | Where it's used | Prompt |
|---|---|---|---|---|
| 1 | `hero-campus.webp` | 3:2 | Home hero (right side) | Wide view of a modern two-storey school building with a green lawn and a paved assembly area, a few pupils in navy uniforms walking, clear blue morning sky |
| 2 | `school-creche.webp` | 4:3 | Home "book spines" + Schools page | Nigerian toddlers playing with colourful wooden blocks on a soft mat, a caring female caregiver kneeling beside them, bright airy room |
| 3 | `school-nursery.webp` | 4:3 | Home "book spines" + Schools page | Nursery pupils painting at a low table, hands covered in paint, teacher smiling, colourful classroom walls |
| 4 | `school-primary.webp` | 4:3 | Home "book spines" + Schools page | Primary school pupils raising their hands in a bright classroom, a teacher at the whiteboard, tidy desks |
| 5 | `school-secondary.webp` | 4:3 | Home "book spines" + Schools page | Secondary students doing a science experiment with beakers in a school laboratory, white lab coats, focused expressions |
| 6 | `principal.webp` | 4:5 | About page — Principal's welcome | Studio-style portrait of a friendly Nigerian female school principal in her 40s, navy blazer with gold trim, neutral background, soft light **(placeholder only — replace with the real Principal's photo before launch)** |
| 7 | `portrait-teacher-a.webp` | 4:5 | Leadership page | Studio-style portrait of a friendly Nigerian female teacher, navy blazer, neutral background, soft light **(placeholder only)** |
| 8 | `portrait-teacher-b.webp` | 4:5 | Leadership page | Studio-style portrait of a friendly Nigerian male teacher, navy blazer, neutral background, soft light **(placeholder only)** |
| 9 | `portrait-teacher-c.webp` | 4:5 | Leadership page | Studio-style portrait of a Nigerian female teacher in her 30s, navy blazer, warm smile, neutral background **(placeholder only)** |
| 10 | `assembly.webp` | 16:9 | Home gallery + Student life | Morning assembly on a paved courtyard, rows of pupils in navy uniforms with gold-trim collars, seen from behind and the side, flag pole in the distance |
| 11 | `science-lab.webp` | 3:2 | Home gallery | Modern school science lab, rows of benches, microscopes and glassware, a teacher guiding students |
| 12 | `sports-day.webp` | 3:2 | Home gallery + Student life | Children in house-coloured T-shirts running a relay race on a school field, joyful, motion in the legs |
| 13 | `library.webp` | 3:2 | Home gallery | Quiet school library with wooden shelves, students reading at long tables, warm light from tall windows |
| 14 | `graduation.webp` | 3:2 | Home gallery | Secondary school graduates in navy gowns with gold sashes throwing caps in the air on a lawn |

---

## Nice-to-have extras (gallery page uses these too)

| # | Filename | Ratio | Prompt |
|---|---|---|---|
| 15 | `computer-lab.webp` | 3:2 | School computer room, students at desktop computers, screens softly glowing, orderly rows |
| 16 | `playground.webp` | 4:3 | Children playing on a school playground, laughing, bright afternoon |
| 17 | `school-bus.webp` | 3:2 | A yellow school bus parked at the school gate, children in navy uniforms boarding, driver smiling, early morning light |
| 18 | `classroom-wide.webp` | 16:9 | Wide shot of a bright secondary classroom, students at desks, teacher mid-explanation, large windows |

---

## Gallery extras (optional — for a richer gallery page)

Generate a few more if you want a fuller gallery grid:

| Filename | Ratio | Prompt |
|---|---|---|
| `debate.webp` | 3:2 | Nigerian secondary students in a school debate competition, one speaking at a podium, audience of pupils, navy uniforms |
| `drama.webp` | 3:2 | School drama performance on a stage, pupils in costumes, spotlight, audience |
| `football.webp` | 3:2 | Children playing football on a school field, motion, joyful, bright daylight |
| `cultural-day.webp` | 3:2 | Cultural day celebration, Nigerian children in traditional Yoruba attire, colourful, dancing |
| `robotics.webp` | 3:2 | Students in a school robotics club working on a small robot, focused, modern classroom |
| `about-history.webp` | 3:2 | Archival-style photograph of a small first-generation Nigerian school building from the 2000s, a handful of pupils in front, slightly faded colours |

---

## Two things NOT to AI-generate

1. **Staff & Principal photos** — AI faces are placeholders only. The final site must use real, consented photos of the actual people. The `principal.webp` and `portrait-*.webp` files are placeholders that get replaced when you have real photos.
2. **The crest/logo** — image models draw heraldry and text badly. The site already has an animated SVG crest (`src/components/motion/Crest.tsx`) as a placeholder. When you have the real logo, send it and I'll convert it to the animated SVG.

---

## Free photo sources (no AI needed)

If you'd rather use real photos (recommended for a school site), search these free libraries:
- **Unsplash** — search "African classroom", "Nigerian school", "school children Africa"
- **Pexels** — same searches
- **Pixabay** — same

Check each licence. Avoid photos with visible brand logos.

---

## After generating

1. Drop each `.webp` into `temidire/public/images/`.
2. Verify the site shows them: run `npm run dev` and check the Home page, Schools page, About page, Gallery page.
3. If a file is missing, the site shows a broken image icon — the site still works; just replace the filename in `src/content/siteContent.ts` if you rename any.
4. When you have real staff/principal photos, replace `principal.webp` and `portrait-*.webp`, and update the names in `siteContent.ts`.
