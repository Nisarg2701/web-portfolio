// Checks the hero's movement paths without a browser: every frame exists, no path has a cut (the
// player has no crossfade, so a cut would show) and no frame is held or bounced to fake a pause.
// Run from the repo root:  node --experimental-strip-types .agents/scripts/check_hero_paths.ts
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { DONE, GREET, IDLE, LT, RT, glance, greeting, isJump } from "../../src/components/heroFrames.ts";

const FPS = 24;
const file = (n: number, small = false) =>
  `public/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
const cuts = (path: number[]) => path.slice(1).flatMap((b, i) => (isJump(path[i], b) ? [`${path[i]}>${b}`] : []));
const secs = (path: number[]) => (path.length / FPS).toFixed(1);

const starts = {
  hub: [1], midLoop: [30, 80], turningRight: [350], right: [400, RT], sweep: [420, 430], left: [LT, 460], returning: [500],
};
let failures = 0;
const check = (name: string, path: number[], small = false) => {
  const missing = path.filter((n) => !existsSync(file(n, small)));
  const c = cuts(path);
  const still = path.slice(1).filter((b, i) => b === path[i]).length;
  console.log(`${name.padEnd(28)} ${String(path.length).padStart(3)} frames (${secs(path)}s)  ${c.length ? `CUTS: ${c.join(" ")}` : ""}${still ? ` REPEATS: ${still}` : ""}`);
  if (missing.length || c.length || still) failures++;
  if (missing.length) console.log(`  MISSING: ${[...new Set(missing)].join(", ")}`);
};

for (const [where, ns] of Object.entries(starts))
  for (const n of ns) {
    // include the step from where he is now, and back into the loop after a glance
    check(`greet from ${where} (${n})`, [n, ...greeting(n)]);
    check(`left from ${where} (${n})`, [n, ...glance("left", n), IDLE[0]]);
    check(`right from ${where} (${n})`, [n, ...glance("right", n), IDLE[0]]);
  }
// phones only ever have the loop and the greeting, from the small frames
check("phone greet (1)", [1, ...greeting(1)], true);
check("phone loop", [...IDLE, IDLE[0]], true);

// side looks hold long enough to read (the user's guide asks 2-3 s; the clips' own holds give ~2)
const held = (p: number[], from: number, to: number) => p.filter((f) => f >= from && f <= to).length / FPS;
assert(held(glance("right", 1), 392, RT) >= 1.8, "right hold");
assert(held(glance("left", 1), LT, 472) >= 1.8, "left hold");
assert.deepEqual(greeting(1), GREET);
assert.deepEqual(DONE, [GREET.at(-1)]);
assert.equal(failures, 0, "every frame exists, no cuts, no repeats");
console.log("ok");
