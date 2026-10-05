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
    
    projectRefs.current.forEach((el) => {
      if (!el) return;
      
      const imgContainer = el.querySelector(".img-container");
      const img = el.querySelector("img");
      const textCard = el.querySelector(".text-card");
      
      if (imgContainer) {
        gsap.fromTo(imgContainer, 
          { clipPath: "inset(10% 10% 10% 10% round 2rem)", scale: 0.95 },
          { 
            clipPath: "inset(0% 0% 0% 0% round 2rem)", 
            scale: 1,
            duration: 1.5, 
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      if (img) {
        gsap.set(img, { yPercent: -10 });
        gsap.to(img, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (textCard) {
        gsap.fromTo(textCard,
          { opacity: 0, y: 40, backdropFilter: "blur(0px)" },
          {
            opacity: 1,
            y: 0,
            backdropFilter: "blur(16px)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
            delay: 0.2
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
      <div className="mb-24 text-center md:text-left">
        <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-emerald-500 mb-4">Selected Works</h2>
        <h3 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Featured Projects</h3>
      </div>

      <div className="flex flex-col gap-32">
        {RESUME_DATA.projects.map((project, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div 
              key={idx} 
              ref={(el) => { projectRefs.current[idx] = el; }}
              className="relative w-full min-h-[500px] flex items-center"
            >
              {/* Massive Background Image Container */}
              <div className={`img-container absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-full lg:w-[70%] h-[350px] lg:h-[450px] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20 opacity-90 z-10 pointer-events-none" />
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover scale-125 origin-center"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-sm">
                    No Image Provided
                  </div>
                )}
              </div>

              {/* Floating Glassmorphic Text Card */}
              <div className={`text-card relative z-20 w-[90%] md:w-2/3 lg:w-[45%] mx-auto lg:mx-0 ${isEven ? 'lg:mr-auto' : 'lg:ml-auto'} mt-[250px] lg:mt-0 bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-[2rem] p-8 md:p-12 shadow-2xl transition-colors duration-500`}>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-mono text-emerald-400 text-xs tracking-widest uppercase">
                    {project.type}
                  </p>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                </div>

                <h3 className="text-3xl lg:text-4xl font-semibold text-zinc-50 mb-6 leading-tight">
                  {project.name}
                </h3>
                
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8">
                  {project.description}
                </p>
                
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 bg-zinc-100 text-zinc-950 px-6 py-3 rounded-full font-medium tracking-wide transition-all hover:bg-emerald-500"
                  >
                    <span>View Project</span>
                    <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform group-hover:rotate-45" />
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
