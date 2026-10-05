"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { RESUME_DATA } from "@/data/resume";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-16 lg:gap-24">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-8"
          >
            {RESUME_DATA.personal.role}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-5xl md:text-7xl lg:text-[5.5rem] tracking-tighter leading-[1.05] font-semibold text-zinc-50"
          >
            Building scalable systems &<br />
            <span className="text-emerald-500 italic pr-2">intelligent</span> integrations.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Software Developer with 3 years of experience. Specializing in scalable architecture, applied AI/ML, and intelligent integrations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <a
              href="#experience"
              className="group relative inline-flex items-center justify-center gap-3 bg-emerald-500 text-zinc-950 px-8 py-4 rounded-full font-medium tracking-wide overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">View Selected Work</span>
              <ArrowRight weight="bold" className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-emerald-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </a>
          </motion.div>
        </div>

        {/* Right: Profile Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-64 h-64 md:w-[400px] md:h-[500px] shrink-0"
        >
          <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent rounded-[2rem] blur-sm" />
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl shadow-emerald-500/10">
            <Image
              src="/images/profile.jpg"
              alt="Nisarg Pakhawala"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 256px, 400px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
