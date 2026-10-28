# Memory

Long-lived context about the user and their preferences. Current state and next steps live in [handoff.md](handoff.md).

## User Preferences
- **Identity**: "Software & AI/ML Engineer" with ~3 years of experience. Wants to de-emphasize Android.
- **Theme**: "Dark Tech & AI Native": off-black backgrounds (`bg-zinc-950`), emerald accents (`text-emerald-500`). No other accent colours.
- **Typography**: `JetBrains Mono` for tech/meta text, `Geist` for body/headings.
- **Vibe**: "Premium, high-end agency look, Awwwards level". Quality animation, minimal bloat.
- **Motion**: smooth and controlled. Springy or "wacky" motion, size jumps and visible lags get noticed and rejected. Phones: no surprise autoplay.
- **Skills section**: likes the original bento's clear categories. Rejected a skill constellation, a skill wheel and the round-2 ideas in `Ideas.md`. Will bring their own idea; don't push skill redesigns meanwhile.
- **Contact**: phone number stays public (decided 2026-10-26); WhatsApp QR shown on desktop only.

## Workflow Preferences
- Branch from `dev` for each piece of work, verify, merge back into `dev`. Pushing is a separate step, only on request.
- Update the `.agents` docs before starting (Implementation-Plan + Tasks) and again when done (Memory + handoff).
- Use the repo skills: ponytail, taste skill (`.agents/skills/design-taste-frontend`), design-md references, graphify.
- The user generates video clips from prompts and reference images Claude prepares. Recipe: references without background, prompt asks for a flat magenta (#FF00FF) background, locked camera and constant character size; the user delivers 24 fps 1080p MP4s; the site plays 12 fps. Key with `.agents/scripts/magenta_key.py`.
- When the user says "keep only the necessary frames", trim still stretches at clip ends and measure motion per frame before choosing.

## Iteration History
1. **Initial**: basic portfolio with `framer-motion`; user found it too templated.
2. **Redesigns**: timeline/terminal UI (disliked, "lame"); Education as a big bento; GSAP ScrollTrigger projects; footer resume modal.
3. **Polish**: experience stacking fix, glassmorphic projects, stacked certificate rows, `<object>` PDF viewer, CGPA count-up.
4. **2026-10-25/26**: audit and fixes, deployed to Vercel; animated canvas hero character replaced the profile photo.
5. **2026-10-28** (unpushed, on `dev`): hero mobile fixes, navbar, back-to-top, WhatsApp, brand logo; bridge 3; project pan and certificate wallet; skills experiments rejected, bento restored; AI tools added; phones load only loop + greeting; magenta glance clip; greeting paths fixed. A size-jump between clips led the user to plan a **fresh set of hero clips around one hub frame** (handoff "Active task"). Don't patch the old frame set further.

## Security
- `portfolio-data.json` is not served from `public/`, but client components bundle the data they read. It is all public info.

## Audit
- 2026-10-25 audit: `.agents/Audit.md`; checklist `.agents/Areas-to-Work.md` (all done).
