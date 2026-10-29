"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { RESUME_DATA } from "@/data/resume";
import { OPEN_CONTACT } from "@/components/layout/Navbar";
import { WHATSAPP_URL } from "@/components/layout/WhatsApp";
import { ResumeViewer } from "@/components/layout/ResumeViewer";
import { ArrowUpRight, Check, Copy, GithubLogo, LinkedinLogo, EnvelopeSimple, Phone, DownloadSimple, FileText, X, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const RESUME_FILE = "Nisarg_Software_AIML_Resume.pdf";
const { email, phone, linkedin, github, role, location } = RESUME_DATA.personal;

type Contact = { icon: Icon; label: string; value: string; href: string; copy?: boolean; newTab?: boolean };
const CONTACTS: Contact[] = [
  { icon: EnvelopeSimple, label: "Email", value: email, href: `mailto:${email}`, copy: true },
  { icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/\s+/g, "")}`, copy: true },
  { icon: WhatsappLogo, label: "WhatsApp", value: "Message me directly", href: WHATSAPP_URL, newTab: true },
  { icon: LinkedinLogo, label: "LinkedIn", value: "in/nisarg-pakhawala", href: linkedin, newTab: true },
  { icon: GithubLogo, label: "GitHub", value: github.replace("https://github.com/", "@"), href: github, newTab: true },
];

const PILL = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98]";

/** One hairline row: the row opens the link; email and phone also get a copy button beside it. */
function ContactRow({ icon: IconCmp, label, value, href, copy, newTab }: Contact) {
  const [copied, setCopied] = useState(false);
  const onCopy = () =>
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}, // clipboard blocked: the row link still works
    );
  return (
    <li className="group flex items-center">
      <a
        href={href}
        {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
        className="flex min-w-0 flex-1 items-center gap-3.5 px-4 py-3 transition-colors hover:bg-zinc-800/50"
      >
        <IconCmp className="h-5 w-5 shrink-0 text-zinc-400 transition-colors group-hover:text-emerald-400" />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
          <span className="block truncate text-sm text-zinc-100">{value}</span>
        </span>
        {!copy && <ArrowUpRight weight="bold" className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300" />}
      </a>
      {copy && (
        <button
          onClick={onCopy}
          aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
          title={copied ? "Copied" : "Copy"}
          className="mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
        >
          {copied ? <Check weight="bold" className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </li>
  );
}

export function Footer() {
  const reduce = useReducedMotion();
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
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="relative flex w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50 md:max-w-6xl md:h-[min(90vh,860px)]"
            >
              <ResumeViewer file={RESUME_FILE} />

              {/* Contact panel. min-h-0 lets it shrink and scroll on very short screens. */}
              <div className="relative flex min-h-0 w-full flex-col overflow-y-auto overscroll-contain p-6 md:w-[380px] md:shrink-0 md:p-8">
                <button
                  ref={closeRef}
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close dialog"
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-50 md:right-5 md:top-5"
                >
                  <X weight="bold" className="h-5 w-5" />
                </button>

                {/* my-auto centres the block in the tall desktop panel without clipping it on short screens */}
                <div className="my-auto">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">Contact</p>
                  <h3 id="contact-dialog-title" className="mt-2 pr-10 text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
                    Get in touch
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    {role}, based in {location.replace(/\s*\d+$/, "")}.
                  </p>

                  <ul className="mt-6 divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40">
                    {CONTACTS.map((c) => (
                      <ContactRow key={c.label} {...c} />
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2.5">
                    <a
                      href="/Resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${PILL} flex-1 border border-zinc-700 text-zinc-100 hover:border-zinc-500 md:hidden`}
                    >
                      <FileText weight="bold" className="h-4 w-4" />
                      View resume
                    </a>
                    <a href="/Resume.pdf" download={RESUME_FILE} className={`${PILL} flex-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400`}>
                      <DownloadSimple weight="bold" className="h-4 w-4" />
                      <span className="md:hidden">Download</span>
                      <span className="hidden md:inline">Download resume</span>
                    </a>
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
