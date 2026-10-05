"use client";

import { RESUME_DATA } from "@/data/resume";

export function BentoGrid() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold text-zinc-50 tracking-tighter">Technical Arsenal</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grid-flow-dense auto-rows-[300px]">
        
        {/* Box 1: Mobile & Edge */}
        <div className="md:col-span-5 md:row-span-2 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="relative z-10 mb-8">
            <h3 className="text-3xl font-semibold text-zinc-50 mb-4">Mobile & Edge</h3>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              Architecting modular, highly scalable Android applications serving thousands of daily users.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap gap-3">
            {RESUME_DATA.skills.mobile.map(s => (
              <span key={s} className="px-4 py-2 bg-zinc-950/50 text-zinc-300 text-sm font-medium rounded-xl border border-zinc-700/50 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Box 2: AI & GenAI Systems */}
        <div className="md:col-span-7 md:row-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-2xl font-semibold text-emerald-400 mb-6 relative z-10">AI & GenAI Systems</h3>
          <div className="flex flex-wrap gap-3 relative z-10">
            {RESUME_DATA.skills.ai.map(s => (
              <span key={s} className="px-4 py-2 bg-emerald-500/10 text-emerald-300 text-sm font-medium rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Box 3: Backend & Databases */}
        <div className="md:col-span-4 md:row-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-center group">
          <h3 className="text-xl font-semibold text-zinc-50 mb-6">Backend & Data</h3>
          <div className="flex flex-wrap gap-2">
            {[...RESUME_DATA.skills.backend, ...RESUME_DATA.skills.databases].map(s => (
              <span key={s} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-mono rounded-lg border border-zinc-700 hover:text-zinc-200 transition-colors">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Box 4: Cloud & Tools */}
        <div className="md:col-span-3 md:row-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-center">
          <h3 className="text-xl font-semibold text-zinc-50 mb-6">Infrastructure</h3>
          <div className="flex flex-col gap-3 font-mono text-sm text-emerald-500/80">
            {RESUME_DATA.skills.tools.map(s => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                {s}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
