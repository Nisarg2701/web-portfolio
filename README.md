# Nisarg Pakhawala — Portfolio

Personal portfolio of a Software & AI/ML Engineer: experience, selected projects and certifications on a single animated page.

**Live:** [nisarg-pakhawala-portfolio.vercel.app](https://nisarg-pakhawala-portfolio.vercel.app)

![Portfolio preview](https://nisarg-pakhawala-portfolio.vercel.app/opengraph-image)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, fully static output)
- [Tailwind CSS v4](https://tailwindcss.com)
- [GSAP](https://gsap.com) ScrollTrigger for scroll animations, [Motion](https://motion.dev) for reveals and the contact dialog
- [Phosphor Icons](https://phosphoricons.com)
- Deployed on [Vercel](https://vercel.com)

## Sections

| Section | What it does |
|---|---|
| Hero | Introduction, with years of experience worked out from the job dates |
| Technical Arsenal | Skill constellation: each skill linked to the jobs, projects and certificates that used it |
| Experience | Cards that stack as you scroll |
| Featured Projects | Slides that pan sideways as you scroll (swipe on phones) |
| Certifications | A wallet of certificate cards; open one to see it and verify it |
| Education & Leadership | CGPA counter, leadership and languages |
| Contact | Dialog with the resume (PDF preview on desktop), email, phone and WhatsApp |

Animations are turned off for visitors who have "reduce motion" enabled.

## Editing the content

All content lives in [`src/data/portfolio-data.json`](src/data/portfolio-data.json). [`src/data/resume.ts`](src/data/resume.ts) maps it into the shape the components use, so most updates need no code changes.

- **Experience:** give each job `start` and `end` as `"YYYY-MM"` (leave out `end` for a current job). The total shown on the site (for example "~3 years") is calculated from these, counting overlapping months once.
- **Summary:** `{years}` in `profile.summary` is replaced with that same total.
- **Images:** project images go in `public/images/projects/`; certificate images can be local files or remote URLs.
- **Resume:** replace `public/Resume.pdf`.

The link-preview image (shown when the site is shared on LinkedIn, WhatsApp, X, etc.) is generated from the same data by [`src/app/opengraph-image.tsx`](src/app/opengraph-image.tsx).

## Running locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the build
npm run lint
```

## Project structure

```
public/                         resume PDF, images, hero animation frames (hero-frames/, phones: hero-frames/sm/)
src/app/                        layout, metadata, page, preview image
src/components/layout/          navbar, footer + contact dialog, WhatsApp button
src/components/sections/        one component per page section
src/components/hero/            hero section, animated character, its playback table
src/data/portfolio-data.json    all site content
src/data/resume.ts              maps the JSON for the components
```
