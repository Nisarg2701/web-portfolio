// Frame map and movement paths for HeroCharacter. Pure data and functions of the frame on screen,
// so the paths can be checked without a browser (see .agents/scripts/check_hero_paths.ts).
// Built by .agents/scripts/build_hero_frames.py from three clips that all start on the same hub frame
// (working, eyes on the laptop), so moving between clips through the hub needs no matching.

export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// 1-24 working loop (1 is the hub; 24 runs back into 1)
export const IDLE = range(1, 24);
// 25-83 greeting: looks up and smiles -> headphones back off his head -> waves (~55) -> points down (~73)
export const GREET = range(25, 83);
export const WAVE = 55;
export const POINT = 73;
const END = 83;
export const DONE = [...range(END, 76), ...range(77, END - 1)]; // rests within the held point
// 84-130 glance clip, one line from hub to hub: turns screen-right, holds (to RT), sweeps across,
// holds screen-left (from LT), turns back. Glances walk along it either way.
export const G0 = 84;
export const RT = 103;
export const LT = 113;
export const GE = 130;

// frames that are the hub (or one step from it): any of them can follow any other
const HUB = new Set([1, IDLE.at(-1)!, GREET[0], G0, GE]);
export const isJump = (a: number, b: number) =>
  Math.abs(a - b) > 6 && !(HUB.has(a) && HUB.has(b));

const onGlance = (n: number) => n >= G0 && n <= GE;

/** Frames for a glance to one side, starting from frame `n`: there (through that side's hold) and home. */
export const glance = (side: "left" | "right", n: number) => {
  if (side === "right") return [...range(onGlance(n) ? n : G0, RT), ...range(RT, G0)];
  // from the hub, the turn back from the left played backwards is the turn to the left
  return [...range(onGlance(n) ? n : GE, LT), ...range(LT, GE)];
};

// glance frames where his head faces forward, and the greeting frame (about to look up) each matches
// (measured: within a normal step, except the sweep's blurred centre)
const ENTRIES = [
  [91, 29], // turning back from the right
  [105, 29], // centre of the sweep
  [123, 31], // turning back from the left
] as const;

/** Frames for the greeting, starting from frame `n`. Mid-glance he only turns his head forward (to the
 * nearest entry) and greets from there, instead of going back to work first. */
export const greeting = (n: number) => {
  if (!onGlance(n) || n === G0 || n === GE) return GREET;
  if (n < ENTRIES[0][0]) return range(ENTRIES[0][1], END); // still facing nearly forward
  if (n > ENTRIES[2][0]) return range(ENTRIES[2][1], END);
  const [e, g] = ENTRIES.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a));
  return [...range(n, e), ...range(g, END)];
};
