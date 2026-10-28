# Ideas: Skills, Projects, Certifications

Brainstorm only, nothing built yet (2026-10-28). Pick one direction per section, then it becomes a task.
Every idea follows the taste-skill rule "motion must be motivated": the animation has to say something about the content, not just move.

The strongest angle for this portfolio: **connect the sections.** Today Skills, Experience, Projects and Certifications are four separate lists, but `portfolio-data.json` already holds the links between them (each project and job lists its tech). A recruiter's real question is "where did he actually use X?", and no section answers it yet.

## Skills

1. **Skill constellation (recommended).** Each skill is a glowing node; lines join skills used together in the same project or job. Hovering or tapping "LangChain" lights up its neighbours and lists the jobs and projects that used it. Node size = how many places it appears. Fits the AI/ML identity (it reads like a knowledge graph or neural net) and it is data-driven, so it never goes stale.
   *Research:* force-directed graphs (d3-force, or a precomputed layout so no new dependency), Obsidian's graph view, GitHub's dependency graph.
2. **Terminal / REPL.** A small terminal where visitors type or click commands: `skills --ai`, `skills --used-in e-shark`, `whoami`. Typed output reveals the skills. Cheap to build, very on-theme for "dark tech", and memorable. Needs a non-typing fallback (clickable chips) for phones.
   *Research:* Warp and opencode.ai in `.agents/skills/design-md`, terminal-style portfolios on Awwwards.
3. **Network layers.** Skills drawn as a neural network: input layer = languages, hidden layers = frameworks/tools, output layer = things shipped (apps, models, platforms). Scrolling "runs a forward pass": signals travel from inputs to outputs.
   *Research:* TensorFlow Playground, distill.pub visual essays.
4. **Periodic table of skills.** Each skill an element tile (symbol "Kt" for Kotlin, number = years used). Groups colour-coded by family; hover flips the tile to show where it was used. Very scannable for recruiters.
5. **Timeline of acquisition.** Skills appear on a horizontal year axis in the order they were picked up (from job/project dates), showing growth from Android to AI.

## Projects

1. **Horizontal pinned pan (recommended).** One project per full-screen slide, scrolled sideways while the section is pinned (taste skill 5.B skeleton). Big image, one hero metric counting up (e.g. "88-90% accuracy"), tech chips that link back to the skill constellation.
   *Research:* GSAP horizontal scroll demos, Linear's and Vercel's launch pages in design-md.
2. **"Boot" cards.** Each project opens like an app window or IDE tab with a short screen recording or GIF of the real thing running, instead of a static image. Shows the work rather than describing it. Needs recordings of each project.
3. **Git-log view.** Projects shown as a commit graph: branches per domain (Android, AI, Web), each commit a project with a message-style one-liner. Clicking expands into the case study. Playful for a technical audience.
4. **Problem -> approach -> result case studies.** Fewer projects, each with a three-step story and one number. Less flashy, highest recruiter value; pairs well with any of the above.

## Certifications

1. **Credential wallet (recommended).** Certificates as a stacked card wallet (Apple Wallet style). Tap to fan them out; tap one to flip it and show issuer, date and a "Verify" link. Compact, tactile, and turns a long list into one interactive object.
2. **Seal stamp on verify.** Each certificate row gets an animated "verified" seal that stamps in when it scrolls into view, linking to the issuer's credential page. Communicates trust, which is the point of a certificate.
3. **Achievements unlocked.** Game-style achievement toasts ("Unlocked: NLP in Python") with an icon and rarity, laid out as a trophy grid. Fun, but check it doesn't feel unserious next to the rest.
4. **Bookshelf.** Certificates as book spines on a shelf; pulling one out shows the certificate. Distinctive, but harder to make accessible.

## Suggested combination
Skill constellation + horizontal project pan + credential wallet, with the constellation as the hub: clicking a project's tech chip or a certificate's skill jumps to and highlights that skill node.
Order to build: constellation first (it defines the data links the other two reuse).

## Skills, round 2 (2026-10-28)
The constellation read as jumbled and the wheel still didn't look right. What the user liked: the old bento's clear categories. What to keep: "pick a skill, see where it was used". Ideas to think about:

1. **Periodic table of skills (recommended).** Each skill an element tile (symbol "Py", "Kt", "Cl", number = how many works use it), categories as colour-blocked families like real element groups. Picking a tile lights up related tiles and fills the "Used in" panel. Strong classification, very scannable, grows naturally as skills are added, and fits the technical vibe without being a chart.
2. **System stack diagram.** Horizontal layers ordered like a real system: Data -> Backend -> Mobile -> AI/ML -> AI Tools -> Cloud & Tools. Skills are chips inside their layer; picking one draws vertical connectors to related skills in other layers. Reads like an architecture diagram, which suits a software engineer.
3. **Bento + live links.** The old bento boxes back as they were, plus the connection layer: pick a chip, related chips in other boxes glow, panel shows where it was used. Safest; least novel.
4. **Skill x work matrix.** Rows = skills grouped by category, columns = jobs/projects/certificates, filled cells = used there. The most honest and recruiter-useful view; dense, so it suits a "details" toggle rather than the main view.
5. **Terminal.** `skills --group ai`, `skills --used-in e-shark`, `whoami`: typed commands reveal skills, clickable chips as a phone fallback. Memorable and on-theme.
6. **Orbit rings.** Categories as concentric orbits around a centre node; skills orbit slowly, pause on hover. Visually striking, but motion has to be justified and labels on moving items are hard to read.
