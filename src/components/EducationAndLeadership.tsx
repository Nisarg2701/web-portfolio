"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { RESUME_DATA } from "@/data/resume";
import { GraduationCap, GlobeHemisphereWest, Lightning } from "@phosphor-icons/react/dist/ssr";

function AnimatedScore({ value }: { value: string }) {
  const target = parseFloat(value) || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 1.5, ease: "easeOut" });
    }
  }, [count, isInView, target]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function EducationAndLeadership() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-20 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-semibold text-zinc-50 tracking-tighter">Background</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Education Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-10 md:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
        >
          <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <GraduationCap weight="fill" className="w-96 h-96 text-zinc-100" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <GraduationCap weight="duotone" className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-100">Education</h3>
          </div>

          <div className="relative z-10 space-y-8">
            {RESUME_DATA.education.map((edu: Record<string, string>, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-emerald-500 text-sm mb-3 bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
                    Class of {edu.year.split('/')[1] || edu.year}
                  </p>
                  <h4 className="text-3xl md:text-4xl font-semibold text-zinc-50 mb-2">{edu.degree}</h4>
                  <p className="text-xl text-zinc-400">{edu.institution}</p>
                </div>
                <div className="bg-zinc-950 px-6 py-4 rounded-2xl border border-zinc-800/80 shrink-0">
                  <p className="text-zinc-500 text-sm mb-1 uppercase tracking-widest font-medium">Score</p>
                  <p className="text-2xl font-mono text-emerald-400">
                    <AnimatedScore value={edu.score.replace('CGPA: ', '')} /> <span className="text-zinc-600 text-lg">CGPA</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Languages Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] p-10 md:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <GlobeHemisphereWest weight="duotone" className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-100">Languages</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
            {RESUME_DATA.languages.map((lang: Record<string, string>, idx: number) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-xl font-medium text-zinc-50">{lang.name}</span>
                <span className="text-emerald-500/80 text-sm tracking-wide">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leadership Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-10 md:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-8 lg:gap-16">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <Lightning weight="duotone" className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-100">Leadership</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-10 mt-2 md:mt-0">
              {RESUME_DATA.leadership.map((item: string, idx: number) => (
                <div key={idx} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-300 text-lg leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
