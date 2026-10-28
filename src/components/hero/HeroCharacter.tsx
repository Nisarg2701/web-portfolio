"use client";

import { useEffect, useRef, useState } from "react";
import { FRAMES, PHONE, POINT, START, WAVE, arrive, frameOf, step, type Goal } from "@/components/hero/heroFrames";

const FRAME_MS = 1000 / 24; // every frame of the clips, at their own speed
// bump whenever the frames change: it's in the URLs (frames are HTTP-cached for a week, see
// next.config.ts) and in the Cache Storage name (older caches are deleted)
const VERSION = 9;
// phones get an 800px-wide copy (public/hero-frames/sm): far less to download and decode
const src = (n: number, small = false) =>
  `/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp?v=${VERSION}`;
// frames are kept in Cache Storage too, so repeat visits don't depend on the browser's HTTP cache
const CACHE = `hero-frames-v${VERSION}`;
const POOL = 6; // parallel downloads

type Zone = "left" | "center" | "right";

const MESSAGES: Partial<Record<Goal, string>> = {
  left: "Anyone here on the left?",
  right: "Anyone here on the right?",
  greet: "Hey, it's you!",
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
    // phones: smaller frames and no glances, so only the working loop and the greeting are downloaded
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
      // decoded off the main thread now, so drawing it later doesn't stall a frame
      await img.decode().catch(() => {});
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

    // He follows the table in heroFrames.ts towards `goal`, one frame per tick.
    let goal: Goal = "work";
    let node = START;
    let shown = 0;
    let done = false; // greeted and pointing: holds there until scrolled away
    let raf = 0;
    let prev = 0;
    let late = 0;

    // the frames he'll show next on the way to `g`, so they can be fetched first
    const ahead = (g: Goal, count = 120) => {
      const out: number[] = [];
      for (let n = node, k = 0; k < count; k++) {
        const m = step(n, g);
        if (m === n) break;
        out.push(frameOf((n = m)));
      }
      return out;
    };
    const aim = (g: Goal) => {
      goal = g;
      setMessage(MESSAGES[g] ?? (coarse ? "Tap me" : null));
      loadAll(ahead(g)); // usually loaded already; on a fresh visit this puts them first
    };

    // Once he has greeted he keeps pointing until he's scrolled away (then he's back at work): every
    // other clip has his headphones on, so there is nothing to move on to from there.
    let zoneNow: Zone | null = null;
    const enter = (zone: Zone, again = false) => {
      if (goal === "greet" || done) return;
      if (zone === zoneNow && !again) return; // one reaction per visit to a zone
      zoneNow = zone;
      if (zone === "center") aim("greet");
      else if (goal !== zone) aim(zone);
    };

    let inView = false; // mostly visible
    let onScreen = false;
    let glide = 0;
    // every greeting ends by gliding down to what he points at, as long as he's still on screen
    const finishGreeting = () => {
      done = true;
      if (!scrollTo) return;
      clearTimeout(glide);
      glide = window.setTimeout(() => {
        if (inView) document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 900);
    };

    const draw = (f: number) => {
      shown = f;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[f], 0, 0, canvas.width, canvas.height);
      setStarted(true);
    };

    // Exactly one frame per 1/24 s. When the page is busy he slows down for a moment rather than
    // skipping frames to catch up (skipping is what made him look like he was typing too fast).
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - (prev || now);
      prev = now;
      if (!onScreen) return; // nothing to animate off screen
      if (!shown) {
        if (ready(frameOf(node))) draw(frameOf(node));
        return;
      }
      late = Math.min(late + dt, FRAME_MS * 2);
      if (late < FRAME_MS || done) return;
      const next = step(node, goal);
      const f = frameOf(next);
      if (next === node || !(ready(f) || failed.has(f))) return; // wait for it to arrive
      late -= FRAME_MS;
      node = next;
      if (ready(f)) draw(f); // a frame that never loaded is stepped over, keeping the last one up
      if (goal === "greet" && f === WAVE) setMessage("Hiiii!");
      if (goal === "greet" && f === POINT) setMessage("Check out the portfolio");
      if (goal === "greet" && step(node, "greet") === node) finishGreeting();
      const g = arrive(f, goal);
      if (g !== goal) aim(g);
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
      if (e.pointerType !== "mouse" || small) return; // small screens have no glance frames
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
    // a click on the image's left/right third glances that way, the middle greets; on phones any tap greets
    const onTap = (e: MouseEvent) => {
      clearTimeout(dwell);
      enter(small ? "center" : zoneAt(e.clientX), true);
    };
    canvas.addEventListener("click", onTap);

    // No autoplay: on touch he waits for a tap (the hint says so) rather than starting by himself
    // whenever the frames happen to arrive. Once he's out of view after greeting, back to working.
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        inView = e.intersectionRatio >= 0.6;
        if (!inView && done) {
          done = false;
          node = START;
          if (ready(1)) draw(1);
          aim("work");
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(canvas);

    // Load in stages so each batch gets the bandwidth: the working loop and greeting (all phones
    // ever show), then the glances and the bridges from them.
    (async () => {
      await loadAll(PHONE);
      if (!cancelled && coarse && goal === "work") setMessage("Tap me");
      if (!small) await loadAll(Array.from({ length: FRAMES }, (_, k) => k + 1).filter((f) => !PHONE.includes(f)));
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
        width={1280}
        height={911}
        role="img"
        aria-label="Animated illustration of Nisarg working at a laptop, who looks up, waves and points down to the portfolio"
        className="relative block h-auto w-full cursor-pointer [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
      />
    </div>
  );
}
