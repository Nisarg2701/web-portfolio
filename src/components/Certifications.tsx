"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RESUME_DATA } from "@/data/resume";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function Certifications() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = gridRef.current?.querySelectorAll(".cert-card");
    if (!cards) return;

    cards.forEach((card, idx) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 60,
          rotateX: 8,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          delay: (idx % 3) * 0.12,
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" style={{ perspective: "1200px" }}>
      <div className="mb-20">
        <h2 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Certifications</h2>
        <p className="text-zinc-400 mt-4 text-lg max-w-xl leading-relaxed">
          Verified milestones in continuous learning.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESUME_DATA.certifications.map((cert, idx) => (
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            key={idx}
            className="cert-card group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-500 will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Image */}
            <div className="relative w-full aspect-[16/10] bg-zinc-950 overflow-hidden">
              {cert.image ? (
                <Image
                  src={cert.image}
                  alt={cert.name}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm">
                  No Image
                </div>
              )}

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 bg-zinc-950/70 backdrop-blur-sm border border-zinc-700/50 p-2.5 rounded-full opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <ArrowUpRight weight="bold" className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Text */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-mono text-emerald-500 text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {cert.year}
                </span>
                <span className="text-zinc-600 text-xs uppercase tracking-wider">
                  {cert.issuer}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-zinc-100 leading-snug mb-3 group-hover:text-emerald-300 transition-colors">
                {cert.name}
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed mt-auto">
                {cert.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
