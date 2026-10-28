// Frame map and movement paths for HeroCharacter. Pure data and functions of the frame on screen,
// so the paths can be checked without a browser (see .agents/scripts/check_hero_paths.ts).
// Built by .agents/scripts/build_hero_frames.py from every frame of the clips, played at 24 fps (their
// own speed). Loop, greeting and glances all start on the same hub frame (working, eyes on the laptop);
// the two bridges turn him from a side look to the viewer and run into the greeting.
// No crossfades and no repeated holds: every path is continuous, and wherever it moves between clips
// it does so between frames measured to differ by about a normal step.

export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// 1-94 working loop (1 is the hub; 94 runs back into 1)
export const IDLE = range(1, 94);
// 95-332 greeting: looks up and smiles -> headphones back off his head -> waves (~216) -> points down (~288)
export const GREET = range(95, 332);
export const WAVE = 216;
export const POINT = 288;
const END = 332;
export const DONE = [END]; // he holds the point
// 333-522 glance clip, one line from hub to hub: turns screen-right, holds (to RT), sweeps across,
// holds screen-left, turns back. Glances walk out along it and back.
export const G0 = 333;
export const RT = 414; // end of the right hold
export const LT = 446; // into the left hold (with the way back through it, ~2 s)
export const GE = 522;
// 523-559 bridge from the right look to the viewer, 560-621 the same from the left look:
// [glance frame it starts from, first frame, last frame, greeting frame it hands over to]
const BRIDGES = [
  [404, 523, 559, 126],
  [444, 560, 621, 127],
] as const;
export const LAST = 621;

// Interchangeable frames (the hub and the loop frames that look like it): any can follow any other.
// Mid-loop, he types on to the nearest one before starting a glance or the greeting.
const HUB = [...range(1, 11), ...range(64, 70), ...range(90, 94), GREET[0], G0, GE];

/** True when b can't directly follow a: a cut the eye would see. Paths must never contain one. */
export const isJump = (a: number, b: number) =>
  Math.abs(a - b) > 1 &&
  !(HUB.includes(a) && HUB.includes(b)) &&
  !(a === IDLE.at(-1) && b === IDLE[0]) &&
  !BRIDGES.some(([from, first, last, to]) => (a === from && b === first) || (a === last && b === to));

const onLoop = (n: number) => n >= 1 && n <= IDLE.length;
const onGlance = (n: number) => n >= G0 && n <= GE;
// from frame n (already on screen) on to b
const onTo = (n: number, b: number) => range(n, b).slice(1);
const nearest = (n: number, ns: readonly number[]) => ns.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
// mid-loop: carry on typing (either way) to the nearest hub-like frame
const toHub = (n: number) => (onLoop(n) && !HUB.includes(n) ? onTo(n, nearest(n, HUB.filter(onLoop))) : []);

/** Frames for a glance to one side, starting from frame `n`: there, through that side's hold, and home. */
export const glance = (side: "left" | "right", n: number) => {
  if (side === "right") return [...(onGlance(n) ? onTo(n, RT) : [...toHub(n), ...range(G0, RT)]), ...range(RT - 1, G0)];
  // from the hub, the turn back from the left played backwards is the turn to the left
  return [...(onGlance(n) ? onTo(n, LT) : [...toHub(n), ...range(GE, LT)]), ...range(LT + 1, GE)];
};

/** Frames for the greeting, starting from frame `n`. */
export const greeting = (n: number) => {
  // still facing the laptop at either end of the glance clip: back to the hub and greet from there
  if (!onGlance(n) || n < G0 + 30) return [...(onGlance(n) ? onTo(n, G0) : toHub(n)), ...GREET];
  if (n > GE - 32) return [...onTo(n, GE), ...GREET];
  // looking to a side: that side's bridge turns him to the viewer
  const [from, first, last, to] = n <= 422 ? BRIDGES[0] : BRIDGES[1];
  return [...onTo(n, from), ...range(first, last), ...range(to, END)];
};
