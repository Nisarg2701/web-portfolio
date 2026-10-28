# Handoff

Read this first in a new chat. Last updated 2026-10-28.

## Start here

**Git state**
- Work happens on local `dev`. It is **28 commits ahead of `origin/dev` and `origin/main`, and nothing from 2026-10-28 is pushed or live.** Production (https://nisarg-pakhawala-portfolio.vercel.app) still runs `5c63012`.
- Pushing `dev` makes a Vercel preview; pushing/merging to `main` deploys production. Only push when the user asks.
- The merged feature branches from 2026-10-28 still exist locally (`feat/*`, `fix/*`); they are all merged into `dev` and can be deleted.

**Active task: fresh hero clips** (plan: [Implementation-Plan.md](Implementation-Plan.md) Step 9, checklist: [Tasks.md](Tasks.md) Phase 9)
- Why: the current hero is stitched from one original take, three generated bridges and a glance clip, each framed slightly differently. Joins need size-matching (visible as "bigger, then suddenly smaller") and the path code is full of special cases. The user decided to regenerate everything on magenta and rebuild. **Don't patch the old frame set further.**
- Principle: one **hub** frame (working, eyes on the laptop) that every clip starts on (loop and glances also end on it), so every join is between identical frames: no size matching, no crossfades, no bridges.
- Clips (all 1920x1080, 24 fps, flat magenta #FF00FF, locked camera, same size/position as the hub):
  1. **Glances (pilot), ~8 s:** hub -> look right, short hold -> swing across to look left, short hold -> back to hub. First and last frame = hub.
  2. **Working loop, ~4 s:** hub -> typing, small natural movements -> hub. First and last frame = hub.
  3. **Greeting, ~10 s:** hub -> looks up at the viewer and smiles -> takes headphones off -> waves -> points down and holds. First frame = hub.
  - Optional later: right look -> smile and left look -> smile bridges, only if going back to the hub before greeting feels slow.
- **Status: waiting for the user's pilot clip (1).** Reference: `.agents/bridge-frames/fresh/hub_working_magenta.png` (untracked folder), used as first and last frame. Pilot prompt given to the user:
  > 3D animated cartoon man with short dark hair, a trimmed beard and green eyes, wearing dark grey over-ear headphones and a navy blue shirt, sitting behind a dark grey Dell laptop, against a perfectly flat, solid pure magenta (#FF00FF) background. He starts typing with his eyes on the laptop. He turns his head and eyes to look toward the right side of the frame and holds briefly, then smoothly turns his head across to look toward the left side of the frame and holds briefly, then turns back to the laptop and continues typing, ending in exactly the same pose as the first frame. Smooth, continuous, natural motion. Locked-off static camera: no zoom, no dolly, no pan. The man stays exactly the same size and in exactly the same position in the frame from the first frame to the last. The background stays a single flat magenta colour in every frame, with no gradient, shadow, texture or lighting on it.
  >
  > Negative: camera movement, zoom, push-in, pull-back, change in character size, background change, shadows on background, gradient, vignette, cuts, blinking during turns, headphones coming off, talking, text, watermark, extra people.
- **When the pilot arrives:** probe with ffprobe, contact sheet, key with `.agents/scripts/magenta_key.py`, then measure: first/last frame vs hub (should be ~identical), size/position drift through the clip (fit on alpha masks; should be none), background flatness. Report and adjust the prompt before the user makes clips 2 and 3.
- **After all three:** cut segments automatically (hub, right peak, left peak by pose matching), keep every other frame (12 fps; check pace per clip, bridge 3 needed every 4th), export full 1374x978 + 800px `sm/`, delete the old frame set, rewrite the player as "segments forward/backward through the hub" (drop `WARPS`, `SEAMLESS`, bridge special cases), keep phones on loop + greeting only, bump `CACHE`, update `check_hero_paths.ts`.

**Other open items**
- **Skills section:** the user rejected the constellation, the skill wheel and the round-2 ideas ([Ideas.md](Ideas.md)) for now and will come back with their own idea. Keep the original bento until then; don't propose skill redesigns unprompted.
- Project and certificate "creative" redesigns from [Ideas.md](Ideas.md): projects pan and certificate wallet are built; nothing else pending.
- "Omni" in the AI tools list was added as the user wrote it (may mean GPT-4o); confirm if it comes up.

## How the user works
- Branch from `dev` for each piece of work, verify, merge back into `dev`. Push only on request.
- Update the `.agents` docs before starting (plan + tasks) and again when done (Memory + handoff).
- Expects the repo skills to be used: ponytail, taste skill (`.agents/skills/design-taste-frontend`), design-md references (`.agents/skills/design-md`), graphify.
- Generates video clips themselves from prompts + reference images Claude prepares; wants references without background and a flat magenta background in the prompt so the result keys out cleanly.

## The site now (on `dev`)
Section by section details: [Architecture.md](Architecture.md).
- **Navbar** (`Navbar.tsx`): floating, brand logo (`src/app/icon.jpg`), section links incl. "Connect", smooth scrolling, hides on scroll down; `BackToTop` above the **WhatsApp** button (`WhatsApp.tsx`: QR + chat button on desktop, direct link on phones; `public/whatsapp-qr.svg` must be regenerated if the phone number changes).
- **Hero** (`Hero.tsx` + `HeroCharacter.tsx` + `heroFrames.ts`): canvas character, see below; greeting glides to `#intro`.
- **Skills** (`BentoGrid.tsx`): original 4-box bento, keys from `portfolio-data.json` `skills` (`mobile`, `ai_ml` + `ai_tools`, `backend` + `databases`, `cloud_tools`); rows grow with content.
- **Experience** (`ExperienceStack.tsx`): sticky stacked cards; the covered card fades out before the next settles.
- **Projects** (`ProjectsList.tsx`): pinned sideways pan on desktop, swipe carousel on phones / reduced motion, progress bar.
- **Certifications** (`Certifications.tsx`): wallet of overlapping cards, one open at a time, eased height + fade.
- **Footer / contact dialog** (`Footer.tsx`): resume, email, phone, WhatsApp; also opened by the navbar's "Get In Touch" (`open-contact` event).

## Hero animation today (to be replaced by the fresh clips)
- `HeroCharacter.tsx` plays frames from `public/hero-frames/` (166 full 1374x978 webp, 7.43 MB) and `sm/` (800px, phones: 104 frames, 2.64 MB) on a canvas at 12 fps. Frames load through Cache Storage (`CACHE` = `hero-frames-v3`, bump when frames change), 6 at a time, retried; a poster `<img>` shows until the first draw.
- `heroFrames.ts`: frame map and paths. 1-14 working, 15-22 left turn, 47-112 greeting, 139-157 bridge 2 (left -> viewer), even 176-222 bridge 3 (working -> smile), 223-257 glance clip (right turn, sweep to left). `WARPS` size-matches cuts; `SEAMLESS` lists joins without crossfade.
- Desktop: cursor zones (left/right third instant, centre after 250 ms dwell), click greets. Phones: no glances, tap greets ("Tap me" hint), no autoplay. Reduced motion: frame 1 only.
- Check paths without a browser: `node --experimental-strip-types .agents/scripts/check_hero_paths.ts`.

## Tools and scripts
- `.agents/scripts/magenta_key.py`: key a clip off flat magenta into the hero crop box (278, 27, 1374x978). Use this for the fresh clips.
- `.agents/scripts/bridge_cutout.py`: older matte for off-white backgrounds (headband-gap and halo handling); only needed for non-magenta footage.
- `.agents/scripts/check_hero_paths.ts`: path check (see above).
- ffmpeg/ffprobe are on PATH; Python has PIL, OpenCV, numpy. `npx tsx` is not installed (it hangs waiting to install); use `node --experimental-strip-types` (Node 22).
- `.agents/bridge-frames/` (untracked): reference stills for all generated clips, incl. `fresh/` (hub) and `glance/`.

## Dev notes
- `npm run dev` (port 3000); `.claude/launch.json` also has `prod-preview` (`next start -p 3005`).
- The in-app preview pane often throttles animation when hidden (requestAnimationFrame drops to 0-2 fps), so live timing checks of the hero are unreliable there; measure frames offline instead.
- Udemy certificate images can 400 from `/_next/image` locally (NAT64 addresses look private to Next 16); fine on Vercel.
- Tailwind v4: `scale-x-*` sets the CSS `scale` property, which multiplies with an inline `transform: scaleX()`; use one or the other.
- Years of experience come from each job's `start`/`end` in `portfolio-data.json` (`resume.ts`, `BANDS`); add both fields to new jobs.
- 2026-10-25 audit: [Audit.md](Audit.md), checklist [Areas-to-Work.md](Areas-to-Work.md) (all done).

## History (condensed)
- 2026-10-25/26: audit fixes, OG metadata, README, Vercel deploy; animated hero character replaces the photo (`cd16f7d`).
- 2026-10-28 (all on `dev`, unpushed):
  - Hero on mobile: Cache Storage loading, retries, poster, tap fixes, replayable greeting; navbar + back-to-top.
  - Polish: brand logo, focus ring, smooth links, Connect link, experience fade, WhatsApp button.
  - Bridge 3 (working -> smile) added, later cut to 2 s and cleaned (outline, headband gaps).
  - Skills: constellation -> skill wheel -> rejected; original bento restored. Project pan and certificate wallet kept; wallet motion smoothed; project progress bar fixed. AI tools, Vercel, Supabase, Redis added.
  - Phones load only loop + bridge 3 + greeting. Magenta glance clip (223-257) replaced bridge 1 and the old take; greeting paths fixed (no bridge 3 from the right, no double smile from the left); paths moved to `heroFrames.ts` with a check script.
  - A size-jump fix by baking corrections into frames was abandoned and reverted; the user chose the fresh-clip rebuild instead.
