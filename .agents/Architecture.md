# Architecture

## Overview
A Next.js App Router static portfolio built with React, Tailwind v4, and GSAP. 

## Data Layer
- Source of Truth: `data/portfolio-data.json`
- Ingestion: `src/data/resume.ts` imports the JSON directly.
- Next.js Server Components securely handle the data ingestion, abstracting the raw JSON from the client-side bundle.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`)
- Animation: GSAP (ScrollTrigger) & Framer Motion
- UI Icons: Phosphor Icons
- Deployment: Vercel / GitHub Pages (Static Export compatible)

## Component Map
1. **Hero**: Split layout with cinematic profile photo and emerald styling.
2. **ExperienceStack**: `sticky` stacking card sequence with GSAP vanishing opacity to emulate a real deck of cards.
3. **ProjectsList**: Alternating floating glassmorphic panels overlaid on large project images.
4. **Certifications**: Vertical stacked bento list with isolated text/image regions.
5. **EducationAndLeadership**: Massive 3-card bento layout utilizing Phosphor duotone icons.
6. **BentoGrid**: Dense 4-box layout specifically handling 38 technical skills.
7. **Footer**: Floating fixed CTA triggering an `AnimatePresence` modal containing a no-toolbar PDF object viewer and contact actions.
