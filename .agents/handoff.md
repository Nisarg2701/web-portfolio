# Developer Handoff

## Project Overview
This is a portfolio overhaul for Nisarg Pakhawala, transforming an existing application into a premium, cinematic, Awwwards-level experience designed to impress recruiters, technical leads, and investors. The project has shifted entirely from React Native Web to a pure Next.js web application to maximize GSAP motion capabilities, SEO, and structural styling (CSS Grid, Tailwind).

## Goal
Showcase Nisarg's deep technical expertise (3 years of experience as a Software & AI/ML Engineer) through a highly polished, interactive "Dark Tech & AI Native" interface. The layout strictly follows the AIDA framework (Attention, Interest, Desire, Action) and utilizes rigorous `gpt-taste` and `design-taste-frontend` rules.


## Data Architecture & Security
- **JSON Source of Truth:** `data/portfolio-data.json` is now the single source of truth.
- **Security (Client Isolation):** The JSON is read purely on the server inside Server Components (`resume.ts`). Because it is physically outside the `/public` directory and never exported to the client bundle, it remains natively obfuscated and "encrypted" away from client access.
- **Dynamic Live Updates:** Because Next.js uses Fast Refresh, anytime you update `portfolio-data.json`, the webpage instantly rebuilds and updates without a server restart.

## Key References
- **Rules (`.agents/Rules.md`):** Strict constraints (e.g., no em-dashes, no 6-line headers, 2-line max Hero).
- **Design (`.agents/Design.md`):** Dark Tech & AI Native theme (Geist + JetBrains Mono, off-black, Emerald Green accents). RNG layout: Cinematic Center Hero, Bento Grid, Card Stacking, and Horizontal Accordions.
- **Memory (`.agents/Memory.md`):** Project history, including the resume data extraction and user preference locks.
- **PRD (`.agents/PRD.md`):** Core requirements and audience targets.

## Current Status
- **Pre-requisites & Design Lock:** Completed. The user's Resume and NLP Certificate image have been analyzed and mapped to the AIDA architecture. The design aesthetic is locked to "Dark Tech & AI Native" with "Highly Cinematic" GSAP motion.
- **Next Action:** Initialize/configure the Next.js project. Port over the resume data into structured UI components (Hero, Bento Grid, Experience Stack) using Tailwind CSS v4, `motion/react`, and `gsap`.
