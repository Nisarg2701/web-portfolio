"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
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
// one eased tween for opening and closing: height leads, content fades in just behind it
const EASE = [0.16, 1, 0.3, 1] as const;
const OPEN = { height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.3, delay: 0.12 } };
const CLOSE = { height: { duration: 0.35, ease: EASE }, opacity: { duration: 0.12 } };

export function Certifications() {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="certifications" className="py-32 px-6 max-w-3xl mx-auto">
      <div className="mb-16 text-center">
        <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-emerald-500 mb-4">Verified Milestones</h2>
        <h3 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Featured Certifications</h3>
      </div>

      <div className="flex flex-col">
        {RESUME_DATA.certifications.map((cert, i) => {
          const isOpen = i === open;
          return (
            <div
              key={cert.name}
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.8)] ${TINTS[i % TINTS.length]} ${
                isOpen ? "border-emerald-500/40" : "border-zinc-700/60"
              } ${i > 0 ? "-mt-5" : ""}`}
              style={{ zIndex: i + 1 }}
            >
              <button
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
                  <span className="mt-1 block text-base font-semibold leading-snug text-zinc-50 md:text-lg">
                    {cert.name}
                  </span>
                </span>
                <CaretDown
                  weight="bold"
                  className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`cert-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, transition: reduce ? { duration: 0 } : OPEN }}
                    exit={{ height: 0, opacity: 0, transition: reduce ? { duration: 0 } : CLOSE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 px-6 pb-8 md:grid-cols-[1.2fr_1fr] md:px-8">
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950">
                        {cert.image && (
                          <Image src={cert.image} alt={cert.name} fill sizes="(max-width: 768px) 90vw, 400px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm leading-relaxed text-zinc-300">{cert.description}</p>
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 md:mt-auto inline-flex items-center gap-2 self-start rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-500 active:scale-[0.98]"
                        >
                          Verify credential
                          <ArrowUpRight weight="bold" className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
