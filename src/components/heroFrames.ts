// Frame map and movement paths for HeroCharacter. Pure data and functions of the frame on screen,
// so the paths can be checked without a browser (see .agents/scripts/check_hero_paths.ts).

const HOLD = 30; // ~2.5s glance hold, in frames
export const range = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i);
  return out;
};

// Frame map (see public/hero-frames): 1-14 working; 14-22 turn screen-left (peak 22);
// 44-112 notice -> headset off -> wave -> point down.
export const L = 22;
export const IDLE = [...range(14, 1), ...range(2, 13)]; // starts at 14, where the glances hand back
export const END = 112;
export const GREET = range(47, END);
export const DONE = [...range(END, 100), ...range(101, END - 1)]; // rests within the held point
// Generated clips, stored after the main one: 139-157 left glance (flows on from 22) -> turns to the
// viewer, blinking at ~145, and starts to smile at 157, where the greeting's own smile takes over (49)
export const B2 = range(139, 157);
// even frames 176-222 (every other frame of the clip, 2s): working -> looks up and smiles at the
// viewer (flows into 47); its ends match 14 and 47 to within a pixel, so it needs no size match
export const B3 = range(176, 222).filter((n) => n % 2 === 0);
// 223-257 glance clip (every other frame of a 24fps clip): 223 working -> turns screen-right, peak at
// 233 -> sweeps across -> 257 looking screen-left, which matches 22 exactly (so left glances hand over)
export const G0 = 223;
export const R = 233;
export const GL = 257;
// joins that are continuous even though the frame numbers jump
// (239>146: the glance clip's blink at centre runs into bridge 2's; 157>49: bridge 2's smile into the greeting's)
const SEAMLESS = new Set(["22>139", "222>47", "22>257", "257>22", "257>139", "239>146", "157>49"]);
export const isJump = (a: number, b: number) => Math.abs(a - b) > 6 && !SEAMLESS.has(`${a}>${b}`);

// The camera slowly pulls back through the clip, so at a cut the new frame is a bit smaller.
// [from, to, scale, dx, dy]: drawing `to` as scale*p + (dx, dy) lines it up with `from`
// (fitted on the whole figure; working frames 1-14 share frame 14's geometry).
const WARPS: [number, number, number, number, number][] = [
  // bridge joins (fitted on the exported cutouts)
  [157, 49, 1.0325, -22.3, -17.4],
  [239, 146, 1.01, -0.9, -0.4],
  [14, G0, 1.0125, -5.8, -11.0],
  [G0, 14, 1 / 1.0125, 5.8 / 1.0125, 11.0 / 1.0125], // exact inverse, so there-and-back matches
  [G0, 176, 1 / 1.0125, 5.8 / 1.0125, 11.0 / 1.0125], // into bridge 3, whose start matches 14
];
export const warpFor = (a: number, b: number) =>
  WARPS.find(([from, to]) => Math.abs(from - Math.max(a, 14)) <= 6 && Math.abs(to - b) <= 6);

// where he is: turning screen-left (15-22), or on the glance clip's right turn (223-233) / sweep (234-257)
const onLeft = (n: number) => n > 14 && n <= L;
const onTurn = (n: number) => n >= G0 && n <= R;
const onSweep = (n: number) => n > R && n <= GL;

/** Frames for a glance to one side, starting from frame `n`: there, hold, back. */
export const glance = (side: "left" | "right", n: number) => {
  const there =
    side === "left"
      ? onSweep(n) || (onTurn(n) && n > (G0 + R) / 2)
        ? range(n, GL) // already turning: carry on across to the left (257 hands over to 22)
        : onTurn(n)
          ? [...range(n, G0), ...range(14, L)] // barely started right: back, then left
          : range(n >= 1 && n <= L ? n : 14, L) // working runs straight into the left turn
      : onLeft(n)
        ? [...range(n, L), ...range(GL, R)] // the sweep backwards, from the left to the right
        : onTurn(n) || onSweep(n)
          ? range(n, R)
          : range(G0, R); // working -> right turn
  const peak = side === "left" ? L : R;
  const home = side === "left" ? range(L, 14) : range(R, G0);
  return [...there, ...Array(HOLD).fill(peak), ...home];
};

/** Frames for the greeting, starting from frame `n`. */
export const greeting = (n: number) => {
  // left side: back to the glance, then bridge 2 turns him to the viewer and into the greeting's smile
  if (onLeft(n)) return [...range(n, L), ...B2, ...range(49, END)];
  if (onSweep(n) && n > (R + GL) / 2) return [...range(n, GL), ...B2, ...range(49, END)];
  // right side: the glance clip turns him to the centre and blinks (239), bridge 2 picks up from its blink
  if (onTurn(n) || onSweep(n)) return [...range(n, 239), ...range(146, 157), ...range(49, END)];
  // from working (or a finished greeting) bridge 3 lifts his head to the viewer
  return [...B3, ...range(47, END)];
};
