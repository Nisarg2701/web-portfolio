"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
import { ArrowUpRight, GithubLogo, LinkedinLogo, EnvelopeSimple, Phone, DownloadSimple, X } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-emerald-500 text-zinc-950 py-32 px-6 mt-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-semibold tracking-tighter leading-none mb-12"
          >
            Let&apos;s build <br/> something real.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-4 bg-zinc-950 text-zinc-50 px-8 py-5 rounded-full text-xl font-medium tracking-wide transition-transform hover:scale-105 active:scale-95"
            >
              Get In Touch
              <ArrowUpRight weight="bold" className="w-6 h-6 group-hover:rotate-45 transition-transform" />
            </button>
          </motion.div>

          <div className="mt-24 w-full flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 pt-8 font-medium">
            <a href={RESUME_DATA.personal.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-zinc-900 transition-colors text-lg">
              <LinkedinLogo weight="duotone" className="w-6 h-6" />
              LinkedIn
            </a>
            <a href={RESUME_DATA.personal.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-zinc-900 transition-colors text-lg">
              <GithubLogo weight="duotone" className="w-6 h-6" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Get In Touch Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-50 transition-colors z-10 bg-zinc-900/80 p-2 rounded-full backdrop-blur"
              >
                <X weight="bold" className="w-6 h-6" />
              </button>

              {/* Left Side: PDF Viewer - Clean, no toolbar */}
              <div className="w-full md:w-2/3 h-1/2 md:h-full bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800">
                <object
                  data="/Resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <p className="text-zinc-400 text-center p-8">Unable to display PDF. <a href="/Resume.pdf" className="text-emerald-400 underline" download>Download instead</a>.</p>
                </object>
              </div>

              {/* Right Side: Actions */}
              <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                <h3 className="text-3xl font-semibold text-zinc-50 mb-2">Connect</h3>
                <p className="text-zinc-400 mb-12">Download the full resume or reach out directly.</p>

                <div className="flex flex-col gap-4">
                  <a 
                    href="/Resume.pdf"
                    download="Nisarg_Software_AIML_Resume.pdf"
                    className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/50 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                        <DownloadSimple weight="bold" className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-zinc-100 font-medium text-lg">Download PDF</p>
                        <p className="text-zinc-500 text-sm">Save a local copy</p>
                      </div>
                    </div>
                    <ArrowUpRight weight="bold" className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  </a>

                  <a 
                    href={`mailto:${RESUME_DATA.personal.email}`}
                    className="flex items-center justify-between p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 group transition-all mt-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                        <EnvelopeSimple weight="bold" className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div className="text-left">
                        <p className="text-zinc-100 font-medium text-lg">Send an Email</p>
                        <p className="text-zinc-500 text-sm">{RESUME_DATA.personal.email}</p>
                      </div>
                    </div>
                    <ArrowUpRight weight="bold" className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </a>

                  <a 
                    href={`tel:${RESUME_DATA.personal.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-between p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                        <Phone weight="bold" className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div className="text-left">
                        <p className="text-zinc-100 font-medium text-lg">Call Me</p>
                        <p className="text-zinc-500 text-sm">{RESUME_DATA.personal.phone}</p>
                      </div>
                    </div>
                    <ArrowUpRight weight="bold" className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
