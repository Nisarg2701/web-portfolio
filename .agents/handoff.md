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

## Deployment
- Vercel project `portfolio-app` (team "nisarg2701's projects") is linked to `Nisarg2701/web-portfolio`. Pushes to `main` deploy to production at https://nisarg-pakhawala-portfolio.vercel.app; pushes to `dev` create preview deployments.
