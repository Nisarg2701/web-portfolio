"use client";

import { motion } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
import { HeroCharacter } from "@/components/HeroCharacter";

const EASE = [0.16, 1, 0.3, 1] as const;
const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

export function Hero() {
  const [first, ...rest] = RESUME_DATA.personal.name.split(" ");

  return (
    <>
      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-16">
          {/* Left: greeting */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-8"
            >
              Hey there!
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
              className="text-balance text-5xl md:text-6xl xl:text-7xl tracking-tighter leading-[1.05] font-semibold text-zinc-50"
            >
              I&apos;m <span className="text-emerald-500 italic pr-2">{first}</span> {rest.join(" ")}.
            </motion.h1>
          </div>

          {/* Right: interactive character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            className="relative mt-8 w-full max-w-md md:mt-0 md:w-[48%] md:max-w-[640px] shrink-0"
          >
            <HeroCharacter scrollTo="intro" />
          </motion.div>
        </div>
      </section>

      {/* What he points down to: revealed as it scrolls in */}
      <motion.section
        id="intro"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ staggerChildren: 0.14 }}
        className="relative min-h-[80dvh] flex items-center px-6 py-32"
      >
        <div className="max-w-5xl mx-auto w-full">
          <motion.div
            variants={reveal}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-8"
          >
            {RESUME_DATA.personal.role}
          </motion.div>

          <motion.h2
            variants={reveal}
            className="text-balance text-5xl md:text-6xl xl:text-7xl tracking-tighter leading-[1.05] font-semibold text-zinc-50"
          >
            Building scalable systems &{" "}
            <span className="text-emerald-500 italic pr-2">intelligent</span> integrations.
          </motion.h2>

          <motion.p variants={reveal} className="mt-8 text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Software Developer with {RESUME_DATA.personal.yearsOfExperience} of experience. Specializing in scalable architecture, applied AI/ML, and
            intelligent integrations.
          </motion.p>
        </div>
      </motion.section>
    </>
  );
}
