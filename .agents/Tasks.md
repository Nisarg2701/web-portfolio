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

## Phase 6: Creative sections (2026-10-28)
- [x] T0 Bridge 3: clear the white patches in the headband/ear-cup gaps (cut-out keeps holes ringed by hair/headphones transparent)
- [x] T1 `skillGraph.ts`: works, skill <-> work links, skill <-> skill edges
- [x] T2 Skill constellation (desktop SVG + phone chips, shared detail panel, entrance animation, reduced motion)
- [x] T3 Projects horizontal pinned pan (desktop) / swipe carousel (phones, reduced motion)
- [x] T4 Credential wallet for certifications
- [x] T5 `focus-skill` hub link from project and certificate chips
- [x] T6 Verify desktop + phone + reduced motion, lint/typecheck/build; update docs; merge into `dev`

## Phase 7: Feedback on creative sections (2026-10-28)
- [x] F1 Wallet: opening/closing felt "wacky" (springy layout jumps, title resizing). Replace with a controlled height + fade tween, fixed title size.
- [x] F2 Constellation: reads as jumbled, weakly connected and hard to classify. Diagnosed; user picked the skill wheel (F4).
- [x] F3 Projects progress bar stuck near empty
- [x] F4 Skill wheel replaces the constellation; categories and skills come straight from `portfolio-data.json` (new category key = new slice, new skill = new spoke, no code change)
- [x] F5 Add skills: new `ai_tools` category (ChatGPT, Claude, Gemini, Nano Banana, DALL-E, Omni, Veo); Vercel, Supabase -> cloud_tools; Redis -> databases (PostgreSQL already listed). 47 skills now.
- [x] F6 Skills section: user rejected the wheel and the round-2 ideas for now; restore the original bento grid (H1). User will come back with an idea.

## Phase 8: Hero weight + glance lag (2026-10-28, branch `fix/hero-weight-bento`)
- [x] H1 Restore the original bento skills section (with the new skills); remove the wheel, the skill graph and the project/certificate jump chips
- [x] H2 Phones: no glances. Any tap greets; load only the working loop + bridge 3 + greeting
- [x] H3 Delete frames nothing plays (113-120)
- [x] H4 Glance lag, measured: right turn spends ~1.9 s reaching its peak (bridge 1 starts slowly and stalls mid-way; left turn takes 0.67 s), and right -> left ends in ~0.5 s of near-still frames (the original blink section played backwards). Fix = new user-generated clip working -> right -> left. Prepare see-through references + prompt with a magenta key background.
- [x] H5 Integrate the new glance clip (frames 223-257; replaces bridge 1 and take frames 23-43)
- [x] H6 Greeting from the right no longer plays bridge 3 (glance clip turns him to centre and blinks at 239, bridge 2 continues from its own blink at 146)
- [x] H7 Greeting from the left: cut bridge 2's held smile (158-174) and hand over at 157 -> 49 (greeting's own smile); frames 158-174 and 44-46 deleted

## Phase 9: Fresh hero clips (2026-10-28)
- [x] P0 Plan the clip set around one hub frame; prepare the hub reference and the pilot prompt
- [x] P1 User generates the pilot (glances clip); check hub match, size drift, background flatness
- [x] P2 User generates the working loop and greeting clips (greeting take 2: headphones slide back over the head)
- [x] P2b Widen the crop box to (208, 0, 1518, 1080) so the greeting's elbows and headband fit (character ~10% smaller)
- [x] P3 Key, cut to segments, export frames (full + sm), delete the old frame set (`build_hero_frames.py`)
- [x] P4 Rewrite the player around hub segments (drop WARPS / SEAMLESS / bridge special cases); keep the path check script
- [x] P5 Verify (path check, offline path render, live load in the pane), update docs, merge into dev
- [x] P6a User feedback: greeting from a side went back to work first; animation slow. Fixed: side greeting enters the greeting from the nearest forward-facing glance frame; frames rebuilt at every 4th source frame (2x speed, half the download)
- [x] P6b User: 2x too fast, 1x too slow; crossfades look bad. Rebuilt at every 3rd frame (1.5x); all crossfades replaced by measured frame matches; side holds ~2.5 s per the user's guide; after greeting, a tap waves again
- [x] P7 User generates two bridge clips (right look -> smile, left look -> smile); added to the build and the paths
- [x] P8 User: back to natural speed (every frame at 24 fps), no repeated frames (no bounce holds, no ping-pong at the end, no rewind-to-wave)
- [x] P9 User review at 24 fps: found a bug (junk fast typing + headphones coming off whenever he returns to work, on a fresh load)
- [ ] P10 Next agent: delete all old frames, rebuild optimally from the user's 5 clips, fix the return-to-work bug (see handoff "NEXT TASK")

## Phase 10: Hero rebuild, shortest-path player (2026-10-28, branch `feat/hero-graph-rebuild`)
- [x] R1 Build script: key all 5 clips, measure seamless cuts, per-goal shortest-path table, export only reachable frames (1280 + 800)
- [x] R2 Player follows the table at a steady 24 fps (no catch-up skipping), decode before ready
- [x] R3 Path check script rewritten for the table; offline render of real interaction sessions
- [x] R4 Verify (lint/tsc/build, live load), docs, merge into dev

## Phase 11: Cleanup (2026-10-28, branch `chore/cleanup-unused`)
- [x] C1 Remove unused files: `public/images/profile.jpg`, `.agents/scripts/bridge_cutout.py`, 258 `sm/` frames small screens never request (build script now writes `sm/` only for phone-reachable frames; path check fails on any deployed frame nothing shows)
- [x] C2 Components grouped into `layout/`, `sections/`, `hero/`; content JSON moved to `src/data/`
- [x] C3 Old local reference images deleted (`.agents/bridge-frames/` keeps only `fresh/`: source clips + references)
