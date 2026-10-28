# Tasks

## Phase 1: Planning & Setup (Completed)
- [x] Run Section 11.B Audit using Graphify and manual inspection.
- [x] Create project documentation (PRD, Architecture, Rules, Phases, Design, Memory, Handoff, Tasks, Implementation-Plan).
- [x] Analyze `Resume.pdf` and extract key metrics (Android, Jetpack Compose, AI/ML integrations).
- [x] Analyze `public/images` and map `NLP_IN_Python_certificate.jpg` for layout inclusion.
- [x] Lock in Theme (Dark Tech & AI Native, Emerald Green) and Typography (Geist + JetBrains Mono).
- [x] Define layout strategy via RNG (Cinematic Center, Bento Grid, Card Stacking).

## Phase 2: Next.js Initialization
- [x] Initialize Next.js App Router project (if not already fully scaffolded).
- [x] Configure Tailwind CSS (off-black backgrounds, Emerald accents).
- [x] Install animation libraries (`gsap`, `motion/react`).
- [x] Setup overarching Theme context and global typography constants.

## Phase 3: Component Building (AIDA Framework)
- [x] Build **Hero Section** (Title updated to Software & AI/ML Engineer).
- [x] Build **Bento Grid** (Skills optimized).
- [x] Build **Experience Section** (GSAP Card Stacking with opacity:0 fade fix).
- [x] Build **Projects Section** (Cinematic List for text-heavy projects without oversized cards).
- [x] Build **Certifications Section** (Images and external links).
- [x] Build **Leadership & Languages Section**.
- [x] Build **Action Footer** (Copyright removed, contact links thoroughly visible).

## Phase 4: Audits & Polish
- [x] Run Em-dash and Meta-label audit (strip any generic AI text markers).
- [x] Run Pre-Flight layout check (verify hero widths, gapless grids, contrast ratios).
- [x] Run Preservation and Brand Fidelity audits.
- [x] Generate New Logo and Favicon (matching the Dark Tech vibe).
- [x] Add count-up animation to CGPA score.
- [x] Fix Experience stacking background so old cards fade out visibly.

## Phase 5: Polish round 2 (2026-10-28)
- [x] T1 Bridge 3 prompt + reference frames for the user (clip itself: user generates)
- [x] T2 Integrate bridge 3 frames (2026-10-28: frames 175-222) into `HeroCharacter.tsx` (blocked on T1 output)
- [x] T3 Navbar uses the brand logo; emerald focus-visible ring sitewide
- [x] T4 Experience: covered card fully faded before the next card settles
- [x] T5 Navbar "Connect" link to the footer
- [x] T6 Smooth scroll for navbar links; navbar scroll logic on Motion `useScroll`
- [x] T7 WhatsApp floating button: QR + chat button on desktop, direct link on mobile; WhatsApp row in contact dialog
- [x] T8 Ideas.md: creative directions for Skills, Projects, Certifications
- [x] T9 Verify (desktop + mobile), lint/typecheck/build, update Memory + handoff, merge into `dev`
