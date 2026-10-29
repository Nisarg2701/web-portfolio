"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowSquareOut, FileText, Minus, Plus } from "@phosphor-icons/react/dist/ssr";

const MIN = 0.5;
const MAX = 2.5; // the image is 1700px wide, so ~2.2x of the 760px page is still sharp
const clamp = (z: number) => Math.min(MAX, Math.max(MIN, z));
const ICON_BTN =
  "grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent";

/** The resume image (rendered from the PDF by .agents/scripts/render_resume.py) under a toolbar of our own.
 *  Zoom: trackpad pinch (ctrl+wheel, or Safari's gesture events), two-finger pinch on touch, or the +/- buttons. */
export function ResumeViewer({ file }: { file: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  // the point (in content px, and on screen) that should stay under the fingers/cursor after a zoom
  const anchor = useRef<{ x: number; y: number; sx: number; sy: number; from: number } | null>(null);
  const zoomRef = useRef(zoom); // for the native listeners, which are attached once

  const zoomTo = (next: number, clientX?: number, clientY?: number) => {
    const el = scroller.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sx = (clientX ?? r.left + r.width / 2) - r.left;
    const sy = (clientY ?? r.top + r.height / 2) - r.top;
    setZoom((z) => {
      const n = clamp(next > 0 ? next : z * -next); // negative = relative factor
      anchor.current = { x: el.scrollLeft + sx, y: el.scrollTop + sy, sx, sy, from: z };
      return n;
    });
  };

  // keep the anchored point in place once the new size has laid out
  useLayoutEffect(() => {
    zoomRef.current = zoom;
    const el = scroller.current;
    const a = anchor.current;
    if (!el || !a) return;
    const f = zoom / a.from;
    el.scrollLeft = a.x * f - a.sx;
    el.scrollTop = a.y * f - a.sy;
    anchor.current = null;
  }, [zoom]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // trackpad pinch arrives as ctrl+wheel in Chrome/Edge/Firefox; without preventDefault the page itself zooms
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      // trackpads send small deltas; a mouse wheel with ctrl sends ~100 per notch, capped so one notch is ~25%
      zoomTo(-Math.exp(-Math.max(-22, Math.min(22, e.deltaY)) * 0.01), e.clientX, e.clientY);
    };
    // Safari (macOS) sends gesture events for trackpad pinch instead
    let gestureStart = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gestureStart = zoomRef.current;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as Event & { scale: number; clientX: number; clientY: number };
      zoomTo(clamp(gestureStart * g.scale), g.clientX, g.clientY);
    };
    // two-finger pinch on touch screens (tablets, touch laptops)
    const touches = new Map<number, { x: number; y: number }>();
    let pinch: { dist: number; zoom: number } | null = null;
    const dist = () => {
      const [a, b] = [...touches.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) pinch = { dist: dist(), zoom: zoomRef.current };
    };
    const onMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!pinch || touches.size !== 2) return;
      const [a, b] = [...touches.values()];
      zoomTo(clamp((pinch.zoom * dist()) / pinch.dist), (a.x + b.x) / 2, (a.y + b.y) / 2);
    };
    const onUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = null;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGestureStart);
    el.addEventListener("gesturechange", onGestureChange);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGestureStart);
      el.removeEventListener("gesturechange", onGestureChange);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="hidden min-w-0 flex-1 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800/80 px-5">
        <FileText className="h-5 w-5 shrink-0 text-emerald-400" />
        <span className="truncate font-mono text-xs text-zinc-300">{file}</span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 lg:inline">1 page</span>

        <div className="ml-auto flex items-center gap-0.5 rounded-full border border-zinc-800 p-0.5">
          <button onClick={() => zoomTo(-1 / 1.25)} disabled={zoom <= MIN} aria-label="Zoom out" className={ICON_BTN}>
            <Minus weight="bold" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => zoomTo(1)}
            aria-label="Reset zoom"
            title="Reset zoom"
            className="w-12 rounded-full py-1 text-center font-mono text-[11px] tabular-nums text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => zoomTo(-1.25)} disabled={zoom >= MAX} aria-label="Zoom in" className={ICON_BTN}>
            <Plus weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>
        <a
          href="/Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in new tab"
          title="Open in new tab"
          className={ICON_BTN}
        >
          <ArrowSquareOut className="h-4 w-4" />
        </a>
      </div>

      {/* touch-action keeps one-finger panning native but stops the browser zooming the whole page on pinch */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 py-8 [touch-action:pan-x_pan-y] lg:px-10">
        <div className="mx-auto" style={{ width: `calc(min(760px, 100%) * ${zoom})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- one fixed image, nothing for next/image to do */}
          <img
            src="/resume-preview.webp"
            width={1700}
            height={2200}
            alt="Resume of Nisarg Pakhawala"
            draggable={false}
            className="h-auto w-full select-none rounded-md shadow-2xl shadow-black/60 ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>
  );
}
