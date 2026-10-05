# Memory

## User Preferences
- **Identity**: "Software & AI/ML Engineer" with 3 years of experience. Wants to de-emphasize Android.
- **Theme Constraints**: "Dark Tech & AI Native". Specifically Off-Black backgrounds (`bg-zinc-950`), Terminal/Neon Emerald Green accents (`text-emerald-500`).
- **Typography**: `JetBrains Mono` for tech/meta text, `Geist` for body/headings.
- **Vibe Constraints**: "Premium, high-end agency look, Awwwards level". Wants quality animation and minimal bloat.

## Iteration History
1. **Initial**: Built basic portfolio with `framer-motion`. User thought it looked too basic/templated.
2. **First Redesign**: Used MCP `fast_decision_evaluator` to build timeline/terminal UI. User disliked timeline (called it "lame").
3. **Second Redesign**: Rebuilt Education as Massive Bento Grid. Added GSAP ScrollTrigger to Projects. Added Footer modal for PDF download.
4. **Final Polish**: Fixed GSAP Experience stacking bleed. Rebuilt Projects to use overlapping glassmorphic cards. Rebuilt Certifications to use vertical stacked bento rows based on user-provided visual references. Switched iframe to `<object>` for clean PDF viewing.

## Security
- `portfolio-data.json` is not exposed in `public/`. Data flows through Server Components.
