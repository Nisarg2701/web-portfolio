// Frame map and movement paths for HeroCharacter. Pure data and functions of the frame on screen,
// so the paths can be checked without a browser (see .agents/scripts/check_hero_paths.ts).
// Built by .agents/scripts/build_hero_frames.py from three clips that all start on the same hub frame
// (working, eyes on the laptop), so moving between clips through the hub needs no matching.

export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// 1-47 working loop (1 is the hub; 47 runs back into 1)
export const IDLE = range(1, 47);
// 48-166 greeting: looks up and smiles -> headphones back off his head -> waves (~108) -> points down (~144)
export const GREET = range(48, 166);
export const WAVE = 108;
export const POINT = 144;
const END = 166;
export const DONE = [...range(END, 150), ...range(151, END - 1)]; // rests within the held point
// 167-261 glance clip, one line from hub to hub: turns screen-right, holds (to RT), sweeps across,
// holds screen-left (from LT), turns back. Glances walk along it either way.
export const G0 = 167;
export const RT = 206;
export const LT = 226;
export const GE = 261;

// frames that are the hub (or one step from it): any of them can follow any other
const HUB = new Set([1, 47, 48, G0, GE]);
export const isJump = (a: number, b: number) =>
  Math.abs(a - b) > 6 && !(HUB.has(a) && HUB.has(b));

const onGlance = (n: number) => n >= G0 && n <= GE;

/** Frames for a glance to one side, starting from frame `n`: there (through that side's hold) and home. */
export const glance = (side: "left" | "right", n: number) => {
  if (side === "right") return [...range(onGlance(n) ? n : G0, RT), ...range(RT, G0)];
  // from the hub, the turn back from the left played backwards is the turn to the left
  return [...range(onGlance(n) ? n : GE, LT), ...range(LT, GE)];
};

/** Frames for the greeting, starting from frame `n`: back to the nearest hub first, if on a glance. */
export const greeting = (n: number) => {
  if (!onGlance(n)) return GREET;
  return [...range(n, n < (RT + LT) / 2 ? G0 : GE), ...GREET];
};
