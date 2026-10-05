# Handoff Document

## Current State
The portfolio has reached the requested "Awwwards/Premium" level. The UI relies heavily on Next.js App Router, Tailwind CSS v4, and GSAP ScrollTrigger. The repository has been published and pushed to the `main` branch.

## Recent Achievements
- Built the **Hero Section** with a split cinematic layout featuring the user's profile picture and an emerald gradient glow.
- Overhauled the **Projects Section** to use alternating glassmorphic floating cards overlaid on massive `aspect-video` project images.
- Overhauled the **Certifications Section** to use a vertical stacked bento-box layout (text on left, image frame on right).
- Fixed the **Experience Section** GSAP stacking behavior so background cards safely vanish beneath the opaque wrapper.
- Implemented a wide **Resume Modal** containing a clean PDF `<object>` viewer with no browser toolbars, plus dedicated tactile buttons for Download, Email, and Call.
- Cleared out unused `public/` and `src/components/ui/` boilerplates.

## Outstanding Work (If any)
- The user may want to tweak content inside `data/portfolio-data.json`.
- The live deployment on Vercel/GitHub Pages has not been initialized (only the code is on GitHub).
- The `portfolio-data.json` is secure from direct URL access, but could be further abstracted if a headless CMS is desired later.

## Quick Start
```bash
npm install
npm run dev
```
