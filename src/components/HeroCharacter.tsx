"use client";

import { useEffect, useRef, useState } from "react";

const FPS = 12; // the source clip was cut at 12fps
const HOLD = 30; // ~2.5s glance hold, in frames
// phones get an 800px-wide copy (public/hero-frames/sm): far less to download and decode
const src = (n: number, small = false) =>
  `/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
// frames are kept in Cache Storage too, so repeat visits don't depend on the browser's HTTP cache
// (bump the version whenever the frames change; older caches are deleted)
const CACHE = "hero-frames-v1";
const POOL = 6; // parallel downloads
const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// Frame map of the clip (see public/hero-frames): 1-14 working; 14-43 is one continuous take
// (turn screen-left, peak ~22 -> back to center with a blink ~30 -> turn screen-right, peak ~38);
// 44-112 notice -> headset off -> wave -> point down (the clip lifts and points again from 115, so it stops at 112).
const L = 22;
const R = 38;
const BLINK = 30;
const IDLE = [...range(14, 1), ...range(2, 13)]; // starts at 14, where the glances hand back
const END = 112;
const GREET = range(44, END);
const DONE = [...range(END, 100), ...range(101, END - 1)]; // rests within the held point
// Generated bridge clips, stored after the main clip: 121-138 working -> start of the right turn
// (flows into 32), 139-174 left glance (flows on from 22) -> smiling at the viewer (flows into 47).
const B1 = range(121, 138);
const B2 = range(139, 174);
// joins that are continuous even though the frame numbers jump
const SEAMLESS = new Set(["138>32", "32>138", "22>139", "174>47"]);
const isJump = (a: number, b: number) => Math.abs(a - b) > 6 && !SEAMLESS.has(`${a}>${b}`);

// The camera slowly pulls back through the clip, so at a cut the new frame is a bit smaller.
// [from, to, scale, dx, dy]: drawing `to` as scale*p + (dx, dy) lines it up with `from`
// (fitted on the whole figure; working frames 1-14 share frame 14's geometry).
const S14_30 = 1.0374;
const WARPS: [number, number, number, number, number][] = [
  [14, BLINK, S14_30, -15.0, -8.6],
  [BLINK, 14, 1 / S14_30, 15.0 / S14_30, 8.6 / S14_30], // exact inverse, so there-and-back matches
  [BLINK, 47, 1.0336, -27.3, -18.0],
  // bridge joins (fitted on the exported cutouts)
  [14, 121, 1.0106, -8.6, -7.4],
  [121, 14, 1 / 1.0106, 8.6 / 1.0106, 7.4 / 1.0106],
  [138, 32, 1.0052, -3.2, -3.0],
  [32, 138, 1 / 1.0052, 3.2 / 1.0052, 3.0 / 1.0052],
  [174, 47, 1.0085, -6.0, -4.4],
];
const warpFor = (a: number, b: number) =>
  WARPS.find(([from, to]) => Math.abs(from - Math.max(a, 14)) <= 6 && Math.abs(to - b) <= 6);

type Zone = "left" | "center" | "right";
type Mode = "idle" | "left" | "right" | "greet" | "done";

const MESSAGES: Partial<Record<Mode, string>> = {
  left: "Anyone here on the left?",
  right: "Anyone here on the right?",
};

/** `scrollTo`: id of the element to glide to once the greeting finishes (first time only). */
export function HeroCharacter({ scrollTo }: { scrollTo?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  // a plain <img> of the first frame shows until the canvas draws, so something is there even
  // when scripts or canvas fail (e.g. proxy browsers like Opera Mini)
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = coarse || window.innerWidth < 768;
    const frames: HTMLImageElement[] = [];
    const failed = new Set<number>();
    const pending = new Map<number, Promise<void>>();
    const urls: string[] = [];
    let cancelled = false;

    const store = "caches" in window ? caches.open(CACHE).catch(() => null) : Promise.resolve(null);
    if ("caches" in window)
      caches
        .keys()
        .then((ks) => ks.forEach((k) => k.startsWith("hero-frames-") && k !== CACHE && caches.delete(k)))
        .catch(() => {});
    const fetchFrame = async (url: string) => {
      const c = await store;
      let res = await c?.match(url).catch(() => undefined);
      if (!res) {
        res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        c?.put(url, res.clone()).catch(() => {}); // quota or private mode: just skip caching
      }
      const blobUrl = URL.createObjectURL(await res.blob());
      urls.push(blobUrl);
      const img = new Image();
      await new Promise((ok, err) => {
        img.onload = ok;
        img.onerror = err;
        img.src = blobUrl;
      });
      return img;
    };
    // a frame that won't load is retried, then skipped, so the animation never stalls on it
    const load = (n: number) => {
      if (!pending.has(n))
        pending.set(
          n,
          (async () => {
            for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
              try {
                frames[n] = await fetchFrame(src(n, small));
                return;
              } catch {
                await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
              }
            }
            failed.add(n);
          })(),
        );
      return pending.get(n)!;
    };
    const ready = (n: number) => !!frames[n];
    // load a batch a few at a time; resolves once every frame in it has arrived (or given up)
    const loadAll = async (ns: number[]) => {
      const queue = [...ns];
      await Promise.all(
        Array.from({ length: POOL }, async () => {
          while (queue.length && !cancelled) await load(queue.shift()!);
        }),
      );
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      load(1).then(() => {
        if (!frames[1]) return;
        ctx.drawImage(frames[1], 0, 0, canvas.width, canvas.height);
        setStarted(true);
      });
      return () => {
        cancelled = true;
        urls.forEach((u) => URL.revokeObjectURL(u));
      };
    }

    let mode: Mode = "idle";
    let list = IDLE;
    let i = 0;
    let shown = 0;
    let fadeFrom: HTMLImageElement | null = null;
    let fadeStart = 0;
    type Xf = { s: number; dx: number; dy: number };
    let warp: (Xf & { start: number }) | null = null;
    let fadeXf: Xf = { s: 1, dx: 0, dy: 0 };
    // the size correction in effect right now (eases from the cut's match back to the frame's own size)
    const current = (now: number): Xf => {
      if (!warp) return { s: 1, dx: 0, dy: 0 };
      const k = Math.min((now - warp.start) / 600, 1);
      const e = 1 - (1 - k) ** 3;
      return { s: warp.s + (1 - warp.s) * e, dx: warp.dx * (1 - e), dy: warp.dy * (1 - e) };
    };
    let last = 0;
    let raf = 0;

    const setMode = (next: Mode, path?: number[]) => {
      mode = next;
      list = path ?? { idle: IDLE, left: IDLE, right: IDLE, greet: GREET, done: DONE }[next];
      i = 0;
      // "done" keeps the last greeting line on screen
      if (next === "done") return;
      setMessage(next === "greet" ? "Hey, it's you!" : next === "idle" && coarse ? "Tap me" : MESSAGES[next] ?? null);
    };

    // Moves glide frame by frame from wherever he is: along the 14-43 take (so right -> left passes
    // back through center) and through the bridge clips, which join it without a cut.
    const onTake = () => shown > 14 && shown <= 43;
    const inB1 = () => shown >= 121 && shown <= 138;
    const glance = (side: "left" | "right") => {
      const peak = side === "left" ? L : R;
      const there =
        side === "left"
          ? inB1()
            ? [...range(shown, 121), ...range(14, L)] // back out of the bridge, then turn left
            : range(shown >= 1 && shown <= 14 ? shown : 14, L) // working runs straight into the left turn
          : inB1()
            ? [...range(shown, 138), ...range(32, R)]
            : onTake()
              ? range(shown, R)
              : [...B1, ...range(32, R)]; // working -> bridge 1 -> right turn
      const home = side === "left" ? range(L, 14) : [...range(R, 32), ...range(138, 121)];
      return [...there, ...Array(HOLD).fill(peak), ...home];
    };
    const greeting = () => {
      // right side: the take itself carries on into the greeting
      if (inB1()) return [...range(shown, 138), ...range(32, 43), ...GREET];
      if (shown >= BLINK && shown <= 43) return [...range(shown, 43), ...GREET];
      // left side: back to the glance, then bridge 2 turns him to the viewer and into the greeting
      if (onTake()) return [...range(shown, L), ...B2, ...range(47, END)];
      // from working he sits up for the greeting, which no size match hides, so he blinks into it
      return [BLINK, BLINK, BLINK, ...range(47, END)];
    };

    // `tap`: a deliberate click/tap, which can also restart him after the greeting. Resting the
    // cursor on the middle after the greeting would just loop it, so hover only wakes him with a glance.
    const enter = (zone: Zone, tap = false) => {
      if (mode === "greet") return;
      if (mode === "done" && zone === "center" && !tap) return;
      if (zone === "center") {
        setMode("greet", greeting());
        loadAll(list); // in case these frames are still queued behind others
      } else if (mode !== zone) setMode(zone, glance(zone));
    };

    let inView = false; // mostly visible
    let onScreen = false;
    let glide = 0;
    // every greeting ends by gliding down to what he points at, as long as he's still on screen
    const finishGreeting = () => {
      setMode("done");
      if (!scrollTo) return;
      clearTimeout(glide);
      glide = window.setTimeout(() => {
        if (inView) document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 900);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // short crossfade on a jump: old frame stays solid underneath, the new one fades in on top
      // (fading both would leave the character half see-through mid-fade)
      const t = fadeFrom ? Math.min((now - fadeStart) / 320, 1) : 1;
      if (fadeFrom && t < 1) {
        ctx.setTransform(fadeXf.s, 0, 0, fadeXf.s, fadeXf.dx, fadeXf.dy);
        ctx.drawImage(fadeFrom, 0, 0, canvas.width, canvas.height);
      }
      // after a cut the new frame starts matched to the old one's size/position, then eases to its own
      const x = current(now);
      ctx.setTransform(x.s, 0, 0, x.s, x.dx, x.dy);
      if (warp && now - warp.start >= 600) warp = null;
      ctx.globalAlpha = t;
      ctx.drawImage(frames[shown], 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (t >= 1) fadeFrom = null;
    };

    let drawn = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen) return; // nothing to animate off screen
      // time-based: when frames arrive late (slow device, throttled tab) skip ahead instead of slowing down
      let steps = Math.min(Math.floor((now - last) / (1000 / FPS)), 6);
      if (steps < 1) {
        if (fadeFrom || warp) draw(now);
        return;
      }
      last = now;
      let n = shown;
      // frames that never loaded are stepped over rather than waited on
      while (steps-- > 0 && (ready(list[i]) || failed.has(list[i]))) {
        if (ready(list[i])) n = list[i];
        i++;
        if (mode === "greet" && n === 75) setMessage("Hiiii!");
        if (mode === "greet" && n === 97) setMessage("Check out the portfolio");
        if (i >= list.length) {
          if (mode === "greet") finishGreeting();
          else if (mode !== "idle" && mode !== "done") setMode("idle");
          else i = 0;
        }
      }
      if (n === shown) {
        if (fadeFrom || warp) draw(now);
        return;
      }
      // a cut gets a short crossfade; cuts and bridge joins both get a size match
      const w = shown ? warpFor(shown, n) : undefined;
      const cut = shown > 0 && isJump(shown, n);
      if (cut || w) {
        // back-to-back cuts build on whatever correction is still easing out
        const c = current(now);
        if (cut) {
          fadeFrom = frames[shown];
          fadeXf = c;
          fadeStart = now;
        }
        const [s, dx, dy] = w?.slice(2) ?? [1, 0, 0];
        warp = { s: c.s * s, dx: c.s * dx + c.dx, dy: c.s * dy + c.dy, start: now };
      }
      shown = n;
      draw(now);
      if (!drawn) {
        drawn = true;
        setStarted(true);
      }
    };
    raf = requestAnimationFrame(tick);

    // Mouse: where the cursor sits relative to the image picks the reaction. Left/right of the
    // image's middle third react at once; the greeting needs the cursor to stay on the middle of the
    // image briefly (jitter inside it is fine), so a quick sweep across never triggers it.
    // Touch/pen moves are scrolls, not hovering, so they're ignored.
    const section = canvas.closest("section") ?? document.body;
    const zoneAt = (x: number): Zone => {
      const r = canvas.getBoundingClientRect();
      const f = (x - r.left) / r.width;
      return f < 1 / 3 ? "left" : f > 2 / 3 ? "right" : "center";
    };
    let dwell = 0;
    let onCenter = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const zone = zoneAt(e.clientX);
      if (zone === "center" && e.clientY >= r.top && e.clientY <= r.bottom) {
        if (!onCenter) dwell = window.setTimeout(() => enter("center"), 250);
        onCenter = true;
        return;
      }
      clearTimeout(dwell);
      onCenter = false;
      if (zone !== "center") enter(zone);
    };
    const onLeave = () => {
      clearTimeout(dwell);
      onCenter = false;
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    // any click or tap on the image: its left/right third glances that way, the middle greets
    const onTap = (e: MouseEvent) => {
      clearTimeout(dwell);
      enter(zoneAt(e.clientX), true);
    };
    canvas.addEventListener("click", onTap);

    // No autoplay: on touch he waits for a tap (the hint says so) rather than starting by himself
    // whenever the frames happen to arrive. Once he's out of view after greeting, back to working.
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        inView = e.intersectionRatio >= 0.6;
        if (!inView && mode === "done") setMode("idle");
      },
      { threshold: [0, 0.6] },
    );
    io.observe(canvas);

    // Load in stages so each batch gets the bandwidth: the working loop first, then the greeting
    // (plus the blink frame it opens with from working), then the glances.
    (async () => {
      await loadAll(range(1, 14));
      await loadAll([BLINK, ...GREET]);
      if (!cancelled && coarse && mode === "idle") setMessage("Tap me");
      await loadAll([...range(15, 43), ...B1, ...B2]);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(dwell);
      clearTimeout(glide);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onTap);
      io.disconnect();
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [scrollTo]);

  return (
    <div className="relative w-full">
      {/* spotlight: soft neutral pool so the dark shirt and laptop keep their outline, emerald tint on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] top-[-5%] bottom-0 bg-[radial-gradient(ellipse_50%_55%_at_50%_55%,rgba(244,244,245,0.14),transparent_70%),radial-gradient(ellipse_60%_60%_at_50%_45%,rgba(16,185,129,0.12),transparent_70%)]"
      />
      <p
        aria-live="polite"
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 transition-opacity duration-500"
        style={{ opacity: message ? 1 : 0 }}
      >
        {message ?? " "}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size poster, nothing for next/image to do */}
      <img
        src={src(1, true)}
        alt=""
        aria-hidden
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
        style={{ opacity: started ? 0 : 1 }}
      />
      <canvas
        ref={canvasRef}
        width={1374}
        height={978}
        role="img"
        aria-label="Animated illustration of Nisarg working at a laptop, who looks up, waves and points down to the portfolio"
        className="relative block h-auto w-full cursor-pointer [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
      />
    </div>
  );
}
