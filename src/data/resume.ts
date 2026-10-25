import rawData from "../../data/portfolio-data.json";

type Job = { start?: string; end?: string };

/** "YYYY-MM" -> months since year 0, so two dates subtract to a month count. */
const toMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

/**
 * Months worked across all jobs. Each job is the half-open range [start, end), so Jun -> Jul is 1 month;
 * a job with no end is ongoing. Ranges are sorted and merged so overlapping months count once.
 */
export function totalMonths(jobs: Job[], today = new Date()) {
  const current = today.getFullYear() * 12 + today.getMonth();
  const ranges = jobs
    .filter((job): job is Job & { start: string } => Boolean(job.start))
    .map((job) => [toMonth(job.start), job.end ? toMonth(job.end) : current] as const)
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let reach = -Infinity; // furthest month already counted
  for (const [start, end] of ranges) {
    if (end <= reach) continue; // fully inside what's counted
    total += end - Math.max(start, reach);
    reach = end;
  }
  return total;
}

// Leftover months after whole years (x) pick the label: first band whose upper bound fits.
const BANDS: [maxMonths: number, label: (x: number) => string][] = [
  [0, (x) => `${x}`], //       exactly x
  [2, (x) => `${x}+`], //      x and a bit
  [5, (x) => `~${x}.5`], //    approaching x.5
  [6, (x) => `${x}.5`], //     exactly x.5
  [8, (x) => `${x}.5+`], //    past x.5
  [11, (x) => `~${x + 1}`], // approaching x+1
];

/** 35 -> "~3 years", 30 -> "2.5 years", 12 -> "1 year". */
export function formatYears(months: number) {
  const x = Math.floor(months / 12);
  const [, label] = BANDS.find(([max]) => months % 12 <= max)!;
  const text = label(x);
  return `${text} ${text === "1" ? "year" : "years"}`;
}

const YEARS_OF_EXPERIENCE = formatYears(totalMonths(rawData.experience));

// We extract data directly from the JSON file so any updates there instantly reflect here.
export const RESUME_DATA = {
  personal: {
    name: rawData.profile.name,
    role: "Software & AI/ML Engineer", // Hardcoded per user request to highlight this instead of Android
    yearsOfExperience: YEARS_OF_EXPERIENCE,
    summary: rawData.profile.summary.replace("{years}", YEARS_OF_EXPERIENCE),
    email: rawData.profile.email,
    phone: rawData.profile.phone,
    linkedin: rawData.profile.linkedin,
    github: rawData.profile.github,
    location: rawData.profile.location
  },
  skills: {
    mobile: rawData.skills.mobile,
    ai: rawData.skills.ai_ml,
    backend: rawData.skills.backend,
    databases: rawData.skills.databases,
    tools: rawData.skills.cloud_tools,
  },
  experience: rawData.experience.map(exp => ({
    company: exp.company,
    location: exp.location ?? "",
    role: exp.role,
    date: exp.period,
    achievements: exp.details,
  })),
  projects: rawData.projects.map(proj => ({
    name: proj.title,
    type: proj.tech,
    year: "Recent", // Adjust if year exists
    link: proj.link,
    description: proj.description,
    image: (proj as Record<string, unknown>).image as string || "",
  })),
  certifications: rawData.certifications.map(cert => ({
    name: cert.name,
    issuer: cert.issuer,
    year: cert.year,
    link: cert.link,
    image: cert.image || "",
    description: cert.description || "",
  })),
  education: rawData.education || [],
  leadership: rawData.leadership,
  languages: rawData.languages,
};
