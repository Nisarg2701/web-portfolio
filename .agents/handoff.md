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
- **Animated hero character** replaces the profile photo: `src/components/HeroCharacter.tsx` plays a canvas frame sequence from `public/hero-frames/` (174 webp frames, ~8 MB, including two generated bridge clips). It reacts to the cursor, glances left/right, greets, then glides to a new `#intro` section. Reduced motion is handled.
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

### Open: hero bridge 3 (needs the user's generated clip)
Hovering straight onto the middle while he works cuts from frame 14 to 47 behind a blink (`greeting()` last branch in `HeroCharacter.tsx`). Bridge 3 replaces that blink.
- Start frame: `.agents/bridge-frames/bridge3_start_working_f014.png` (working, eyes on the laptop). End frame: `.agents/bridge-frames/bridge3_end_greeting_f047.png` (smiling at the viewer).
- Generate with a first/last-frame video model (same tool as bridges 1 and 2), ~2 s, 16:9, 1920x1080. Prompt:
  > 3D animated cartoon man with short dark hair, a trimmed beard and green eyes, wearing dark grey over-ear headphones and a navy blue shirt, sitting behind a dark grey Dell laptop in front of a plain off-white wall. He is typing and looking down at the laptop screen with a calm, focused expression. He notices someone, stops typing, and slowly raises his head and eyes to look straight into the camera, his eyes opening a little wider as he breaks into a warm, friendly closed-mouth smile. He ends looking directly at the camera, smiling gently, hands resting on the keyboard. Static locked-off camera, same framing and lighting throughout, no cuts, smooth natural motion.
  > Negative: camera movement, zoom, pan, headphones coming off, waving, talking, open mouth, text, watermark, extra people, background change.
- Integration (Claude): cut the clip to 12 fps, remove the background and crop it to the shared box like the other frames (also an `sm/` copy), store as frames 175+, play it in `greeting()` instead of `[BLINK, BLINK, BLINK]`, add size-match `WARPS` for 14>175 and end>47, and bump `CACHE` to `hero-frames-v2`.
