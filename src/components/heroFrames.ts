// Frame map and movement paths for HeroCharacter. Pure data and functions of the frame on screen,
// so the paths can be checked without a browser (see .agents/scripts/check_hero_paths.ts).
// Built by .agents/scripts/build_hero_frames.py from three clips that all start on the same hub frame
// (working, eyes on the laptop), at every 3rd source frame (12 fps playback = 1.5x real time).
// No crossfades: every path is continuous, and wherever it moves between clips it does so between
// frames measured to differ by no more than a normal step.

export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// 1-32 working loop (1 is the hub; 32 runs back into 1)
export const IDLE = range(1, 32);
// 33-111 greeting: looks up and smiles -> headphones back off his head -> waves (from ~72) -> points down (~97)
export const GREET = range(33, 111);
const WAVE_START = 72;
export const WAVE = 74;
export const POINT = 97;
const END = 111;
export const DONE = [...range(END, 101), ...range(102, END - 1)]; // rests within the held point
// 112-174 glance clip, one line from hub to hub: turns screen-right, holds (131-138), sweeps across,
// holds screen-left (143-157), turns back. Glances walk along it either way.
export const G0 = 112;
export const RT = 138;
export const LT = 143;
export const GE = 174;
const RIGHT_HOLD = 131;

// Interchangeable frames (the hub and loop frames that look like it): any can follow any other.
// Mid-loop, he types on to the nearest one before starting a glance or the greeting.
const HUB = [1, 2, 3, 4, 22, 23, 24, 31, 32, GREET[0], G0, GE];
// Glance frames with his head turned back to the laptop, and the greeting frame each matches.
const ENTRIES = [
  [122, 39], // right side
  [163, 35], // left side
] as const;

/** True when b can't directly follow a: a cut the eye would see. Paths must never contain one. */
export const isJump = (a: number, b: number) =>
  Math.abs(a - b) > 1 &&
  !(HUB.includes(a) && HUB.includes(b)) &&
  !(a === IDLE.at(-1) && b === IDLE[0]) &&
  !ENTRIES.some(([e, g]) => a === e && b === g);

const onLoop = (n: number) => n >= 1 && n <= IDLE.length;
const onGlance = (n: number) => n >= G0 && n <= GE;
const nearest = (n: number, ns: readonly number[]) => ns.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
// mid-loop: carry on typing (either way) to the nearest hub-like frame
const toHub = (n: number) => (onLoop(n) && !HUB.includes(n) ? range(n, nearest(n, HUB.filter(onLoop))) : []);

/** Frames for a glance to one side, starting from frame `n`: there, hold ~2.5s, home. */
export const glance = (side: "left" | "right", n: number) => {
  if (side === "right") {
    const there = onGlance(n) ? range(n, RT) : [...toHub(n), ...range(G0, RT)];
    // the hold plays there and back on the way out and home; one more bounce makes it ~2.5s
    return [...there, ...range(RT - 1, RIGHT_HOLD), ...range(RIGHT_HOLD + 1, RT), ...range(RT - 1, G0)];
  }
  // from the hub, the turn back from the left played backwards is the turn to the left;
  // the left hold is long enough on its own (passed through backwards, then forwards)
  const there = onGlance(n) ? range(n, LT) : [...toHub(n), ...range(GE, LT)];
  return [...there, ...range(LT + 1, GE)];
};

/** Frames for the greeting, starting from frame `n`. */
export const greeting = (n: number) => {
  // already greeted (holding the point): wave again rather than start over with the headphones on
  if (n > WAVE_START && n <= END) return [...range(n, WAVE_START), ...range(WAVE_START + 1, END)];
  if (!onGlance(n) || n === G0 || n === GE) return [...toHub(n), ...GREET];
  // mid-glance: turn back to the laptop at the nearest side's entry, then look up at the viewer
  const [e, g] = n <= ENTRIES[0][0] || n - ENTRIES[0][0] < ENTRIES[1][0] - n ? ENTRIES[0] : ENTRIES[1];
  return [...range(n, e), ...range(g, END)];
};
