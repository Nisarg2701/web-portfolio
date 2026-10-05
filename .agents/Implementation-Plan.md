# Implementation Plan

## Step 1: Pre-requisites & Audit (Completed)
1. Audit current file structure, content, and IA.
2. Create vibe coder foundation documents.

## Step 2: Declaration, Content & Design Lock (Completed)
1. Declared overhaul mode and Next.js tech stack migration.
2. Integrated user's `Resume.pdf` (Android, Jetpack Compose, AI/ML).
3. Integrated user's `NLP_IN_Python_certificate.jpg`.
4. Locked Design System: "Dark Tech & AI Native", Emerald Green accents, Geist + JetBrains Mono typography.
5. Defined AIDA Layout via RNG: Cinematic Center Hero, Gapless Bento Grid, Card Stacking, Horizontal Accordions.

## Step 3: Next.js Foundation & Scaffolding (Current)
1. **Scaffold:** Verify Next.js App Router environment, Tailwind CSS, TypeScript setup.
2. **Dependencies:** Install `gsap`, `@gsap/react`, `motion/react`, and required icon libraries (`@phosphor-icons/react` or `lucide-react`).
3. **Data Layer:** Create structured data files (`data/resume.ts`) holding Nisarg's experience, skills, and projects to avoid cluttering UI components.

## Step 4: Component Implementation (AIDA)
1. **Attention (Hero):** Build `Cinematic Center` Hero. Massive width, updated title "Software & AI/ML Engineer", Emerald Green primary CTA.
2. **Interest (Bento Grid & Certs):** Build `Gapless Bento Grid` for skills. Build `Certifications` section with external images and `LeadershipAndLanguages` sections.
3. **Desire (GSAP Motion & Cinematic Lists):** Implement `Card Stacking` for Experience (with opacity:0 fix so back cards vanish cleanly). Replace Accordions with `ProjectsList` (cinematic hover-reveal list) to elegantly display text-heavy projects without oversized empty cards.
4. **Action (Footer):** Build massive contrast CTA footer. Removed copyright. Make all contact links (Email, Phone, LinkedIn, GitHub) thoroughly visible.

## Step 5: Polish & Audits
1. Strip all meta-labels and em-dashes across all components.
2. Verify Button text contrast (WCAG AA minimum for Emerald/Off-black).
3. Verify `gpt-taste` hero limits (no 6-line headers, proper container widths).
4. Perform final performance/accessibility check.
