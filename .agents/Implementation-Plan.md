# Implementation Plan

## Step 1: Pre-requisites & Audit (Completed)
1. Audit current file structure, content, and IA.
2. Create vibe coder foundation documents.

## Step 2: Declaration, Content & Design Lock (Completed)
1. Declared overhaul mode and Next.js tech stack migration.
2. Integrated user's `Resume.pdf` (Android, Jetpack Compose, AI/ML).
3. Integrated user's `NLP_IN_Python_certificate.jpg`.
4. Locked Design System: "Dark Tech & AI Native", Emerald Green accents, Geist + JetBrains Mono typography.
5. Defined AIDA Layout via RNG: Cinematic Center Hero, Gapless Bento Grid, Card Stacking, Horizontal Accordions.

## Step 3: Next.js Foundation & Scaffolding (Current)
1. **Scaffold:** Verify Next.js App Router environment, Tailwind CSS, TypeScript setup.
2. **Dependencies:** Install `gsap`, `@gsap/react`, `motion/react`, and required icon libraries (`@phosphor-icons/react` or `lucide-react`).
3. **Data Layer:** Create structured data files (`data/resume.ts`) holding Nisarg's experience, skills, and projects to avoid cluttering UI components.

## Step 4: Component Implementation (AIDA)
1. **Attention (Hero):** Build `Cinematic Center` Hero. Massive width, updated title "Software & AI/ML Engineer", Emerald Green primary CTA.
2. **Interest (Bento Grid & Certs):** Build `Gapless Bento Grid` for skills. Build `Certifications` section with external images and `LeadershipAndLanguages` sections.
3. **Desire (GSAP Motion & Cinematic Lists):** Implement `Card Stacking` for Experience (with opacity:0 fix so back cards vanish cleanly). Replace Accordions with `ProjectsList` (cinematic hover-reveal list) to elegantly display text-heavy projects without oversized empty cards.
4. **Action (Footer):** Build massive contrast CTA footer. Removed copyright. Make all contact links (Email, Phone, LinkedIn, GitHub) thoroughly visible.

## Step 5: Polish & Audits
1. Strip all meta-labels and em-dashes across all components.
2. Verify Button text contrast (WCAG AA minimum for Emerald/Off-black).
3. Verify `gpt-taste` hero limits (no 6-line headers, proper container widths).
4. Perform final performance/accessibility check.

## Step 6: Polish round 2 (2026-10-28, branch `feat/nav-experience-whatsapp`)
Feedback after the navbar/hero fixes. Tasks are tracked in [Tasks.md](Tasks.md) Phase 5.

1. **Hero bridge 3 (user generates the clip).** Hovering straight onto the middle while he works cuts from frame 14 to 47 (only a blink hides it). A generated working -> smiling-at-viewer clip (frames 175+) will replace the blink. Prompt and reference frames: `.agents/bridge-frames/bridge3_*` and handoff.md.
2. **Navbar logo.** Use the real brand mark (`src/app/icon.jpg`, neon "N") instead of the text "NP" badge. Replace the browser's white focus ring with an emerald `:focus-visible` ring sitewide.
3. **Experience fade.** The covered card must be gone by the time the next one is mostly up: opacity fades over the first part of the next card's approach, scale keeps the full range.
4. **Connect link.** Navbar link "Connect" -> `#contact` (footer).
5. **Smooth section scroll.** Navbar links scroll smoothly (instant under reduced motion) instead of jumping. Move the navbar's scroll handling to Motion's `useScroll` (taste skill bans raw window scroll listeners).
6. **WhatsApp.** Floating WhatsApp button (bottom-right, back-to-top sits above it). Desktop: opens a card with a QR code (static SVG in `public/`, generated once, no new dependency) and a "Chat on WhatsApp" button. Mobile: no QR, the button opens WhatsApp directly. Also a WhatsApp row in the contact dialog.
7. **Ideas only (no build yet).** Creative directions for Skills, Projects and Certifications in [Ideas.md](Ideas.md), for the user to pick from.

## Step 7: Creative sections (2026-10-28, branch `feat/creative-sections`)
The user picked the recommended combination from [Ideas.md](Ideas.md). Tasks: [Tasks.md](Tasks.md) Phase 6.

**Shared data (`src/data/skillGraph.ts`).** "Works" = jobs, projects and certifications. A skill links to a work when its name (parentheses stripped, whole word, case-insensitive) appears in that work's text: job role + details, project tech + description, certificate name + description. Nothing new is added to `portfolio-data.json`; the links come from what it already says. Two skills are connected when they share a work.

1. **Skill constellation** (replaces `BentoGrid`, keeps `#skills`). Desktop: SVG star map, one cluster per skill category (mobile, AI/ML, backend, data, tools), node size = number of works, lines = shared works. Hover/focus/tap a skill: its neighbours and lines light up, others dim, and a panel lists where it was used (job / project / certificate). Phones: the same skills as tappable chips by category, with the same panel. Entrance: nodes and lines draw in once, in sequence (skipped under reduced motion).
2. **Projects horizontal pan** (replaces the alternating cards, keeps `#projects`). Desktop with motion allowed: section pins and the slides pan sideways with scroll, with a progress bar (GSAP ScrollTrigger, taste skill 5.B). Phones or reduced motion: a native swipe carousel with scroll-snap. Each slide: image, index, name, description, tech chips; a chip that is a known skill jumps to the constellation with that skill selected.
3. **Credential wallet** (replaces the certificate rows, keeps `#certifications`). Certificates as overlapping wallet cards; one is open at a time (accordion semantics, `aria-expanded`), showing the certificate image, description, related skills and a Verify link. Motion `layout` animates opening; reduced motion makes it instant.

Hub link: a `focus-skill` window event (skill name) lets project and certificate chips select a skill in the constellation and scroll to it.

## Step 8: Skill wheel (2026-10-28, branch `feat/skill-wheel`)
The constellation read as jumbled (invisible groups, random-looking spiral, tangled lines, and 23 of 37 skills with no links in the data). User picked the skill wheel.
- **Data-driven:** groups are the keys of `skills` in `portfolio-data.json`, in file order; titles from a small known-name map, otherwise the key prettified (`cloud_tools` -> "Cloud Tools"). Adding a key adds a slice; adding a skill adds a spoke. Slice size follows skill count.
- **Desktop:** SVG wheel. Each group is a labelled arc slice; skills sit on the rim with radial labels; node size = number of works. Picking a skill (hover/focus/click) draws curved links through the middle to the skills it shares work with, dims the rest, shows its name in the centre and fills the side panel. Unpicked links stay hidden, so no spaghetti.
- **Phones:** grouped chips (same dynamic groups) + the same panel.
- Also: projects progress bar fix (Tailwind v4's `scale-x-*` uses the CSS `scale` property, which multiplied with the inline `transform: scaleX()` and kept the bar near empty).

## Step 9: Fresh hero clips (2026-10-28, planned)
The current hero is stitched from one original take plus three generated bridges and a glance clip, each with slightly different framing. That needs size-matching at the joins (the source of the visible "bigger, then suddenly smaller" jumps) and a lot of special-case path code. The user decided to regenerate everything fresh on magenta and rebuild the frames and the player around them.

**Principle: one hub frame.** Every clip starts (and the loop and glance clips also end) on the same reference image, `.agents/bridge-frames/fresh/hub_working_magenta.png` (working, eyes on the laptop). All joins then happen on identical frames: no size matching, no crossfades, no bridge clips.

**Clips (all 1920x1080, 24 fps, flat magenta #FF00FF background, locked camera, same size and position as the hub):**
1. **Glances (pilot), ~8 s:** hub -> look right, short hold -> swing across to look left, short hold -> back to the hub. First and last frame = hub.
2. **Working loop, ~4 s:** hub -> typing, small natural movements -> hub. First and last frame = hub.
3. **Greeting, ~10 s:** hub -> looks up at the viewer and smiles -> takes the headphones off -> waves -> points down toward the page and holds. First frame = hub.
Optional later, only if returning to the hub before greeting from a side feels slow: two short bridges, right look -> smile and left look -> smile.

**Player after the clips land:** segments cut automatically from the keyed frames (hub, right peak, left peak found by pose matching); every glance or greeting is "play segments forward or backward through the hub". Holds are done in code (repeat the peak frame), so the clips only need short holds. WARPS, SEAMLESS lists and bridge special cases go away. Phones keep only the loop and the greeting.

**Pilot check before making the other two:** first and last frames must match the hub (measured, after keying); the figure must not drift in size or position through the clip; the magenta must stay flat. If drift shows up, adjust the prompt before generating the rest.
