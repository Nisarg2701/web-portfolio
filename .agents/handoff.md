# Handoff

Read this first in a new chat. Last updated 2026-10-28.

## Start here

**Contact dialog (2026-10-29, `feat/resume-viewer`, merged into `dev`, not pushed)**: resume shown as an image rendered from the PDF (`.agents/scripts/render_resume.py`, re-run when the PDF changes); Connect panel compacted to fit without scrolling.

**Reduced motion (2026-10-29, `fix/reduced-motion-stills`, merged into `dev`, not pushed)**: experience cards no longer stack (sticky only under `motion-safe`); hero still is the pointing frame with its caption. Checked in Firefox with reduced motion on.

**Git state**
- Work happens on local `dev`. It is **well ahead of `origin/dev` and `origin/main`, and nothing from 2026-10-28 is pushed or live.** Production (https://nisarg-pakhawala-portfolio.vercel.app) still runs `5c63012`.
- Pushing `dev` makes a Vercel preview; pushing/merging to `main` deploys production. Only push when the user asks.
- The merged feature branches from 2026-10-28 still exist locally (`feat/*`, `fix/*`); they are all merged into `dev` and can be deleted.

**Hero rebuilt from the 5 clips with a shortest-path player (2026-10-28, branch `feat/hero-graph-rebuild`, merged into `dev`).**
- The bug the user saw (on a fresh load, returning to work after a glance played "typing too fast, then the headphone lift"): the old player caught up by up to 6 frames per draw whenever the main thread was busy, which it always is on a fresh load while frames download and decode; with hand-written paths, that skipping also read as junk motion. Fixed by design: the player now shows exactly one frame per 1/24 s and slows down instead of skipping; frames are decoded (`img.decode()`) before they count as loaded.
- All old frames deleted; new set built from the user's 5 clips (copies in `.agents/bridge-frames/fresh/`: `clip_loop.mp4` and `clip_glances.mp4` are now the originals, plus `clip_greeting.mp4`, `clip_bridge_a.mp4` right, `clip_bridge_b.mp4` left). Offline render of a scripted session through the real table: `.agents/bridge-frames/fresh/hero_session_preview.mp4`.
- **Needs the user's check on a real screen** (the preview pane runs rAF at ~1 fps). Not pushed.

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
- `build_hero_frames.py` keys all 5 clips, measures every frame against every other (128px premultiplied copies; same pose in two clips differs by ~0.5) and allows a cut between clips only where the two frames differ no more than max(1.2, the motion around them). Nodes are (frame, direction): only the glance clip plays backwards, and only turns around on still frames (the holds). A Dijkstra search per goal (work, right, left, greet) gives every node its next node on the quickest seamless way there: `src/components/heroGraph.json` (17 KB). Only frames some path can show are exported: 576 frames, 1280x911 desktop (22 MB; canvas is shown at most 640 CSS px wide) + 800px `sm/` holding only the 318 frames small screens can reach (6.7 MB). The path check fails if any frame is deployed that nothing shows. WebP q78, lossy alpha 60, method 6.
- `heroFrames.ts` wraps the table (`step(node, goal)`, `arrive`); `HeroCharacter.tsx` follows it. `VERSION` = 9 (in the URLs and the Cache Storage name; bump on any frame change). Frames 1-94 are the working loop (`LOOP`).
- Reactions start at once from wherever he is: from the hub, right look 5.3 s round trip (hold ~2.6 s), left 4.1 s (hold ~2.6 s), greeting reaches the look-up in ~1 s via measured cuts loop -> glance typing -> greeting. Side to side sweeps across directly; greeting from a side goes through that side's bridge (right: bridge 7 -> 68, into greeting 33; left: 11 -> 64, into greeting 46).
- Desktop: cursor zones (left/right third, one reaction per entry into a zone; centre after 250 ms dwell), click reacts again. Phones: tap greets, no glances. After greeting he holds the point until scrolled away, then cuts back to frame 1 at work. Reduced motion: frame 1 only.
- Rebuild: `python .agents/scripts/build_hero_frames.py LOOP GREETING GLANCES BRIDGE_RIGHT BRIDGE_LEFT --keep <dir>` (`--dry` reports paths and cuts without writing; `--keep` caches keying + measuring, so re-runs take ~80 s instead of ~5 min). Tunables at the top: `RIGHT`/`LEFT` hold targets, `LOOK`, `GREET_IN`, `JOIN`, `STILL`. Then bump `VERSION` and run `node --experimental-strip-types .agents/scripts/check_hero_paths.ts` (files exist, goals reached, 2000 random sessions never stuck or repeat a frame).
- No GPU libraries in this Python (no CUDA torch/cupy); the build uses all CPU threads instead.

## Tools and scripts
- `.agents/scripts/magenta_key.py`: key a clip off flat magenta into the hero crop box (208, 0, 1518x1080). `.agents/scripts/build_hero_frames.py` builds frames + playback table from the 5 clips (see Hero animation today).
- `.agents/scripts/check_hero_paths.ts`: playback table check (see above).
- ffmpeg/ffprobe are on PATH; Python has PIL, OpenCV, numpy. `npx tsx` is not installed (it hangs waiting to install); use `node --experimental-strip-types` (Node 22).
- `.agents/bridge-frames/fresh/` (untracked): the 5 source clips, the hub/side reference stills and the session preview. Older reference images were deleted in the 2026-10-28 cleanup.

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
