# Areas to Work

Action list from the 2026-10-25 audit. Each item references its finding ID in [Audit.md](Audit.md), which has the full detail.
Tick items off as they land, and add the commit hash.

## 1. Content accuracy (do first)
- [ ] **C1:** Fix the "NLP in Python" credential link; it duplicates the LLM Masterclass link.
- [ ] **C2:** Make cert titles match the certificates ("Beginners guide to Android App Development", "Generative AI – NLP Bootcamp 2025"), or swap the images.
- [ ] **C3:** Remove the `"Remote"` fallback in `src/data/resume.ts`; add real locations for the internships, or hide the field when it's empty.
- [ ] **C4:** Decide whether the phone number stays public (page and PDF). *(User decision)*
- [ ] **C5:** Fix the summary typo "3 of professional experience".
- [ ] **C6:** Drive the Hero's "3 years" from data instead of hardcoding it.
- [ ] **C7:** Fix the grammar of the Jetpack Compose experience bullet.

## 2. UX / accessibility
- [ ] **U1:** Contact modal: close on Escape, lock background scroll, add `role="dialog"` + `aria-modal`, trap focus, add `aria-label` to the close button.
- [ ] **U2:** On mobile, hide the PDF `<object>` and show the action buttons only (or an "Open resume" link).
- [ ] **U3:** Add `id="projects"` to the Projects section and point "View Selected Work" at it.
- [ ] **U4:** Respect `prefers-reduced-motion` in `ProjectsList` and `Certifications`.

## 3. Code robustness
- [ ] **R1:** Replace the global `ScrollTrigger.getAll().kill()` cleanup with `gsap.context` + `ctx.revert()` in `ProjectsList` and `Certifications`.
- [ ] **R2:** Pick one pinning mechanism in `ExperienceStack` (CSS sticky *or* GSAP pin).
- [ ] **R3:** Drop `"use client"` from static components (e.g. `BentoGrid`); correct the "Server Components" claim in `Memory.md`.

## 4. Cleanup
- [ ] **D1:** `npm uninstall framer-motion lucide-react clsx tailwind-merge @gsap/react`
- [ ] **D2:** Delete the unused `public/logo.jpg`.

## 5. Launch
- [ ] **L1:** Deploy (Vercel).
- [ ] **L2:** Add Open Graph / Twitter metadata and a preview image in `src/app/layout.tsx`.
- [ ] **L3:** Replace the boilerplate `README.md` with a real project README.
