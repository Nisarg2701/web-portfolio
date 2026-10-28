# Architecture

## Overview
A Next.js App Router static portfolio built with React, Tailwind v4, and GSAP. 

## Data Layer
- Source of Truth: `src/data/portfolio-data.json`
- Components: `src/components/layout/` (Navbar, Footer, WhatsApp), `src/components/sections/` (BentoGrid, ExperienceStack, ProjectsList, Certifications, EducationAndLeadership), `src/components/hero/` (Hero, HeroCharacter, heroFrames.ts, heroGraph.json)
- Ingestion: `src/data/resume.ts` imports the JSON directly.
- Most sections are client components (GSAP / motion), so the resume data they import is included in the client bundle. Only `BentoGrid` and the page shell render on the server. The data is public, so this is not a security concern.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`)
- Animation: GSAP (ScrollTrigger) & Framer Motion
- UI Icons: Phosphor Icons
- Deployment: Vercel / GitHub Pages (Static Export compatible)

## Component Map
0. **Navbar** (`Navbar.tsx`): floating glass bar fixed to the top with section links (`#skills`, `#experience`, `#projects`, `#certifications`, `#background`, `#contact` as "Connect"), active-section highlight, a mobile menu, and a "Get In Touch" button that opens the footer's contact dialog via the `open-contact` window event. Hides while scrolling down past the hero, returns on any scroll up. Links glide to their section (`scrollIntoView`, instant under reduced motion); scroll state comes from Motion `useScroll`, not window listeners. The logo is `src/app/icon.jpg`. The same file exports `BackToTop`, a floating button shown after one screen of scrolling, stacked above the WhatsApp button. `html { scroll-padding-top }` in `globals.css` keeps anchor jumps clear of the bar.
1. **Hero**: greeting + animated canvas character (`HeroCharacter.tsx`, frames in `public/hero-frames/`, 800px phone copies in `public/hero-frames/sm/`), then the `#intro` headline it points down to.
2. **ExperienceStack**: `sticky` stacking card sequence with GSAP vanishing opacity to emulate a real deck of cards.
3. **ProjectsList** (`#projects`): horizontal pan. Desktop with motion allowed: GSAP pins the section and scrubs the slide track sideways, with a progress bar. Phones / reduced motion: native scroll-snap swipe carousel.
4. **Certifications** (`#certifications`): credential wallet. Overlapping tinted cards, one open at a time (accordion, `aria-expanded`), an eased height + fade tween (0.45 s open / 0.35 s close, no springs or layout animation; instant under reduced motion); open card shows the certificate image, description and a Verify link.
5. **EducationAndLeadership**: Massive 3-card bento layout utilizing Phosphor duotone icons.
6. **BentoGrid** (`#skills`, server component): the original 4-box bento (Mobile & Edge; AI & GenAI Systems = `ai_ml` + `ai_tools`; Backend & Data = `backend` + `databases`; Infrastructure = `cloud_tools`). Reads `RESUME_DATA.skills` by key, so new skills in those lists appear automatically; a brand-new category key needs a box. Rows are at least 300px and grow with content.
7. **Footer** (`#contact`): CTA button triggering an `AnimatePresence` modal containing a no-toolbar PDF object viewer and contact actions.
