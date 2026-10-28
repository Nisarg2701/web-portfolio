// Checks the hero's movement paths without a browser.
// Run from the repo root:  node --experimental-strip-types .agents/scripts/check_hero_paths.ts
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { G0, GE, GREET, IDLE, LT, RT, glance, greeting, isJump } from "../../src/components/heroFrames.ts";

const file = (n: number, small = false) =>
  `public/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
// a "cut" is a jump that gets a crossfade; steps within a clip and joins through the hub are not cuts
const cuts = (path: number[]) => path.slice(1).flatMap((b, i) => (isJump(path[i], b) ? [`${path[i]}>${b}`] : []));

const starts = { hub: [1], working: [10], turningRight: [92], right: [RT], sweep: [108], left: [LT, 120], returning: [127] };
let failures = 0;
const check = (name: string, path: number[], small = false) => {
  const missing = path.filter((n) => !existsSync(file(n, small)));
  console.log(`${name.padEnd(28)} ${String(path.length).padStart(3)} frames  cuts: ${cuts(path).join(" ") || "none"}`);
  if (missing.length) {
    failures++;
    console.log(`  MISSING: ${[...new Set(missing)].join(", ")}`);
  }
  return path;
};

for (const [where, ns] of Object.entries(starts))
  for (const n of ns) {
    // include the step from where he is now into the path, and back into the loop after a glance
    const g = check(`greet from ${where} (${n})`, [n, ...greeting(n)]);
    const l = check(`left from ${where} (${n})`, [n, ...glance("left", n), IDLE[0]]);
    const r = check(`right from ${where} (${n})`, [n, ...glance("right", n), IDLE[0]]);
    // leaving mid-loop is a cut; so is greeting mid-glance (straight to the viewer); the rest is continuous
    if (n !== 10) for (const p of [l, r]) assert.equal(cuts(p).length, 0, `no cuts from ${where} (${n})`);
    if (n !== 10) assert.equal(cuts(g).length, n === 1 ? 0 : 1, `greeting from ${where} (${n})`);
    if (n !== 1) assert(!g.some((f) => f === G0 || f === GE), `greeting from ${where} (${n}) doesn't go back to work first`);
  }
// phones only ever have the loop and the greeting, from the small frames
check("phone greet (1)", [1, ...greeting(1)], true);
check("phone loop", [...IDLE, IDLE[0]], true);
assert.equal(cuts([...IDLE, IDLE[0]]).length, 0, "the loop wraps without a cut");
assert(glance("right", 1).includes(RT) && glance("left", 1).includes(LT), "glances reach their side");
assert.deepEqual(greeting(1), GREET);
assert.equal(new Set([G0, GE]).size, 2);
assert.equal(failures, 0, "every frame in every path exists");
console.log("ok");
