"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RESUME_DATA } from "@/data/resume";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function ProjectsList() {
  const containerRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Parallax on images
    projectRefs.current.forEach((el) => {
      if (!el) return;
      const img = el.querySelector(".parallax-img");
      const textBlock = el.querySelector(".parallax-text");
      
      if (img) {
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (textBlock) {
        gsap.fromTo(
          textBlock,
          { opacity: 0, y: 50 },
          {
            opacity: 1, 
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-32 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Selected Works</h2>
      </div>

      <div className="flex flex-col gap-32">
        {RESUME_DATA.projects.map((project, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div 
              key={idx} 
              ref={(el) => {
                projectRefs.current[idx] = el;
              }}
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 lg:gap-24 overflow-hidden`}
            >
              {/* Image Section */}
              <div className="w-full md:w-3/5">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="parallax-img object-cover scale-125 origin-center transition-transform duration-1000 group-hover:scale-[1.35]"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono">
                      Image Missing
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                </div>
              </div>

              {/* Text Section */}
              <div className="parallax-text w-full md:w-2/5 flex flex-col items-start relative z-10">
                <p className="font-mono text-emerald-500 text-sm mb-4 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {project.type}
                </p>
                <h3 className="text-3xl lg:text-5xl font-semibold text-zinc-50 mb-6 leading-tight">
                  {project.name}
                </h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  {project.description}
                </p>
                
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-zinc-50 font-medium pb-2 border-b border-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    View Project
                    <ArrowUpRight weight="bold" className="w-5 h-5 group-hover:rotate-45 group-hover:-translate-y-1 transition-all" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
