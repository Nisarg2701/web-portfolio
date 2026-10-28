# Handoff

Read this first in a new chat. Last updated 2026-10-28.

## Start here

**Git state**
- Work happens on local `dev`. It is **well ahead of `origin/dev` and `origin/main`, and nothing from 2026-10-28 is pushed or live.** Production (https://nisarg-pakhawala-portfolio.vercel.app) still runs `5c63012`.
- Pushing `dev` makes a Vercel preview; pushing/merging to `main` deploys production. Only push when the user asks.
- The merged feature branches from 2026-10-28 still exist locally (`feat/*`, `fix/*`); they are all merged into `dev` and can be deleted.

**NEXT TASK (from the user, 2026-10-28): rebuild the hero frames from scratch, optimized.**
- **Bug the user sees:** on a freshly loaded site, a junk animation plays whenever he goes back to work: he types too fast and starts removing his headphones. It happens every time he returns to working (after a glance). The user's read: the frames aren't properly optimized.
- **What the user wants:** remove ALL the old frames (`public/hero-frames/` and `sm/`) and rebuild from the 5 clips, used "in the most optimal way possible". The user is giving the 5 videos again (loop, greeting, glances, bridge right, bridge left); use those. The copies in `.agents/bridge-frames/fresh/` are `clip_loop.mp4`, `clip_greeting.mp4` (original), `clip_glances.mp4`, `clip_bridge_a.mp4` (right), `clip_bridge_b.mp4` (left); note loop and glances there are re-encodes (crf 8) of extracted frames, since the originals were deleted, so prefer the user's fresh copies.
- **Constraints the user already settled (don't relitigate):** natural speed (every frame at 24 fps; 1.5x and 2x were rejected), no crossfades, no repeated/bounced frames, joins only at measured matching frames, side looks hold ~2-3 s (their guide `Downloads/Sri_Tech_Interactive_Portfolio_Hero_Guide.pdf`), prompts format in Memory.md.
- **Not yet diagnosed.** Leads to check first (unverified): (1) a stale or mixed frame set in the browser (Cache Storage / HTTP cache under `?v=`; frame numbers changed 4 times today, so if any old frame survives under a reused URL, frame N can be a greeting frame from an older layout = "removing headphones"); reproduce in a clean profile and in one that visited earlier builds; (2) the player's catch-up stepping (`tick` advances up to 6 frames per rAF when late, `failed` frames are skipped), which looks like "too fast" while frames are still loading on a fresh visit; (3) what plays right after a glance ends (`setMode("idle")`, `i = 0`) and whether `list`/`i` can point into the greeting. Also worth weighing for "optimal": 621 frames is 32 MB desktop / 9.6 MB phones; consider fewer stored frames per hold, smaller desktop frames, or a video-with-alpha approach, but keep 24 fps natural motion.
- Rebuild tool: `python .agents/scripts/build_hero_frames.py LOOP GREETING GLANCES BRIDGE_RIGHT BRIDGE_LEFT` (keys, crops, deletes old frames, writes full + `sm/`); then update `heroFrames.ts` constants, bump `VERSION` in `HeroCharacter.tsx`, run `node --experimental-strip-types .agents/scripts/check_hero_paths.ts`. The in-app preview pane throttles rAF to ~1 fps, so verify motion offline (render paths to video, as `hero_paths_preview.mp4` was) and ask the user to check on a real screen.

**Fresh hero clips: built and merged into `dev` (2026-10-28).** Sources and tools as above. `hero_paths_preview.mp4` in `.agents/bridge-frames/fresh/` renders the real paths offline. History of the task below.

**Fresh hero clips (history)** (plan: [Implementation-Plan.md](Implementation-Plan.md) Step 9, checklist: [Tasks.md](Tasks.md) Phase 9)
- Why: the current hero is stitched from one original take, three generated bridges and a glance clip, each framed slightly differently. Joins need size-matching (visible as "bigger, then suddenly smaller") and the path code is full of special cases. The user decided to regenerate everything on magenta and rebuild. **Don't patch the old frame set further.**
- Principle: one **hub** frame (working, eyes on the laptop) that every clip starts on (loop and glances also end on it), so every join is between identical frames: no size matching, no crossfades, no bridges.
- Clips (all 1920x1080, 24 fps, flat magenta #FF00FF, locked camera, same size/position as the hub):
  1. **Glances (pilot), ~8 s:** hub -> look right, short hold -> swing across to look left, short hold -> back to hub. First and last frame = hub.
  2. **Working loop, ~4 s:** hub -> typing, small natural movements -> hub. First and last frame = hub.
  3. **Greeting, ~10 s:** hub -> looks up at the viewer and smiles -> takes headphones off -> waves -> points down and holds. First frame = hub.
  - Optional later: right look -> smile and left look -> smile bridges, only if going back to the hub before greeting feels slow.
- **Status: pilot (1) received and passed** (`Downloads/Animated_man_typing_on_laptop_d1667496_1080p.mp4`, 8 s, 192 frames). Figure-outline overlap vs hub 99.6%, first vs last frame mean diff 2.1, laptop scale within 0.3% and shift <= 3 px over the clip (camera effectively locked), background flat (249, 16, 241) +/- 3, `magenta_key.py` keys it cleanly. Right look ~frames 40-80, left look ~96-136; blinks mid-swing at ~88 and ~144 (minor). Sparkle watermark at x 1706-1773, y 866-933 is outside the crop box. **Loop (2) received and passed** (`Downloads/Animated_man_typing_on_laptop_679f7e0c_1080p.mp4`, 3.96 s, 95 frames): laptop scale within 0.1%, shift <= 2 px, head centroid steady within 3 px; keyed seam 95 -> 1 is 1.29 vs a median 12 fps step of 1.43 (seamless); keyed frame 1 vs hub 1.68. Eyes lift and widen briefly around frames 60-75 (reads as a quick glance up); acceptable, regenerate only if it looks like he stares at the viewer every loop. **Greeting (3) take 1 rejected** (`Downloads/Man_typing_and_waving_at_f8ab1602_1080p.mp4`, 9.96 s, 239 frames): camera locked and start = hub, wave is good, but the headband sweeps down through his face (~frames 102-108), his elbows/headband leave the crop box during the lift (figure x 218-1667, top y 0 vs box x 278-1652, y 27), and the ending rests a hand on the laptop lid instead of pointing down. User keeps both headphone removal and pointing down; take 2 prompt slides the headphones back over the head (band behind the head, never in front of the face), elbows tucked, timed beats, point down beside the laptop.
  **Greeting take 2 good** (`Downloads/Man_removing_headphones_and_smiling_7a4ee9e3_1080p.mp4`, 9.96 s, 239 frames, Omni 1.1 Flash): band goes behind the head, never crosses the face; clear point down, steady hold; camera locked (laptop scale within 0.3%); frame 1 matches hub (outline overlap 99.6%). Only issue: the figure leaves the old crop box (278, 27, 1374x978): elbows out to x 208-1725 during the lift (frames 59-118), headband to y 0 (frames 77-88), pointing elbow at x 228 for the whole final hold. Fix proposed: since every frame is being replaced, widen the box for all three clips to (207, 0, 1518, 1080), same 1.405 aspect, character renders ~10% smaller (compensate with a wider canvas container if needed). Reference: `.agents/bridge-frames/fresh/hub_working_magenta.png` (untracked folder), used as first and last frame. Pilot prompt given to the user:
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

## Hero animation today
- `HeroCharacter.tsx` plays frames from `public/hero-frames/` (621 full 1374x978 webp, 32 MB; every source frame) and `sm/` (800px; phones load only loop + greeting: 332 frames, 9.6 MB) on a canvas at **24 fps, the clips' own speed** (the user tried 2x and 1.5x and settled on natural speed, no skipped or repeated frames). Frames load through Cache Storage (`VERSION` = 8 in `HeroCharacter.tsx`: it is in the frame URLs as `?v=` and in the Cache Storage name; bump it whenever frames change, because `next.config.ts` lets browsers HTTP-cache frames for a week), 6 at a time, retried; a poster `<img>` shows until the first draw. Crop box (208, 0, 1518, 1080) of the 1080p clips, scaled to 1374x978; the headband touches the top edge for ~0.5 s of the greeting (the source is clipped there).
- `heroFrames.ts`: 1-94 working loop (1 = hub), 95-332 greeting (wave ~216, point ~288; `DONE` holds the last frame), 333-522 glance clip as one hub-to-hub line (right hold ends at `RT` 414, left glance turns at `LT` 446), 523-559 bridge right look -> viewer, 560-621 bridge left look -> viewer (`clip_bridge_a.mp4` / `clip_bridge_b.mp4`, cut at their measured hand-over frames 37 and 62). **No crossfades and no repeated or bounced frames** (the user rejected both; the path check fails on either): moves between clips only at measured matches (loop exits 1.4-1.7, glance -> bridge ~1.5, bridge -> greeting ~2.2; typical steps 0.8 on the loop, 2.4 in the greeting). Mid-loop he types on to the nearest hub-like loop frame (`HUB`: 1-11, 64-70, 90-94). Side looks hold ~1.9-2.2 s, the clips' own holds there and back (the user's guide, `Downloads/Sri_Tech_Interactive_Portfolio_Hero_Guide.pdf`, asks 2-3 s). Greeting from a side: that side's bridge turns him to the viewer. After greeting he holds the point and ignores the zones (every other clip has headphones on) until scrolled away.
- Desktop: cursor zones (left/right third instant, centre after 250 ms dwell), click greets. Phones: no glances, tap greets ("Tap me" hint), no autoplay. Reduced motion: frame 1 only.
- Check paths without a browser: `node --experimental-strip-types .agents/scripts/check_hero_paths.ts`.

## Tools and scripts
- `.agents/scripts/magenta_key.py`: key a clip off flat magenta into the hero crop box (208, 0, 1518x1080). `.agents/scripts/build_hero_frames.py` keys the three clips and writes the whole frame set.
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
