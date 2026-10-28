"use client";

import { useEffect, useRef, useState } from "react";
import { DONE, G0, GE, GREET, IDLE, POINT, WAVE, glance, greeting, isJump, range } from "@/components/heroFrames";

const FPS = 12; // the source clips were cut at 12fps
// phones get an 800px-wide copy (public/hero-frames/sm): far less to download and decode
const src = (n: number, small = false) =>
  `/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
// frames are kept in Cache Storage too, so repeat visits don't depend on the browser's HTTP cache
// (bump the version whenever the frames change; older caches are deleted)
const CACHE = "hero-frames-v4";
const POOL = 6; // parallel downloads

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

    // `tap`: a deliberate click/tap, which can also restart him after the greeting. Resting the
    // cursor on the middle after the greeting would just loop it, so hover only wakes him with a glance.
    const enter = (zone: Zone, tap = false) => {
      if (mode === "greet") return;
      if (mode === "done" && zone === "center" && !tap) return;
      if (zone === "center") {
        setMode("greet", greeting(shown));
        loadAll(list); // in case these frames are still queued behind others
      } else if (mode !== zone) setMode(zone, glance(zone, shown));
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
      if (fadeFrom && t < 1) ctx.drawImage(fadeFrom, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = t;
      ctx.drawImage(frames[shown], 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      if (t >= 1) fadeFrom = null;
    };

    let drawn = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen) return; // nothing to animate off screen
      // time-based: when frames arrive late (slow device, throttled tab) skip ahead instead of slowing down
      let steps = Math.min(Math.floor((now - last) / (1000 / FPS)), 6);
      if (steps < 1) {
        if (fadeFrom) draw(now);
        return;
      }
      last = now;
      let n = shown;
      // frames that never loaded are stepped over rather than waited on
      while (steps-- > 0 && (ready(list[i]) || failed.has(list[i]))) {
        if (ready(list[i])) n = list[i];
        i++;
        if (mode === "greet" && n === WAVE) setMessage("Hiiii!");
        if (mode === "greet" && n === POINT) setMessage("Check out the portfolio");
        if (i >= list.length) {
          if (mode === "greet") finishGreeting();
          else if (mode !== "idle" && mode !== "done") setMode("idle");
          else i = 0;
        }
      }
      if (n === shown) {
        if (fadeFrom) draw(now);
        return;
      }
      // a cut (e.g. from mid-loop into a glance) gets a short crossfade; joins through the hub don't
      if (shown > 0 && isJump(shown, n)) {
        fadeFrom = frames[shown];
        fadeStart = now;
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
        if (!inView && mode === "done") setMode("idle");
      },
      { threshold: [0, 0.6] },
    );
    io.observe(canvas);

    // Load in stages so each batch gets the bandwidth: the working loop first, then the greeting,
    // then the glances.
    (async () => {
      await loadAll(IDLE);
      await loadAll(GREET);
      if (!cancelled && coarse && mode === "idle") setMessage("Tap me");
      if (!small) await loadAll(range(G0, GE));
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
