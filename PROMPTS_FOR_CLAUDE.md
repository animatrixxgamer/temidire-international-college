# 🤖 PROMPTS FOR CLAUDE — regenerate any animation, in this project's style

These prompts produce components that drop straight into `src/components/motion/`.
The design language: **navy `#06122A` / `#0F2B57` · gold `#C9A24B` · ivory `#F5EFE0`**, Framer Motion,
`prefers-reduced-motion` respected, Tailwind v4 tokens (`bg-navy-950`, `text-gold-500`, `bg-ivory-100`).

Paste the CONTEXT block below at the top of any prompt, then the specific prompt.

---

## CONTEXT (paste this first, every time)

```
I'm working on a Next.js 15 App Router + TypeScript project. Animations use framer-motion (already installed).
Design tokens (Tailwind v4 @theme): navy-950 #06122A, navy-900 #0B1F3F, navy-800 #0F2B57, navy-700 #16407A,
gold-500 #C9A24B, gold-300 #E2BF6A, ivory-100 #F5EFE0, emerald-600 #0E7C5B, ember-500 #C2410C, amber-400 #E0A800.
Headings use font-serif (Fraunces), body font-sans (Plus Jakarta Sans).
Rules: respect useReducedMotion() (no motion when true), animate only transform/opacity/clip-path/filter,
entrances play once (viewport once), max 3 ambient loops per page. Output a single .tsx file for
src/components/motion/ with "use client" at the top and TypeScript types.
```

---

## The prompts

**1. Custom cursor (exists — regenerate to restyle)**
> Build a custom cursor: a small gold dot exactly at the pointer plus a lagging ring (spring stiffness 140, damping 18). The ring grows on links/buttons, and becomes a filled gold "View" badge over images and elements with `data-cursor="view"`. Hide the native cursor by adding a `cursor-none-all` class to `<html>` on pointer:fine devices only. Render nothing for touch devices or reduced motion.

**2. Hero section (exists)**
> Create a full-viewport hero: dark navy background with three radial gradient blobs, 28 floating gold particles (deterministic positions so SSR/client match, 7s float loop), a typewriter headline at 55ms/char with a blinking gold caret, and two CTAs that rise in with 600/800ms delays. Reduced motion shows the full headline instantly with no particles.

**3. Smooth scroll + section reveal (exists)**
> Build a SmoothScroll provider wrapping Lenis (lerp 0.09, desktop pointer:fine only, disabled for reduced motion) plus a Section/Item pair: whileInView stagger of children rising 36px over 0.8s with cubic-bezier(.2,.7,.2,1), and optional parallax on the section itself.

**4. Magnetic gold button (exists)**
> Build a MagneticButton: spring-follows the cursor within its bounds (strength 0.35), gold gradient with a shine-sweep on hover, scale 0.93 spring on tap. Reduced motion: static gold button, still tappable.

**5. Crest preloader (exists)**
> Build a preloader: an SVG school crest (crown, quartered shield with star/lamp/book, laurels) draws stroke by stroke with pathLength animation, then the shield fills with gold at 13% opacity, the motto fades in, and two navy curtains wipe away vertically. Plays once per session (sessionStorage), skippable by click, max ~2.6s, instant for reduced motion.

**6. Page transition (exists)**
> Build curtain page transitions: a TransitionProvider with a scaleY navy curtain (origin bottom when covering, top when revealing, 0.65s cubic-bezier(.76,0,.24,1)) with a 1px gold leading edge, a TransitionLink that covers then navigates after 650ms, and a template that fades/rises content in on mount with a 300ms delay.

**7. Testimonials carousel (exists)**
> Build a testimonial carousel: Fraunces quote centered, autoplay every 7s, pauses on hover/focus, drag-to-swipe with 60px directional slide, dots where the active dot is a gold ring that slides with layoutId, Prev/Next buttons, aria-roledescription carousel, no autoplay under reduced motion.

**8. History timeline (exists)**
> Build a vertical timeline: a 1px gold spine that draws downward tied to scroll progress (spring smoothed), alternating left/right milestones, each with a gold dot that pops (spring 400/14) and content that slides in from its side once, 3xl serif gold year.

**9. Admissions steps (exists)**
> Build a horizontal step indicator: numbered circles connected by a hairline; a gold progress line fills to the active step (spring), active circle scales 1.2, completed circles fill gold, and a content panel below crossfades (mode="wait", 0.25s) with Back/Next buttons.

**10. Portal micro-kit (exists)**
> Build portal components: PortalTabs (pill nav, gold gliding layoutId indicator), ProgressRing (SVG ring animating stroke-dashoffset with counting number), SkeletonSwap (shimmer skeleton rows crossfading to content), StaggerList (rows rising 60ms apart with layout FLIP), and a ToastProvider (bottom-right, spring in, auto-dismiss 3.5s, aria-live polite).

**11. Book-spine school selector (exists)**
> Build four tall panels that expand like book spines on hover: flex-grow animation 1→1.6 (500ms), vertical writing-mode name that turns horizontal when expanded, photo revealed with a gradient overlay, other panels shrink. Mobile: accordion with height animation instead.

**12. Count-up stats (exists)**
> Build a CountUp component: animates 0→value over 1.8s easeOut when scrolled into view (once), tabular-nums, optional suffix/prefix/custom formatter, renders final value immediately under reduced motion.

**13. NEW — notification bell wiggle**
> Build a NotificationBell for a portal header: SVG bell that wiggles (±12deg, 3 times) when unreadCount increases, a small gold dot that pulses 3 times then stops, and a dropdown panel that scales in from the bell with staggered items.

**14. NEW — attendance register chips**
> Build an AttendanceChip for a class register: tap toggles PRESENT (emerald fill) / ABSENT (ember) / LATE (amber) with a spring colour flip and a small tick draw; live counts above the list animate up/down on each change; "Mark all present" triggers a 60ms staggered wave down the list.

**15. NEW — score entry grade flip**
> Build a ScoreInput: as the user types a score, the total flashes gold once and the WAEC grade chip (A1–F9) flips (rotateX 90°) to the new grade; class average counts up in the header. Keyboard friendly, works without motion under reduced-motion.

**16. NEW — fees progress + confetti**
> Build a FeeProgressBar: fills to % paid with a gold gradient over 1.2s, the paid amount counts up once and then stays static (fees must not re-animate), and when status flips to PAID a one-time confetti of 12 gold dots bursts for 700ms then unmounts.

**17. NEW — timetable current-period highlight**
> Build a TodayTimetable: weekly grid rows; the current period has a 3px gold left border that gently breathes (scale/opacity ±4%, 4s loop); when the period changes the gold highlight Glides (layoutId) to the next row; outside school hours show "School closed" state.

**18. NEW — real crest swap helper**
> Given an SVG school crest file, produce a Crest.tsx that exports CREST_STROKES (array of path `d` strings with shield flag) and keeps the existing Preloader animation working, viewBox normalized to 240×290, motto text configurable.

**19. NEW — gallery masonry with FLIP filters**
> Build a filterable gallery: chips filter albums with FLIP reordering (framer-motion layout), images reveal with a clip-path mask wipe staggered 60ms, lightbox opens from the clicked thumbnail via layoutId zoom with arrow-key navigation and Escape to close.

**20. NEW — empty states that draw**
> Build three empty-state illustrations (open book, empty calendar, empty inbox) as SVGs that draw themselves once via pathLength when mounted, with one gentle breathe loop afterward, one-line caption below, never sad faces.

---

## Style guardrails to repeat to Claude if it drifts

- "No all-caps eyebrow labels, no numbered markers unless it's a real sequence."
- "Gold text only on navy backgrounds; on ivory use navy text with a gold underline."
- "Only three radii: 6px inputs, 12px panels, 999px buttons/chips."
- "Animate only transform, opacity, clip-path, filter — never width/height/top/left."
- "Every component must check useReducedMotion()."
