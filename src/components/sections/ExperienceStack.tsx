"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { RESUME_DATA } from "@/data/resume";

export function ExperienceStack() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Only register and run if not reduced motion and running in browser
    if (reduce || !ref.current || typeof window === "undefined") return;
    
    gsap.registerPlugin(ScrollTrigger);

    // Pinning is CSS `sticky top-0` on each .stack-card; GSAP only shrinks/fades the card being covered.
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return; // Nothing covers the last card

        const visual = card.querySelector(".visual-card");
        const next = cardEls[i + 1];
        gsap.to(visual, {
          scale: 0.85,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
        });
        // gone before the next card settles, so a taller card never peeks out underneath it
        gsap.to(visual, {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 35%", scrub: true },
        });
      });
    }, ref);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section id="experience" className="bg-zinc-950 py-24">
      <div className="max-w-4xl mx-auto px-6 mb-24 text-center">
        <h2 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Experience</h2>
      </div>

      <div ref={ref} className="relative pb-[10vh]">
        {RESUME_DATA.experience.map((job, i) => (
          <div
            key={i}
            // reduced motion: no stacking, so a covered card never shows through the one on top
            className="stack-card motion-safe:sticky motion-safe:top-0 motion-safe:min-h-screen w-full flex flex-col items-center justify-center p-6"
            style={{ zIndex: i + 1 }}
          >
            {/* The actual visual card inside the full-height flex container */}
            <div className="visual-card w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-16 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-medium text-zinc-100">{job.role}</h3>
                  <p className="text-xl text-emerald-500 mt-2">{job.company}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="font-mono text-zinc-400">{job.date}</p>
                  <p className="text-sm text-zinc-500 mt-1">{job.location}</p>
                </div>
              </div>
              <ul className="space-y-4">
                {job.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start text-zinc-300">
                    <span className="text-emerald-500 mr-4 mt-1.5 opacity-60">▪</span>
                    <span className="leading-relaxed text-lg">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
