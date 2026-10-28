"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EDGES, FOCUS_SKILL, GROUPS, SKILLS, type Skill } from "@/data/skillGraph";

// Star-map layout in a 1000x620 box: one cluster per group, most-used skill in the middle of its
// cluster, the rest on a sunflower spiral around it (deterministic, no layout library).
const W = 1000;
const H = 620;
const CENTERS: Record<string, [number, number]> = {
  Mobile: [205, 330],
  Backend: [490, 175],
  "AI & ML": [790, 195],
  Tools: [480, 465],
  Data: [790, 480],
};
const SPACING = 58;
const pos = new Map<string, [number, number]>();
for (const g of GROUPS) {
  const members = SKILLS.filter((s) => s.group === g.title).sort((a, b) => b.works.length - a.works.length);
  const [cx, cy] = CENTERS[g.title];
  members.forEach((s, i) => {
    const r = SPACING * Math.sqrt(i) * 1.05;
    const t = i * 2.39996; // golden angle
    pos.set(s.name, [cx + r * Math.cos(t), cy + r * Math.sin(t) * 0.8]);
  });
}
// fit the whole map inside the box, leaving room for labels at the sides and group titles on top
{
  const xs = [...pos.values()].map((p) => p[0]);
  const ys = [...pos.values()].map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const [MX, MT, MB] = [95, 75, 40];
  for (const [k, [x, y]] of pos)
    pos.set(k, [MX + ((x - x0) / (x1 - x0)) * (W - 2 * MX), MT + ((y - y0) / (y1 - y0)) * (H - MT - MB)]);
}
// each group's title sits just above its highest node
const titleY = (group: string) =>
  Math.min(...SKILLS.filter((s) => s.group === group).map((s) => pos.get(s.name)![1])) - 38;
const radius = (s: Skill) => 4 + Math.sqrt(s.works.length) * 4.5;
const neighbours = (name: string) =>
  new Set(EDGES.flatMap(([a, b]) => (a === name ? [b] : b === name ? [a] : [])));
// start on the most connected skill so the panel shows something useful straight away
const FIRST = [...SKILLS].sort((a, b) => b.works.length - a.works.length)[0].name;

export function SkillConstellation() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(FIRST);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? selected;
  const near = neighbours(active);
  const skill = SKILLS.find((s) => s.name === active)!;

  // project and certificate chips elsewhere on the page jump here with a skill picked
  useEffect(() => {
    const onFocus = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      if (!SKILLS.some((s) => s.name === name)) return;
      setSelected(name);
      setHovered(null);
      document.getElementById("skills")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };
    window.addEventListener(FOCUS_SKILL, onFocus);
    return () => window.removeEventListener(FOCUS_SKILL, onFocus);
  }, []);

  const lit = (name: string) => name === active || near.has(name);
  const appear = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, scale: 0.4 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Technical Arsenal</h2>
        <p className="mt-4 max-w-xl text-zinc-400">
          Every skill, and where it was used. Pick one to see the jobs, projects and certificates behind it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Desktop: the constellation */}
        <div className="relative hidden overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 md:block">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,rgba(16,185,129,0.08),transparent_70%)]"
          />
          <svg viewBox={`0 0 ${W} ${H}`} className="relative block h-auto w-full" role="group" aria-label="Skill map">
            {GROUPS.map((g) => {
              const [x] = CENTERS[g.title];
              return (
                <text
                  key={g.title}
                  x={x}
                  y={titleY(g.title)}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[12px] uppercase tracking-[0.2em]"
                >
                  {g.title}
                </text>
              );
            })}

            {EDGES.map(([a, b], i) => {
              const [x1, y1] = pos.get(a)!;
              const [x2, y2] = pos.get(b)!;
              const on = a === active || b === active;
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={on ? 1.6 : 1}
                  className={`transition-[stroke,stroke-opacity] duration-300 ${on ? "stroke-emerald-400" : "stroke-zinc-500"}`}
                  strokeOpacity={on ? 0.9 : 0.18}
                  {...(reduce
                    ? {}
                    : {
                        initial: { pathLength: 0 },
                        whileInView: { pathLength: 1 },
                        viewport: { once: true, amount: 0.3 },
                        transition: { duration: 1.2, delay: 0.6 + i * 0.03, ease: "easeInOut" },
                      })}
                />
              );
            })}

            {SKILLS.map((s, i) => {
              const [x, y] = pos.get(s.name)!;
              const r = radius(s);
              const on = lit(s.name);
              const isActive = s.name === active;
              return (
                <g
                  key={s.name}
                  role="button"
                  tabIndex={0}
                  aria-pressed={s.name === selected}
                  aria-label={`${s.name}: ${s.works.length ? `used in ${s.works.length}` : "toolkit"}`}
                  onMouseEnter={() => setHovered(s.name)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setSelected(s.name)}
                  onClick={() => setSelected(s.name)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(s.name))}
                  className="cursor-pointer outline-none [&:focus-visible>circle:last-of-type]:stroke-emerald-300"
                >
                  <motion.g style={{ transformOrigin: `${x}px ${y}px` }} {...appear(i * 0.025)}>
                    {isActive && <circle cx={x} cy={y} r={r + 10} className="fill-emerald-500/15" />}
                    <circle cx={x} cy={y} r={Math.max(r, 14)} className="fill-transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      strokeWidth={2}
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "fill-emerald-400 stroke-emerald-200"
                          : on
                            ? "fill-emerald-500/70 stroke-emerald-400/60"
                            : s.works.length
                              ? "fill-zinc-500 stroke-transparent"
                              : "fill-zinc-700 stroke-transparent"
                      }`}
                    />
                    <text
                      x={x}
                      y={y + r + 15}
                      textAnchor="middle"
                      className={`select-none text-[14px] transition-colors duration-300 ${
                        isActive ? "fill-emerald-300 font-semibold" : on ? "fill-zinc-100" : "fill-zinc-500"
                      }`}
                    >
                      {s.label}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Phones: the same skills as chips */}
        <div className="space-y-6 md:hidden">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">{g.title}</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.filter((s) => s.group === g.title).map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelected(s.name)}
                    aria-pressed={s.name === selected}
                    className={`rounded-xl border px-3 py-1.5 text-sm transition-colors active:scale-[0.98] ${
                      s.name === selected
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                        : near.has(s.name)
                          ? "border-emerald-500/40 text-emerald-300"
                          : s.works.length
                            ? "border-zinc-700 text-zinc-300"
                            : "border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SkillPanel skill={skill} near={[...near]} onPick={setSelected} />
      </div>
    </section>
  );
}

function SkillPanel({ skill, near, onPick }: { skill: Skill; near: string[]; onPick: (name: string) => void }) {
  return (
    <aside
      aria-live="polite"
      className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 md:p-8 lg:self-start"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">{skill.group}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{skill.name}</h3>

      {skill.works.length ? (
        <>
          <p className="mt-6 mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Used in {skill.works.length}
          </p>
          <ul className="space-y-2">
            {skill.works.map((w) => (
              <li key={w.kind + w.title + w.subtitle}>
                <a
                  {...(w.link ? { href: w.link, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 ${
                    w.link ? "transition-colors hover:border-emerald-500/40" : ""
                  }`}
                >
                  <span className="mt-0.5 shrink-0 rounded-md bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {w.kind}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-zinc-100">{w.title}</span>
                    <span className="block truncate text-xs text-zinc-500">{w.subtitle}</span>
                  </span>
                  {w.link && (
                    <ArrowUpRight weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                  )}
                </a>
              </li>
            ))}
          </ul>
          {near.length > 0 && (
            <>
              <p className="mt-6 mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Used alongside</p>
              <div className="flex flex-wrap gap-2">
                {near.map((n) => (
                  <button
                    key={n}
                    onClick={() => onPick(n)}
                    className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/10"
                  >
                    {SKILLS.find((s) => s.name === n)!.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-zinc-400">Part of the {skill.group.toLowerCase()} toolkit.</p>
      )}
    </aside>
  );
}
