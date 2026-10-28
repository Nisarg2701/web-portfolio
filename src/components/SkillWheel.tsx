"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EDGES, FOCUS_SKILL, GROUPS, SKILLS, type Skill } from "@/data/skillGraph";

// Wheel geometry, in a square viewBox. Everything is computed from the data: each group in
// portfolio-data.json "skills" gets a slice sized by its skill count, each skill a spoke on the rim.
const S = 760;
const C = S / 2;
const R = 215; // spoke ring
const GAP = 0.09; // radians between slices
const START = -Math.PI / 2; // first slice starts at 12 o'clock

const slices = (() => {
  const per = (2 * Math.PI - GAP * GROUPS.length) / SKILLS.length;
  let a = START + GAP / 2;
  return GROUPS.map((g) => {
    const members = SKILLS.filter((s) => s.group === g.title);
    const a0 = a;
    a += members.length * per;
    const slice = { title: g.title, a0, a1: a, members: members.map((s, i) => ({ s, angle: a0 + (i + 0.5) * per })) };
    a += GAP;
    return slice;
  });
})();
const ANGLE = new Map(slices.flatMap((sl) => sl.members.map((m) => [m.s.name, m.angle] as const)));
const at = (angle: number, r: number) => [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;

/** Arc from a0 to a1 at radius r; reversed so labels on the lower half read left to right. */
const arc = (r: number, a0: number, a1: number, reverse = false) => {
  const [x0, y0] = at(reverse ? a1 : a0, r);
  const [x1, y1] = at(reverse ? a0 : a1, r);
  return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} ${reverse ? 0 : 1} ${x1},${y1}`;
};
const lowerHalf = (a: number) => Math.sin(a) > 0.15;

const radius = (s: Skill) => 3.5 + Math.sqrt(s.works.length) * 3;
const neighbours = (name: string) =>
  new Set(EDGES.flatMap(([a, b]) => (a === name ? [b] : b === name ? [a] : [])));
// start on the most connected skill so the panel shows something useful straight away
const FIRST = [...SKILLS].sort((a, b) => b.works.length - a.works.length)[0].name;

export function SkillWheel() {
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

  // entrance: slices draw in, then spokes appear clockwise (the wheel's reading order)
  const reveal = (delay: number, from: { pathLength: 0 } | { opacity: 0 }) =>
    reduce
      ? {}
      : {
          initial: from,
          whileInView: "pathLength" in from ? { pathLength: 1 } : { opacity: 1 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12 md:mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Technical Arsenal</h2>
        <p className="mt-4 max-w-xl text-zinc-400">
          Every skill, grouped by area. Pick one to see where it was used and what it was used with.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        {/* Desktop: the wheel */}
        <div className="relative hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-4 md:block">
          <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block h-auto w-full max-w-[720px]" role="group" aria-label="Skill wheel">
            <defs>
              {slices.map((sl, i) => (
                <path key={i} id={`slice-label-${i}`} d={arc(lowerHalf((sl.a0 + sl.a1) / 2) ? R - 40 : R - 46, sl.a0, sl.a1, lowerHalf((sl.a0 + sl.a1) / 2))} />
              ))}
            </defs>

            {/* slices: a band and a title per group */}
            {slices.map((sl, i) => {
              const own = sl.title === skill.group;
              return (
                <g key={sl.title}>
                  <motion.path
                    d={arc(R - 22, sl.a0, sl.a1)}
                    fill="none"
                    strokeWidth={own ? 6 : 4}
                    strokeLinecap="round"
                    className={`transition-[stroke,stroke-width] duration-300 ${own ? "stroke-emerald-400" : "stroke-zinc-700"}`}
                    {...reveal(i * 0.08, { pathLength: 0 })}
                  />
                  <text
                    className={`font-mono text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 ${own ? "fill-emerald-300" : "fill-zinc-500"}`}
                  >
                    <textPath href={`#slice-label-${i}`} startOffset="50%" textAnchor="middle">
                      {sl.title}
                    </textPath>
                  </text>
                </g>
              );
            })}

            {/* links for the picked skill only: curves through the middle to the skills it shares work with */}
            {EDGES.filter(([a, b]) => a === active || b === active).map(([a, b]) => {
              const [x1, y1] = at(ANGLE.get(a)!, R);
              const [x2, y2] = at(ANGLE.get(b)!, R);
              const [mx, my] = [C + ((x1 + x2) / 2 - C) * 0.15, C + ((y1 + y2) / 2 - C) * 0.15];
              return (
                <motion.path
                  key={`${a}-${b}-${active}`}
                  d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                  fill="none"
                  strokeWidth={1.5}
                  className="stroke-emerald-400/70"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}

            {/* centre: the picked skill */}
            <text x={C} y={C - 8} textAnchor="middle" className="fill-zinc-50 text-[26px] font-semibold tracking-tight">
              {skill.label}
            </text>
            <text x={C} y={C + 20} textAnchor="middle" className="fill-zinc-500 font-mono text-[12px] uppercase tracking-[0.2em]">
              {skill.works.length ? `used in ${skill.works.length}` : "toolkit"}
            </text>

            {/* spokes */}
            {slices.flatMap((sl, gi) =>
              sl.members.map(({ s, angle }, i) => {
                const [x, y] = at(angle, R);
                const flip = Math.cos(angle) < 0; // keep left-side labels upright
                const deg = (angle * 180) / Math.PI + (flip ? 180 : 0);
                const [lx, ly] = at(angle, R + 14);
                const isActive = s.name === active;
                const on = isActive || near.has(s.name);
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
                    className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-emerald-300"
                  >
                    <motion.g {...reveal(0.3 + (gi * 4 + i) * 0.015, { opacity: 0 })}>
                      {/* generous invisible hit area covering dot and label */}
                      <line x1={x} y1={y} x2={at(angle, R + 125)[0]} y2={at(angle, R + 125)[1]} strokeWidth={22} stroke="transparent" />
                      {isActive && <circle cx={x} cy={y} r={radius(s) + 8} className="fill-emerald-500/20" />}
                      <circle
                        cx={x}
                        cy={y}
                        r={radius(s)}
                        strokeWidth={2}
                        className={`transition-colors duration-300 ${
                          isActive
                            ? "fill-emerald-400 stroke-emerald-200"
                            : on
                              ? "fill-emerald-500/80 stroke-transparent"
                              : s.works.length
                                ? "fill-zinc-400 stroke-transparent"
                                : "fill-zinc-700 stroke-transparent"
                        }`}
                      />
                      <text
                        x={lx}
                        y={ly}
                        dy="0.35em"
                        textAnchor={flip ? "end" : "start"}
                        transform={`rotate(${deg} ${lx} ${ly})`}
                        className={`select-none text-[13px] transition-colors duration-300 ${
                          isActive ? "fill-emerald-300 font-semibold" : on ? "fill-zinc-50" : s.works.length ? "fill-zinc-300" : "fill-zinc-500"
                        }`}
                      >
                        {s.label}
                      </text>
                    </motion.g>
                  </g>
                );
              }),
            )}
          </svg>
        </div>

        {/* Phones: the same groups and skills as chips */}
        <div className="space-y-6 md:hidden">
          {GROUPS.map((g) => (
            <div key={g.key}>
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
    <aside aria-live="polite" className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 md:p-8">
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
