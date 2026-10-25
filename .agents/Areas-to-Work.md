# Areas to Work

Action list from the 2026-10-25 audit. Each item references its finding ID in [Audit.md](Audit.md), which has the full detail.
Tick items off as they land, and add the commit hash.

## 1. Content accuracy (do first)
- [x] **C1:** Fix the "NLP in Python" credential link; it duplicates the LLM Masterclass link. *(2026-10-26, cd16f7d: the NLP link was right; the LLM Masterclass card was the duplicate (same ID and image) and was removed.)*
- [x] **C2:** Make cert titles match the certificates ("Beginners guide to Android App Development", "Generative AI – NLP Bootcamp 2025"), or swap the images. *(2026-10-26, cd16f7d: titles renamed, cert years corrected from the certificate dates.)*
- [x] **C3:** Remove the `"Remote"` fallback in `src/data/resume.ts`; add real locations for the internships, or hide the field when it's empty. *(2026-10-26, cd16f7d: real locations added, fallback is now empty.)*
- [x] **C4:** Decide whether the phone number stays public (page and PDF). *(User decision, 2026-10-26: keep it.)*
- [x] **C5:** Fix the summary typo "3 of professional experience". *(2026-10-26, cd16f7d: summary uses a `{years}` placeholder.)*
- [x] **C6:** Drive the Hero's "3 years" from data instead of hardcoding it. *(2026-10-26, cd16f7d: computed in `resume.ts` from each job's `start`/`end`, overlaps counted once.)*
- [x] **C7:** Fix the grammar of the Jetpack Compose experience bullet. *(2026-10-26, cd16f7d.)*

## 2. UX / accessibility
- [x] **U1:** Contact modal: close on Escape, lock background scroll, add `role="dialog"` + `aria-modal`, trap focus, add `aria-label` to the close button. *(2026-10-26, b30d18f; focus also returns to "Get In Touch" on close.)*
- [x] **U2:** On mobile, hide the PDF `<object>` and show the action buttons only (or an "Open resume" link). *(2026-10-26, b30d18f: preview hidden below `md`, "Open Resume" button added for phones.)*
- [x] **U3:** Add `id="projects"` to the Projects section and point "View Selected Work" at it. *(2026-10-26, cd16f7d: user chose to remove the button instead.)*
- [x] **U4:** Respect `prefers-reduced-motion` in `ProjectsList` and `Certifications`. *(2026-10-26, b30d18f: `gsap.matchMedia`, no animation when reduced.)*

## 3. Code robustness
- [x] **R1:** Replace the global `ScrollTrigger.getAll().kill()` cleanup with `gsap.context` + `ctx.revert()` in `ProjectsList` and `Certifications`. *(2026-10-26, b30d18f: done with `gsap.matchMedia()` + `mm.revert()`, together with U4.)*
- [x] **R2:** Pick one pinning mechanism in `ExperienceStack` (CSS sticky *or* GSAP pin). *(2026-10-26, b30d18f: kept CSS sticky; GSAP now only shrinks/fades the covered card.)*
- [x] **R3:** Drop `"use client"` from static components (e.g. `BentoGrid`); correct the "Server Components" claim in `Memory.md`. *(2026-10-26, b30d18f: BentoGrid is a server component; Memory.md and Architecture.md corrected. User chose not to refactor other sections to props.)*

## 4. Cleanup
- [x] **D1:** `npm uninstall framer-motion lucide-react clsx tailwind-merge @gsap/react` *(2026-10-26, b30d18f.)*
- [x] **D2:** Delete the unused `public/logo.jpg`. *(2026-10-26, b30d18f. `public/images/profile.jpg` is also unused now but kept on purpose until the hero character work lands.)*

## 5. Launch
- [x] **L1:** Deploy (Vercel). *(2026-10-26: `main` fast-forwarded to `2d26dbe` and live at https://nisarg-pakhawala-portfolio.vercel.app via Vercel project `portfolio-app`.)*
- [x] **L2:** Add Open Graph / Twitter metadata and a preview image in `src/app/layout.tsx`. *(2026-10-26, c49424d: generated card in `src/app/opengraph-image.tsx`.)*
- [x] **L3:** Replace the boilerplate `README.md` with a real project README. *(2026-10-26, c49424d.)*
