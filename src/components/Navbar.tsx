"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUp, List, X } from "@phosphor-icons/react/dist/ssr";
import { RESUME_DATA } from "@/data/resume";
import logo from "@/app/icon.jpg";

const LINKS = [
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Connect" },
];

// the footer listens for this and opens its contact dialog
export const OPEN_CONTACT = "open-contact";

const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

// glide to a section instead of the browser's instant anchor jump (scroll-padding-top keeps it below the bar)
const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: smooth(), block: "start" });
  history.replaceState(null, "", `#${id}`);
};

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // hide while scrolling down past the hero, come back on any scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(y - prev) > 2) setHidden(y > prev && y > window.innerHeight * 0.6);
  });

  // highlight the section that covers the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const id of [...LINKS.map((l) => l.id), "intro"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const contact = () => {
    setOpen(false);
    window.dispatchEvent(new Event(OPEN_CONTACT));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 px-4 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden && !open ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto max-w-6xl rounded-2xl border border-emerald-500/25 bg-zinc-900/75 shadow-[0_8px_40px_-12px_rgba(16,185,129,0.35)] backdrop-blur-xl"
      >
        <div className="flex h-14 items-center justify-between gap-4 pl-3 pr-2 md:h-16 md:pl-4">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              window.scrollTo({ top: 0, behavior: smooth() });
            }}
            className="group flex items-center gap-3 rounded-xl"
          >
            <Image
              src={logo}
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9 rounded-xl ring-1 ring-emerald-500/40 transition-transform group-hover:-rotate-6"
            />
            <span className="hidden font-semibold tracking-tight text-zinc-50 sm:block">{RESUME_DATA.personal.name}</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => goTo(e, l.id)}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
                    active === l.id ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400 hover:text-zinc-50"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={contact}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
            >
              Get In Touch
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 hover:bg-zinc-800 lg:hidden"
            >
              {open ? <X weight="bold" className="h-5 w-5" /> : <List weight="bold" className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <ul id="mobile-nav" className="grid gap-1 border-t border-zinc-800 p-2 lg:hidden">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    setOpen(false);
                    goTo(e, l.id);
                  }}
                  className={`block rounded-xl px-4 py-3 text-base ${
                    active === l.id ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  // sits above the WhatsApp button

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > window.innerHeight));

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: smooth() })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-[5.25rem] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-zinc-950/90 text-emerald-400 shadow-[0_8px_30px_-8px_rgba(16,185,129,0.5)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-zinc-950 active:scale-95 md:bottom-[6.25rem] md:right-8 ${
        show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp weight="bold" className="h-5 w-5" />
    </button>
  );
}
