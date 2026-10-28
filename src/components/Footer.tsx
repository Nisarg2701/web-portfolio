"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
import { OPEN_CONTACT } from "@/components/Navbar";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import { ArrowUpRight, GithubLogo, LinkedinLogo, EnvelopeSimple, Phone, DownloadSimple, FileText, X, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const GROUP_LABEL = "font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-3";

type ActionLinkProps = {
  href: string;
  icon: Icon;
  title: string;
  subtitle: string;
  accent?: boolean; // emerald styling for the resume actions
  newTab?: boolean;
  download?: string;
  className?: string;
};

function ActionLink({ href, icon: IconCmp, title, subtitle, accent, newTab, download, className = "" }: ActionLinkProps) {
  const tone = accent
    ? {
        card: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/50",
        badge: "bg-emerald-500/20 group-hover:bg-emerald-500/30",
        icon: "text-emerald-400",
        arrow: "text-emerald-500 group-hover:text-emerald-400",
      }
    : {
        card: "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600",
        badge: "bg-zinc-800 group-hover:bg-zinc-700",
        icon: "text-zinc-300",
        arrow: "text-zinc-600 group-hover:text-zinc-400",
      };

  return (
    <a
      href={href}
      download={download}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
      className={`group flex items-center gap-3 md:gap-4 p-3 md:p-5 rounded-2xl border transition-all ${tone.card} ${className}`}
    >
      <span className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${tone.badge}`}>
        <IconCmp weight="bold" className={`w-5 h-5 md:w-6 md:h-6 ${tone.icon}`} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-zinc-100 font-medium text-base md:text-lg">{title}</span>
        <span className="block truncate text-zinc-500 text-xs md:text-sm">{subtitle}</span>
      </span>
      <ArrowUpRight weight="bold" className={`shrink-0 w-4 h-4 md:w-5 md:h-5 transition-colors ${tone.arrow}`} />
    </a>
  );
}

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // the navbar's "Get In Touch" opens the same dialog
  useEffect(() => {
    const open = () => setIsModalOpen(true);
    window.addEventListener(OPEN_CONTACT, open);
    return () => window.removeEventListener(OPEN_CONTACT, open);
  }, []);

  // While open: lock page scroll, close on Escape, keep Tab inside the dialog, and give focus back on close.
  useEffect(() => {
    if (!isModalOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setIsModalOpen(false);
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [isModalOpen]);

  return (
    <>
      <footer id="contact" className="bg-emerald-500 text-zinc-950 py-32 px-6 mt-32 relative overflow-hidden">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-dialog-title"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md md:max-w-6xl max-h-[calc(100dvh-2rem)] md:max-h-none md:h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button
                ref={closeRef}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-zinc-50 transition-colors z-10 bg-zinc-900/80 p-2 rounded-full backdrop-blur"
              >
                <X weight="bold" className="w-6 h-6" />
              </button>

              {/* Left Side: PDF Viewer - Clean, no toolbar. Hidden on phones, which rarely render inline PDFs. */}
              <div className="hidden md:block md:flex-1 md:min-w-0 md:h-full bg-zinc-950 md:border-r border-zinc-800">
                <object
                  data="/Resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <p className="text-zinc-400 text-center p-8">Unable to display PDF. <a href="/Resume.pdf" className="text-emerald-400 underline" download>Download instead</a>.</p>
                </object>
              </div>

              {/* Right Side: Actions. min-h-0 lets it shrink and scroll; my-auto centres without clipping the top. */}
              <div className="flex-1 min-h-0 md:flex-none md:w-96 overflow-y-auto overscroll-contain p-6 md:p-8 lg:p-10 flex flex-col">
                <div className="my-auto">
                  <h3 id="contact-dialog-title" className="pr-12 text-2xl md:text-3xl font-semibold text-zinc-50 mb-2">Connect</h3>
                  <p className="pr-12 md:pr-0 text-sm md:text-base text-zinc-400 mb-6 md:mb-10">Download the full resume or reach out directly.</p>

                  <p className={GROUP_LABEL}>Resume</p>
                  <div className="flex flex-col gap-3">
                    <ActionLink href="/Resume.pdf" newTab icon={FileText} title="Open Resume" subtitle="View it in your browser" accent className="md:hidden" />
                    <ActionLink href="/Resume.pdf" download="Nisarg_Software_AIML_Resume.pdf" icon={DownloadSimple} title="Download PDF" subtitle="Save a local copy" accent />
                  </div>

                  <p className={`${GROUP_LABEL} mt-6`}>Reach out</p>
                  <div className="flex flex-col gap-3">
                    <ActionLink href={`mailto:${RESUME_DATA.personal.email}`} icon={EnvelopeSimple} title="Send an Email" subtitle={RESUME_DATA.personal.email} />
                    <ActionLink href={`tel:${RESUME_DATA.personal.phone.replace(/\s+/g, "")}`} icon={Phone} title="Call Me" subtitle={RESUME_DATA.personal.phone} />
                    <ActionLink href={WHATSAPP_URL} newTab icon={WhatsappLogo} title="WhatsApp" subtitle="Message me directly" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
