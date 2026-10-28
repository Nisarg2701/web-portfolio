import { RESUME_DATA } from "@/data/resume";

// Links skills to the jobs, projects and certificates that mention them. Nothing here is new data:
// a skill belongs to a work when its name appears in that work's own text.

export type WorkKind = "Job" | "Project" | "Certificate";
export type Work = { kind: WorkKind; title: string; subtitle: string; link?: string; skills: string[] };
export type Skill = { name: string; label: string; group: string; works: Work[] };

// Groups are the category keys in portfolio-data.json "skills", in file order. Known keys get a
// friendlier title; any new key just becomes a new group (devops_tools -> "Devops Tools").
const TITLES: Record<string, string> = {
  mobile: "Mobile",
  ai_ml: "AI & ML",
  backend: "Backend",
  databases: "Data",
  cloud_tools: "Cloud & Tools",
};
const prettify = (key: string) => key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const GROUPS = Object.keys(RESUME_DATA.skills).map((key) => ({ key, title: TITLES[key] ?? prettify(key) }));

/** "DI (Dagger, Hilt)" -> "DI", "Firebase (Firestore)" -> "Firebase" */
const short = (name: string) => name.replace(/\s*\(.*\)/, "").trim();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (text: string, name: string) =>
  [name, short(name)].some((n) => new RegExp(`(^|[^\\w])${escape(n)}(?![\\w])`, "i").test(text));

const names: { name: string; group: string }[] = [];
for (const g of GROUPS)
  for (const name of RESUME_DATA.skills[g.key]) if (!names.some((s) => s.name === name)) names.push({ name, group: g.title });

const raw: (Omit<Work, "skills"> & { text: string })[] = [
  ...RESUME_DATA.experience.map((j) => ({
    kind: "Job" as const,
    title: j.role,
    subtitle: j.company,
    text: [j.role, ...j.achievements, ...j.stack].join(" "),
  })),
  ...RESUME_DATA.projects.map((p) => ({
    kind: "Project" as const,
    title: p.name,
    subtitle: p.type,
    link: p.link,
    text: [p.name, p.type, p.description, ...p.stack].join(" "),
  })),
  ...RESUME_DATA.certifications.map((c) => ({
    kind: "Certificate" as const,
    title: c.name,
    subtitle: `${c.issuer}, ${c.year}`,
    link: c.link,
    text: `${c.name} ${c.description}`,
  })),
];

export const WORKS: Work[] = raw.map(({ text, ...w }) => ({
  ...w,
  skills: names.filter((s) => mentions(text, s.name)).map((s) => s.name),
}));

export const SKILLS: Skill[] = names.map((s) => ({
  ...s,
  label: short(s.name),
  works: WORKS.filter((w) => w.skills.includes(s.name)),
}));

/** Pairs of skills that appear in the same work, each pair once (a < b). */
export const EDGES: [string, string][] = [];
for (const w of WORKS)
  for (let i = 0; i < w.skills.length; i++)
    for (let j = i + 1; j < w.skills.length; j++) {
      const [a, b] = [w.skills[i], w.skills[j]].sort();
      if (!EDGES.some(([x, y]) => x === a && y === b)) EDGES.push([a, b]);
    }

export const skillsIn = (text: string) => SKILLS.filter((s) => mentions(text, s.name)).map((s) => s.name);

// project and certificate chips select a skill in the constellation through this event
export const FOCUS_SKILL = "focus-skill";
export const focusSkill = (name: string) => window.dispatchEvent(new CustomEvent(FOCUS_SKILL, { detail: name }));
