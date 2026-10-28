"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RESUME_DATA } from "@/data/resume";
import { focusSkill, skillsIn } from "@/data/skillGraph";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

// lines the first slide up with the page's max-w-7xl content edge
const EDGE = "px-6 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]";

export function ProjectsList() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const setBar = (p: number) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(p, 0.04)})`;
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current!;
    const viewport = viewportRef.current!;
    const track = trackRef.current!;

    // Desktop with motion allowed: pin the section and pan the slides sideways as the page scrolls.
    // Otherwise (phones, reduced motion) the track stays a native swipe carousel.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.scrollWidth - viewport.clientWidth;
      gsap.set(viewport, { overflow: "hidden" });
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setBar(self.progress),
        },
      });
    });
    return () => mm.revert();
  }, []);

  const onSwipe = () => {
    const v = viewportRef.current;
    if (v && v.scrollWidth > v.clientWidth) setBar(v.scrollLeft / (v.scrollWidth - v.clientWidth));
  };

  return (
    <section id="projects" ref={sectionRef} className="flex flex-col justify-center py-24 md:min-h-[100dvh] md:py-16">
      <div className={`mb-10 md:mb-12 ${EDGE}`}>
        <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-emerald-500 mb-4">Selected Works</h2>
        <h3 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Featured Projects</h3>
      </div>

      <div
        ref={viewportRef}
        onScroll={onSwipe}
        className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={trackRef} className={`flex w-max gap-5 md:gap-8 ${EDGE}`}>
          {RESUME_DATA.projects.map((project, idx) => (
            <article
              key={project.name}
              className="group grid w-[85vw] shrink-0 snap-center overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 md:w-[min(72vw,960px)] md:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950 md:aspect-auto md:min-h-[440px]">
                {project.image && (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 85vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-zinc-900/60" />
              </div>

              <div className="flex flex-col p-6 md:p-10">
                <p className="font-mono text-5xl font-semibold tracking-tighter text-zinc-800 md:text-7xl">
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <h4 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-3xl">
                  {project.name}
                </h4>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">{project.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.type.split(",").map((t) => {
                    const tech = t.trim();
                    const skill = skillsIn(tech)[0];
                    return skill ? (
                      <button
                        key={tech}
                        onClick={() => focusSkill(skill)}
                        title={`See ${skill} on the skill map`}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20 active:scale-[0.98]"
                      >
                        {tech}
                      </button>
                    ) : (
                      <span key={tech} className="rounded-lg border border-zinc-700 px-2.5 py-1 font-mono text-xs text-zinc-400">
                        {tech}
                      </span>
                    );
                  })}
                </div>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm font-semibold text-zinc-100 transition-colors hover:text-emerald-400"
                  >
                    View on GitHub
                    <ArrowUpRight weight="bold" className="h-4 w-4 transition-transform group-hover/link:rotate-45" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={`mt-8 ${EDGE}`}>
        <div className="h-px w-full max-w-xs overflow-hidden bg-zinc-800">
          <div ref={barRef} className="h-full origin-left scale-x-[0.04] bg-emerald-400" />
        </div>
      </div>
    </section>
  );
}
