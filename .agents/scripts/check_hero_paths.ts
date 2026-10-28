// Checks the hero's movement paths without a browser: every frame exists and no path has a cut
// (the player has no crossfade, so a cut would show).
// Run from the repo root:  node --experimental-strip-types .agents/scripts/check_hero_paths.ts
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { DONE, GREET, IDLE, LT, RT, glance, greeting, isJump } from "../../src/components/heroFrames.ts";

const file = (n: number, small = false) =>
  `public/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
const cuts = (path: number[]) => path.slice(1).flatMap((b, i) => (isJump(path[i], b) ? [`${path[i]}>${b}`] : []));
const secs = (path: number[]) => (path.length / 12).toFixed(1);

const starts = {
  hub: [1], midLoop: [10, 27], turningRight: [118], right: [RT], sweep: [140], left: [LT, 150], returning: [168],
};
let failures = 0;
const check = (name: string, path: number[], small = false) => {
  const missing = path.filter((n) => !existsSync(file(n, small)));
  const c = cuts(path);
  console.log(`${name.padEnd(28)} ${String(path.length).padStart(3)} frames (${secs(path)}s)  ${c.length ? `CUTS: ${c.join(" ")}` : ""}`);
  if (missing.length || c.length) failures++;
  if (missing.length) console.log(`  MISSING: ${[...new Set(missing)].join(", ")}`);
};

for (const [where, ns] of Object.entries(starts))
  for (const n of ns) {
    // include the step from where he is now, and back into the loop after a glance
    check(`greet from ${where} (${n})`, [n, ...greeting(n)]);
    check(`left from ${where} (${n})`, [n, ...glance("left", n), IDLE[0]]);
    check(`right from ${where} (${n})`, [n, ...glance("right", n), IDLE[0]]);
  }
// after greeting: holding the point, and waving again from it
check("holding the point", [...DONE, ...DONE]);
for (const n of [101, 106, 111]) check(`wave again (${n})`, [n, ...greeting(n)]);
// phones only ever have the loop and the greeting, from the small frames
check("phone greet (1)", [1, ...greeting(1)], true);
check("phone loop", [...IDLE, IDLE[0]], true);

// the guide: a side look holds ~2-3 s before he goes back to work
for (const side of ["left", "right"] as const) {
  const p = glance(side, 1), peak = side === "left" ? LT : RT;
  const held = p.filter((f) => Math.abs(f - peak) <= 14 && (side === "left" ? f >= peak : f <= peak)).length;
  assert(held / 12 >= 2, `${side} hold is ${held / 12}s`);
}
assert.deepEqual(greeting(1), GREET);
assert.equal(failures, 0, "every frame exists and no path has a cut");
console.log("ok");
