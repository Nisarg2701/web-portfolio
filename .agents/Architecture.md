# App Flow & Architecture

## App Flow
The application is a single-page scrolling experience structured around the AIDA framework:
1. **Attention (Hero):** Cinematic, wide layout introducing the user and providing immediate contact CTAs.
2. **Interest (Skills/About):** High-density, mathematically perfect CSS bento grid.
3. **Desire (Experience/Projects):** GSAP pinned sections and rich interactive hover physics.
4. **Action (Footer):** Massive, high-contrast CTA and clean links.

## File and Folder Structure (Next.js)
```text
web-portfolio/
├── app/                  # Next.js App Router (page.tsx, layout.tsx)
├── components/           # Reusable UI components
│   ├── ui/               # Base level UI elements
│   └── sections/         # Section components (Hero, ProjectCard, etc.)
├── lib/                  # Utilities and data fetchers
├── data/                 # Local JSON (portfolio-data.json)
└── public/               # Public assets (logo, favicon, PDFs)
```

## Tech Stack
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS (Native).
- **Motion:** Framer Motion (via Aceternity UI / Magic UI).
- **Icons:** `lucide-react`.
- **Data:** Local JSON.
