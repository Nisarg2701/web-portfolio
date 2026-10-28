"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { WhatsappLogo, X } from "@phosphor-icons/react/dist/ssr";
import { RESUME_DATA } from "@/data/resume";

// public/whatsapp-qr.svg encodes this same link; regenerate it if the phone number changes
export const WHATSAPP_URL = `https://wa.me/${RESUME_DATA.personal.phone.replace(/\D/g, "")}`;

/** Floating WhatsApp button. Desktop: opens a card with a QR to scan plus a chat button. Phones: opens WhatsApp directly. */
export function WhatsApp() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!cardRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia("(min-width: 768px)").matches) return; // phones follow the link
    e.preventDefault();
    setOpen((o) => !o);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8">
      {open && (
        <div
          ref={cardRef}
          role="dialog"
          aria-label="Chat on WhatsApp"
          className="absolute bottom-16 right-0 w-64 rounded-2xl border border-emerald-500/25 bg-zinc-900/95 p-5 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.45)] backdrop-blur-xl"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1 text-zinc-500 transition-colors hover:text-zinc-50"
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">WhatsApp</p>
          <p className="mt-1 text-sm text-zinc-400">Scan with your phone</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, nothing to optimise */}
          <img
            src="/whatsapp-qr.svg"
            alt={`QR code for WhatsApp chat with ${RESUME_DATA.personal.phone}`}
            width={200}
            height={200}
            className="mt-4 w-full rounded-xl bg-zinc-50 p-3"
          />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            <WhatsappLogo weight="bold" className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      )}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-label="Chat on WhatsApp"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 ring-4 ring-zinc-950/70 shadow-[0_8px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-95"
      >
        <WhatsappLogo weight="fill" className="h-6 w-6" />
      </a>
    </div>
  );
}
