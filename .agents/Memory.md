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
- The user generates video clips from prompts and reference images Claude prepares. Recipe: references without background, prompt asks for a flat magenta (#FF00FF) background, locked camera and constant character size; the user delivers 24 fps 1080p MP4s; the site plays every frame at 24 fps. Key with `.agents/scripts/magenta_key.py`.
- When the user says "keep only the necessary frames", trim still stretches at clip ends and measure motion per frame before choosing.

## Iteration History
1. **Initial**: basic portfolio with `framer-motion`; user found it too templated.
2. **Redesigns**: timeline/terminal UI (disliked, "lame"); Education as a big bento; GSAP ScrollTrigger projects; footer resume modal.
3. **Polish**: experience stacking fix, glassmorphic projects, stacked certificate rows, `<object>` PDF viewer, CGPA count-up.
4. **2026-10-25/26**: audit and fixes, deployed to Vercel; animated canvas hero character replaced the profile photo.
5. **2026-10-28** (unpushed, on `dev`): hero mobile fixes, navbar, back-to-top, WhatsApp, brand logo; bridge 3; project pan and certificate wallet; skills experiments rejected, bento restored; AI tools added; phones load only loop + greeting; magenta glance clip; greeting paths fixed. A size-jump between clips led the user to rebuild the hero from **three fresh clips around one hub frame** (loop, greeting, glances; Omni 1.1 Flash in Google Flow). Built the same day: 261 frames, wider crop, player walks segments through the hub, no size matching.
- Clip prompts the user wants: one copyable block with the settings inside (start frame by file name only, end frame only if there is one, length, aspect ratio; no frame rate or audio), an "Avoid:" line inside the prompt, timestamped beats. Hard moves are solved in the wording (headphones: slide back over the head so the band never crosses the face), not dropped.
6. **2026-10-28, later**: hero rebuilt from the 5 clips with a shortest-path playback table (measured seamless cuts, one frame per tick, no catch-up skipping); 576 frames, 22 MB desktop / 6.7 MB phones. Fixes the "junk on return to work" seen on fresh loads.
7. **2026-10-28, cleanup**: unused image/script/phone frames removed (public/ ~50 MB -> 32 MB); components grouped into layout/sections/hero; data JSON in `src/data/`. Merged to `main` (production).

## Security
- `portfolio-data.json` is not served from `public/`, but client components bundle the data they read. It is all public info.

## Audit
- 2026-10-25 audit: `.agents/Audit.md`; checklist `.agents/Areas-to-Work.md` (all done).
- **2026-10-29, reduced motion**: experience cards are only sticky under `motion-safe` (in reduced motion they sit in normal flow, so a covered card can't show through); the hero's reduced-motion still is the POINT frame with "Check out the portfolio".
- **2026-10-29, contact dialog**: the resume pane shows `public/resume-preview.webp` (no browser PDF toolbar); re-run `python .agents/scripts/render_resume.py` whenever `Resume.pdf` changes. Connect panel compacted so it fits without scrolling (from ~650px window height up).
