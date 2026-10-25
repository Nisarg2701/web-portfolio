import { ImageResponse } from "next/og";
import { RESUME_DATA } from "@/data/resume";

// Link-preview card (LinkedIn, WhatsApp, X...). Rendered once at build time from the resume data.
export const alt = `${RESUME_DATA.personal.name}, ${RESUME_DATA.personal.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EMERALD = "#10b981";

export default function Image() {
  const { name, role, yearsOfExperience } = RESUME_DATA.personal;
  const [first, ...rest] = name.split(" ");
  const tags = ["Python", "AI / ML", "LLMs", "Android"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#09090b",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(16,185,129,0.22), transparent 55%)",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#34d399" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: EMERALD }} />
          {role.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            <span style={{ color: EMERALD }}>{first}</span>
            <span style={{ marginLeft: 28 }}>{rest.join(" ")}</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#a1a1aa" }}>
            Building scalable systems & intelligent integrations.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "1px solid #27272a",
                  background: "#18181b",
                  fontSize: 24,
                  color: "#d4d4d8",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>{`${yearsOfExperience} experience`}</div>
        </div>
      </div>
    ),
    size,
  );
}
