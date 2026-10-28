# Handoff Document

## Current State
The portfolio has reached the requested "Awwwards/Premium" level. The UI relies heavily on Next.js App Router, Tailwind CSS v4, and GSAP ScrollTrigger. The repository has been published and pushed to the `main` branch.

## Recent Achievements
- Built the **Hero Section** with a split cinematic layout featuring the user's profile picture and an emerald gradient glow (being replaced by an animated character, see "In progress").
- Overhauled the **Projects Section** to use alternating glassmorphic floating cards overlaid on massive `aspect-video` project images.
- Overhauled the **Certifications Section** to use a vertical stacked bento-box layout (text on left, image frame on right).
- Fixed the **Experience Section** GSAP stacking behavior so background cards safely vanish beneath the opaque wrapper.
- Implemented a wide **Resume Modal** containing a clean PDF `<object>` viewer with no browser toolbars, plus dedicated tactile buttons for Download, Email, and Call.
- Cleared out unused `public/` and `src/components/ui/` boilerplates.

## Outstanding Work (If any)
- The user may want to tweak content inside `data/portfolio-data.json`.
- The site is live on Vercel (see "Deployment" below).
- The `portfolio-data.json` is secure from direct URL access, but could be further abstracted if a headless CMS is desired later.

## Quick Start
```bash
npm install
npm run dev
```

## Audit (2026-10-25)
- Full findings: [Audit.md](Audit.md)
- Open action list: [Areas-to-Work.md](Areas-to-Work.md). Check it before starting new work.
- 2026-10-26: every audit item is done and live (see Areas-to-Work.md for commits). The hero "View Selected Work" button was removed at the user's request.
- Local dev note: the remote Udemy cert images return 400 from `/_next/image` on this machine because the network resolves S3 to NAT64 (`64:ff9b::`) addresses, which Next 16 treats as private. They load fine on Vercel (verified 2026-10-26), so this is local only.
- `.claude/launch.json` has a `prod-preview` config (`next start -p 3005`) for testing a production build while another dev server runs.
- Experience entries now carry `start`/`end` ("YYYY-MM"); `resume.ts` derives "N+ years" from them for the Hero and summary. A job counts end − start months (Jun→Jul = 1); overlapping months count once. Labels by leftover months: 0 "x", 1–2 "x+", 3–5 "~x.5", 6 "x.5", 7–8 "x.5+", 9–11 "~x+1" (`BANDS` in `resume.ts`). Current total: 35 months, shown as "~3 years". Add both fields to any new job.

## Animated hero (commit `cd16f7d`, live since 2026-10-26)
- **Animated hero character** replaces the profile photo: `src/components/HeroCharacter.tsx` plays a canvas frame sequence from `public/hero-frames/` (222 webp frames, including three generated bridge clips; 800px phone copies in `sm/`). It reacts to the cursor, glances left/right, greets, then glides to a new `#intro` section. Reduced motion is handled.
- `src/components/Hero.tsx` was split: a greeting ("Hey there! I'm Nisarg…") plus the character, then the headline moved into `#intro`.
- `cd16f7d` also contains the C1–C7 content fixes (data file, `resume.ts` years calculation, CTA removal), because they were in the shared working tree when it was committed.
- `.agents/bridge-frames/` (untracked) holds the reference PNGs used to generate the bridge clips.
- `public/images/profile.jpg` is no longer referenced anywhere (kept on purpose).
- 2026-10-28 hero fixes (Areas-to-Work.md section 6): phones use `public/hero-frames/sm/` (800px copies, regenerate them whenever the full frames change and bump `CACHE` in `HeroCharacter.tsx`); frames go through Cache Storage with retries; no autoplay on touch ("Tap me" hint); every greeting glides to `#intro`; 250ms center dwell on desktop.

## Navigation (2026-10-28)
- `src/components/Navbar.tsx`: fixed top navbar (hide on scroll down, show on scroll up, mobile menu, "Get In Touch" opens the contact dialog) and `BackToTop`. Section ids: `skills`, `experience`, `projects`, `certifications`, `background`, `contact`.

## Deployment
- Vercel project `portfolio-app` (team "nisarg2701's projects") is linked to `Nisarg2701/web-portfolio`. Pushes to `main` deploy to production at https://nisarg-pakhawala-portfolio.vercel.app; pushes to `dev` create preview deployments.

## Polish round 2 (2026-10-28, merged into `dev`)
Branch `feat/nav-experience-whatsapp`. Plan: Implementation-Plan.md Step 6; checklist: Tasks.md Phase 5 (all done except T2).
- Navbar: real logo (`src/app/icon.jpg`), "Connect" link to `#contact`, smooth scrolling links, Motion `useScroll` instead of window scroll listeners. Sitewide emerald `:focus-visible` ring in `globals.css` (the white box around the logo was the browser's default focus outline).
- Experience: the covered card's opacity now fades between the next card's `top 85%` and `top 35%` (scale still runs the full approach).
- WhatsApp: `src/components/WhatsApp.tsx` + `public/whatsapp-qr.svg`. The QR was generated once with Python `qrcode` (installed only in a scratch folder, not a project dependency). **If the phone number changes, regenerate the QR** (any QR generator, content `https://wa.me/<digits only>`, black on transparent SVG).
- Ideas for Skills / Projects / Certifications: `.agents/Ideas.md` (not built).

### Hero bridge 3 (done 2026-10-28, branch `feat/hero-bridge-3`)
- Source: user-generated 1920x1080 clip, 24 fps, 3.96 s (95 frames). Every other video frame -> 48 frames (175-222); the user found 4 s too slow, so only the even ones (176, 178 ... 222) are kept and played: 24 frames, 2 s at 12 fps (+ `sm/` copies). The odd frames were deleted (in git history at `482c640` if the 4 s version is wanted back).
- Plays in `greeting()` whenever he isn't already turned toward a side (from working, or tapped again after a greeting), replacing the old blink cut 14 -> 30 -> 47. Its first frame matches 14 and its last matches 47 to within ~1px, so no `WARPS` entry; `222>47` is in `SEAMLESS`. The now-unused blink warps were removed.
- Cut-out pipeline: `.agents/scripts/bridge_cutout.py` (the scripts behind the original 174 frames weren't kept). It crops the shared box (278, 27, 1374x978), keys out the off-white background and fills only small holes, so gaps such as inside the headband stay transparent. Usage is in its docstring.
- Reference stills and prompt used: `.agents/bridge-frames/bridge3_*` (untracked, like the others).
- The first cut had a light grey outline (the generator's sharpening halo, plus edge pixels made too opaque). `bridge_cutout.py` now takes edge alpha from the colour of the solid interior next to them and drops halo pixels; outline rim pixels went from ~800 to under 45 per frame (shipped frames: ~63). `CACHE` bumped to `hero-frames-v2` so browsers drop the old versions.

## Creative sections (2026-10-28, merged into `dev`)
Branch `feat/creative-sections`. Plan: Implementation-Plan.md Step 7; checklist: Tasks.md Phase 6 (done). Details per component: Architecture.md (components 3, 4, 6).
- `BentoGrid.tsx` was replaced by `SkillConstellation.tsx` (later `SkillWheel.tsx`); `ProjectsList.tsx` and `Certifications.tsx` were rewritten in place. Section ids are unchanged.
- **Skill links are derived, not invented.** `src/data/skillGraph.ts` matches skill names (whole word, parentheses ignored, e.g. "Firebase (Firestore)" also matches "Firebase") in each job's role + details, project tech + description, certificate name + description. Today only 14 of 37 skills are named anywhere, so 23 (Java, Retrofit, LangChain, Git, SQL, ...) show as dim "toolkit" skills with no "Used in" list. **To connect them, add `"stack": ["Retrofit", "Coroutines & Flow", ...]` to the relevant job or project in `data/portfolio-data.json`** (use the exact skill names from `skills`).
- Hub link: `focusSkill(name)` / the `focus-skill` window event selects a skill on the map and scrolls to it; project and certificate chips use it.
- Not verified here: the reduced-motion paths (the test browser can't emulate the setting); they're the code paths noted in Architecture.md.
- Bridge 3 on this branch too: holes ringed by hair/headphones stay transparent (fixed the white patches); frame cache `hero-frames-v3`.

## Feedback round on creative sections (2026-10-28)
Checklist: Tasks.md Phase 7.
- Wallet (`fix/wallet-motion`, merged into `dev`): the "wacky" motion was spring `layout` animations on every card plus the title changing size on open. Now one eased height + fade tween; title size fixed. Measured: closing and opening cards move together, no overshoot, settled in ~0.35 s.
- Constellation -> **skill wheel** (`feat/skill-wheel`, merged into `dev`): `SkillConstellation.tsx` renamed to `SkillWheel.tsx`. Categories and skills come from `portfolio-data.json` (`RESUME_DATA.skills` is now the raw `Record<string, string[]>`), so a new category key or skill shows up with no code change. Slice order = key order in the JSON (currently Data, Backend, Cloud & Tools, AI & ML, Mobile).
- Projects progress bar: Tailwind v4's `scale-x-*` sets the CSS `scale` property, which multiplied with the inline `transform: scaleX()` and capped the bar at 4%. Now inline transform only. Verified 4% -> 50% -> 100% across the pinned scroll.
- Skills added (`feat/add-skills`, merged into `dev`): new `ai_tools` category (title "AI Tools" in `TITLES`), Vercel + Supabase in cloud_tools, Redis in databases. 47 skills; ChatGPT auto-links to the ML + ChatGPT certificate.
- Still open: most skills have no "Used in" links until `stack` fields are added (offered to draft them). The wheel's look is not accepted yet: alternatives in Ideas.md "Skills, round 2", waiting on the user.

## Hero weight, glance lag, bento back (2026-10-28, merged into `dev`)
Branch `fix/hero-weight-bento`. Checklist: Tasks.md Phase 8 (H5 open).
- **Skills:** the user rejected the constellation, the wheel and the round-2 ideas for now and will come back with an idea. The original `BentoGrid` is restored (keys adapted; AI tools live in the AI box; rows grow instead of clipping). `SkillWheel.tsx`, `skillGraph.ts`, the `focus-skill` jump chips and the `stack` field were removed (all in git history: wheel at `8ae97d5`).
- **Phones:** no glances. Any tap greets; only working loop + bridge 3 + greeting are downloaded: 107 small frames, 2.70 MB (was 4.64 MB). Narrow desktop windows behave the same (hover glances off). Verified on a fresh cache.
- Frames 113-120 deleted (nothing played them). Desktop downloads 190 frames, 8.69 MB.
- **Glance lag (measured):** the right turn spends ~1.9 s reaching its peak (bridge 1 starts slowly and nearly stops mid-way; the left turn takes 0.67 s), and right -> left ends with ~0.5 s of near-still frames (the original blink section played backwards). Fix: a new clip, working -> right -> left, generated by the user.

### Open: glance clip (needs the user's generated clip)
- References in `.agents/bridge-frames/glance/` (untracked): `start_working_f014_*` and `end_left_f022_*`, each as `_transparent.png` and `_magenta.png` (full 1920x1080, background removed with `bridge_cutout.py`). Use the magenta ones in the generator (most tools flatten transparency to black or white).
- Magenta (#FF00FF) as the key colour: nothing on him is magenta (green eyes rule out green-screen, the navy shirt rules out blue).
- Prompt (first/last-frame video model, 1920x1080, 16:9, ~4 s):
  > 3D animated cartoon man with short dark hair, a trimmed beard and green eyes, wearing dark grey over-ear headphones and a navy blue shirt, sitting behind a dark grey Dell laptop, against a perfectly flat, solid pure magenta (#FF00FF) background. He starts typing and looking down at the laptop. He then turns his head and eyes to look toward the right side of the frame, holds for a moment, then smoothly turns his head across to look toward the left side of the frame, ending with wide curious eyes looking left. Continuous smooth motion, no pauses mid-turn. Static locked-off camera, same framing and lighting throughout, no cuts. The background must stay a single flat magenta colour in every frame: no gradient, no shadow, no texture, no lighting on it.
  > Negative: background change, shadows on background, gradient, vignette, camera movement, zoom, pan, cuts, blinking during the turn, headphones coming off, talking, text, watermark, extra people.
- Integration (Claude): magenta key out (new keyer, simpler and cleaner than the wall matte), crop to the shared box, every other frame to 12 fps (check pace like bridge 3), split at the right peak into "working -> right" and "right -> left", replace bridge 1 and the reversed take, drop the frames that become unused (likely 23-43 and 121-138), bump `CACHE`.
