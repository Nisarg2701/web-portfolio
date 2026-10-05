"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RESUME_DATA } from "@/data/resume";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function Certifications() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = listRef.current?.querySelectorAll(".cert-row-card");
    if (!cards) return;

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section className="py-32 px-6 max-w-5xl mx-auto">
      <div className="mb-20 text-center">
        <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-emerald-500 mb-4">Verified Milestones</h2>
        <h3 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Featured Certifications</h3>
      </div>

      <div ref={listRef} className="flex flex-col gap-8">
        {RESUME_DATA.certifications.map((cert, idx) => (
          <div
            key={idx}
            className="cert-row-card group flex flex-col md:flex-row bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-emerald-500/30 transition-colors duration-500"
          >
            {/* Left: Text Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-emerald-500 text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {cert.year}
                </span>
                <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">
                  {cert.issuer}
                </span>
              </div>

              <h4 className="text-2xl md:text-3xl font-semibold text-zinc-100 leading-tight mb-4 group-hover:text-emerald-300 transition-colors">
                {cert.name}
              </h4>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                    {cert.description}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-zinc-100 text-zinc-950 px-6 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-emerald-500 transition-colors"
                >
                  View Credential
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right: Image Content */}
            <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full bg-zinc-950 p-6 md:p-8 flex items-center justify-center">
              {/* Radial gradient glow behind image */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
              
              {/* Image Container with tight rounded corners to look like a frame/device */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                {cert.image ? (
                  <Image
                    src={cert.image}
                    alt={cert.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm">
                    No Image Provided
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
