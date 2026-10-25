# Portfolio Audit

**Date:** 2026-10-25
**Commit audited:** `8a4de4e` (main)
**Method:** Read all source files, ran the dev server and scrolled every section at 1440×900, opened the contact modal, ran `eslint`, `tsc --noEmit` and `next build`.

Actionable items are tracked in [Areas-to-Work.md](Areas-to-Work.md).

---

## Summary

A polished, small (~1,000 lines, 7 section components) Next.js 16 portfolio driven by a single JSON file. Lint, type check and production build are all clean; the page prerenders as fully static. No console errors at runtime.

The weak spots are **content accuracy** (things a recruiter could notice) and **small UX/robustness gaps**, not architecture.

| Check | Result |
|---|---|
| `npx eslint` | Pass, no warnings |
| `npx tsc --noEmit` | Pass |
| `next build` | Pass, `/` prerendered static |
| Runtime console errors | None |

---

## Strengths

- **Data-driven content.** Everything comes from `data/portfolio-data.json` via `src/data/resume.ts`; resume updates need no code changes.
- **Consistent visual identity.** Zinc-950 + emerald theme, Geist + JetBrains Mono, bento skills grid, stacked experience cards, image-backed project cards, animated CGPA counter.
- **Good platform usage.** `next/image` (with remote patterns for Udemy cert images), `next/font`, reduced-motion respected in `ExperienceStack`.

---

## Findings

Severity: **High** = visible to visitors / factually wrong; **Medium** = UX or robustness gap; **Low** = cleanup.

### Content accuracy

| # | Sev | Finding | Location |
|---|---|---|---|
| C1 | High | "Natural Language Processing (NLP) in Python" links to the same credential (`UC-4c6bf654…`) as "LLM & Generative AI Masterclass". | `data/portfolio-data.json` → `certifications[4].link` |
| C2 | High | Cert card titles don't match their certificate images: "Bluetooth Chat Application (Android)" shows *Beginners guide to Android App Development (Step by Step)*; "Generative AI Mastery with NLP LLM" shows *Generative AI – Natural Language Processing Bootcamp 2025*. | `data/portfolio-data.json` → `certifications[2]`, `[3]` |
| C3 | High | Experience entries without a `location` fall back to `"Remote"`, so all three internships display "Remote", which is likely untrue. | `src/data/resume.ts:24` |
| C4 | Medium | Phone number and email are rendered in plain text (contact modal) and are in `Resume.pdf`, so scrapers can collect them. Personal choice whether to keep. | `src/components/Footer.tsx`, `public/Resume.pdf` |
| C5 | Low | Profile summary has a typo: "3 of professional experience" (currently unused, since the Hero hardcodes its own copy). | `data/portfolio-data.json` → `profile.summary` |
| C6 | Low | Hero hardcodes "3 years of experience" instead of reading from data, so it will go stale. | `src/components/Hero.tsx` |
| C7 | Low | Grammar in experience bullet: "Gained exposure to Android Jetpack Compose was pilot to integrate into current projects." | `data/portfolio-data.json` → `experience[0].details[2]` |

### UX / accessibility

| # | Sev | Finding | Location |
|---|---|---|---|
| U1 | Medium | Contact modal: Escape doesn't close it, background page still scrolls, no `role="dialog"` / `aria-modal`, no focus trap, close button has no accessible label. | `src/components/Footer.tsx` |
| U2 | Medium | Modal embeds the PDF via `<object>`; most mobile browsers won't render it, so half the modal is a fallback link on phones. | `src/components/Footer.tsx` |
| U3 | Medium | Hero CTA "View Selected Work" scrolls to `#experience`, not to projects; the Projects section has no `id`. | `src/components/Hero.tsx`, `src/components/ProjectsList.tsx` |
| U4 | Low | `ProjectsList` and `Certifications` animations ignore `prefers-reduced-motion` (`ExperienceStack` honours it). | both components |

### Code robustness

| # | Sev | Finding | Location |
|---|---|---|---|
| R1 | Medium | GSAP cleanup calls `ScrollTrigger.getAll().forEach(t => t.kill())`, which kills **every** ScrollTrigger on the page, including `ExperienceStack`'s pins. Harmless on today's single page, breaks once sections remount independently. Use `gsap.context(...)` + `ctx.revert()` like `ExperienceStack` does. | `src/components/ProjectsList.tsx`, `src/components/Certifications.tsx` |
| R2 | Low | Experience cards are pinned twice: CSS `sticky top-0` **and** GSAP `pin: true`. One mechanism is enough. | `src/components/ExperienceStack.tsx` |
| R3 | Low | Every component is `"use client"`, including purely static ones (`BentoGrid`). As a result the whole JSON ships in the client bundle; `.agents/Memory.md` claims data "flows through Server Components", which is not accurate. Data is public anyway, so not a security issue. | `src/components/*.tsx`, `.agents/Memory.md` |

### Dependencies and assets

| # | Sev | Finding | Location |
|---|---|---|---|
| D1 | Low | Installed but never imported: `framer-motion` (the code uses `motion`), `lucide-react`, `clsx`, `tailwind-merge`, `@gsap/react`. | `package.json` |
| D2 | Low | `public/logo.jpg` (544 KB) is unused. | `public/` |

### Launch readiness

| # | Sev | Finding |
|---|---|---|
| L1 | Medium | Not deployed yet (code is on GitHub only). |
| L2 | Medium | No Open Graph / Twitter metadata or preview image, so shared links on LinkedIn look bare. |
| L3 | Low | `README.md` is still the create-next-app boilerplate. |
