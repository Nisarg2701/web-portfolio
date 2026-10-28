# Architecture

## Overview
A Next.js App Router static portfolio built with React, Tailwind v4, and GSAP. 

## Data Layer
- Source of Truth: `data/portfolio-data.json`
- Ingestion: `src/data/resume.ts` imports the JSON directly.
- Most sections are client components (GSAP / motion), so the resume data they import is included in the client bundle. Only `BentoGrid` and the page shell render on the server. The data is public, so this is not a security concern.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`)
- Animation: GSAP (ScrollTrigger) & Framer Motion
- UI Icons: Phosphor Icons
- Deployment: Vercel / GitHub Pages (Static Export compatible)

## Component Map
0. **Navbar** (`Navbar.tsx`): floating glass bar fixed to the top with section links (`#skills`, `#experience`, `#projects`, `#certifications`, `#background`), active-section highlight, a mobile menu, and a "Get In Touch" button that opens the footer's contact dialog via the `open-contact` window event. Hides while scrolling down past the hero, returns on any scroll up. The same file exports `BackToTop`, a floating button shown after one screen of scrolling. `html { scroll-padding-top }` in `globals.css` keeps anchor jumps clear of the bar.
1. **Hero**: greeting + animated canvas character (`HeroCharacter.tsx`, frames in `public/hero-frames/`, 800px phone copies in `public/hero-frames/sm/`), then the `#intro` headline it points down to.
2. **ExperienceStack**: `sticky` stacking card sequence with GSAP vanishing opacity to emulate a real deck of cards.
3. **ProjectsList**: Alternating floating glassmorphic panels overlaid on large project images.
4. **Certifications**: Vertical stacked bento list with isolated text/image regions.
5. **EducationAndLeadership**: Massive 3-card bento layout utilizing Phosphor duotone icons.
6. **BentoGrid**: Dense 4-box layout specifically handling 38 technical skills.
7. **Footer** (`#contact`): CTA button triggering an `AnimatePresence` modal containing a no-toolbar PDF object viewer and contact actions.
