import rawData from "../../data/portfolio-data.json";

// We extract data directly from the JSON file so any updates there instantly reflect here.
export const RESUME_DATA = {
  personal: {
    name: rawData.profile.name,
    role: "Software & AI/ML Engineer", // Hardcoded per user request to highlight this instead of Android
    summary: rawData.profile.summary,
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
    location: exp.location || "Remote",
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
