"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
import { focusSkill, skillsIn } from "@/data/skillGraph";
import { ArrowUpRight, CaretDown, SealCheck } from "@phosphor-icons/react/dist/ssr";

// each card gets its own tint so the stack reads as separate cards, all within the emerald/zinc palette
const TINTS = [
  "from-emerald-950 via-zinc-900 to-zinc-900",
  "from-zinc-800 via-zinc-900 to-zinc-950",
  "from-teal-950 via-zinc-900 to-zinc-900",
  "from-zinc-900 via-emerald-950/60 to-zinc-950",
  "from-zinc-800 via-zinc-900 to-emerald-950/70",
];

/** Certificates as a wallet: overlapping cards, one open at a time. */
export function Certifications() {
  const [open, setOpen] = useState(0);

  return (
    <section id="certifications" className="py-32 px-6 max-w-3xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-emerald-500 mb-4">Verified Milestones</h2>
        <h3 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Featured Certifications</h3>
      </div>

      {/* "user": layout animations are skipped under reduced motion */}
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <div className="flex flex-col">
          {RESUME_DATA.certifications.map((cert, i) => {
            const isOpen = i === open;
            const skills = skillsIn(`${cert.name} ${cert.description}`);
            return (
              <motion.div
                key={cert.name}
                layout
                className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.8)] ${TINTS[i % TINTS.length]} ${
                  isOpen ? "border-emerald-500/40" : "border-zinc-700/60"
                } ${i > 0 ? "-mt-5" : ""}`}
                style={{ zIndex: i + 1 }}
              >
                <motion.button
                  layout="position"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`cert-${i}`}
                  className="flex w-full items-center gap-4 px-6 pb-6 pt-5 text-left md:px-8"
                >
                  <SealCheck weight="duotone" className="h-7 w-7 shrink-0 text-emerald-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                      {cert.issuer} · {cert.year}
                    </span>
                    <span className={`mt-1 block font-semibold text-zinc-50 ${isOpen ? "text-xl md:text-2xl" : "truncate text-base md:text-lg"}`}>
                      {cert.name}
                    </span>
                  </span>
                  <CaretDown
                    weight="bold"
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`cert-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="grid gap-6 px-6 pb-8 md:grid-cols-[1.2fr_1fr] md:px-8"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950">
                        {cert.image && (
                          <Image src={cert.image} alt={cert.name} fill sizes="(max-width: 768px) 90vw, 400px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm leading-relaxed text-zinc-300">{cert.description}</p>
                        {skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {skills.map((s) => (
                              <button
                                key={s}
                                onClick={() => focusSkill(s)}
                                title={`See ${s} on the skill map`}
                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20 active:scale-[0.98]"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-2 self-start rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-500 active:scale-[0.98] max-md:mt-6"
                        >
                          Verify credential
                          <ArrowUpRight weight="bold" className="h-4 w-4" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </MotionConfig>
    </section>
  );
}
