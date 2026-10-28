// Checks the hero's movement paths without a browser.
// Run from the repo root:  node --experimental-strip-types .agents/scripts/check_hero_paths.ts
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { B3, glance, greeting, isJump, range, warpFor } from "../../src/components/heroFrames.ts";

const file = (n: number, small = false) =>
  `public/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
// a "cut" is a jump that gets a crossfade; joins in SEAMLESS or within a clip are not cuts
const cuts = (path: number[]) =>
  path.slice(1).flatMap((b, i) => (isJump(path[i], b) ? [`${path[i]}>${b}${warpFor(path[i], b) ? "(sized)" : ""}`] : []));

const starts = { working: [7, 14], left: [18, 22], turningRight: [225, 233], sweep: [236, 240, 250, 257] };
let failures = 0;
const check = (name: string, path: number[], small = false) => {
  const missing = path.filter((n) => !existsSync(file(n, small)));
  console.log(`${name.padEnd(30)} ${String(path.length).padStart(3)} frames  cuts: ${cuts(path).join(" ") || "none"}`);
  if (missing.length) {
    failures++;
    console.log(`  MISSING: ${[...new Set(missing)].join(", ")}`);
  }
};

for (const [where, ns] of Object.entries(starts))
  for (const n of ns) {
    // include the step from where he is now into the path
    check(`greet from ${where} (${n})`, [n, ...greeting(n)]);
    check(`left from ${where} (${n})`, [n, ...glance("left", n)]);
    check(`right from ${where} (${n})`, [n, ...glance("right", n)]);
  }
// phones only ever greet from the working loop, from the small frames
check("phone greet (7)", [7, ...greeting(7)], true);

// the user's two asks
for (const n of [...starts.turningRight, 236, 240]) {
  const p = [n, ...greeting(n)];
  assert(!p.some((f) => B3.includes(f)), `greeting from the right (${n}) must not use bridge 3`);
  assert.equal(cuts(p).length, 0, `greeting from the right (${n}) should have no crossfade cuts`);
}
for (const n of starts.left) {
  const p = greeting(n);
  assert(!p.some((f) => f > 157 && f <= 174), `greeting from the left (${n}) must skip bridge 2's held smile`);
  assert.equal(p[p.indexOf(157) + 1], 49, "bridge 2 hands over to the greeting's smile at 49");
}
assert.deepEqual(range(3, 1), [3, 2, 1]);
assert.equal(failures, 0, "every frame in every path exists");
console.log("ok");
