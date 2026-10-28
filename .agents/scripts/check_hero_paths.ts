// Checks the hero's playback table without a browser: every frame exists, every goal is reached
// from every node the player can be on, no frame is shown twice in a row, and random visitor
// sessions (goals switching at random moments) never get stuck. Whether each cut is seamless is
// measured by build_hero_frames.py, which only allows seamless ones into the table.
// Run from the repo root:  node --experimental-strip-types .agents/scripts/check_hero_paths.ts
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { FRAMES, LAST, LOOP, LEFT, PHONE, RIGHT, START, arrive, frameOf, step, type Goal } from "../../src/components/heroFrames.ts";

const file = (n: number, small = false) => `public/hero-frames/${small ? "sm/" : ""}frame_${String(n).padStart(3, "0")}.webp`;
const missing = Array.from({ length: FRAMES }, (_, k) => k + 1).filter((n) => !existsSync(file(n)) || !existsSync(file(n, true)));
assert.deepEqual(missing, [], "missing frames");

/** Frames shown following `goal` from `node` until he is back at work (or done greeting). */
const play = (goal: Goal, node: number, limit = 2000) => {
  const out: number[] = [];
  while (out.length < limit) {
    const next = step(node, goal);
    if (next === node) return out; // greeting done
    out.push(frameOf((node = next)));
    goal = arrive(frameOf(node), goal);
    if (goal === "work" && frameOf(node) <= LOOP && out.length > 1) return out; // back at work
  }
  throw new Error(`no end from node ${node} towards ${goal}`);
};
const secs = (p: number[]) => `${p.length} frames (${(p.length / 24).toFixed(1)} s)`;
const noRepeats = (p: number[]) => p.every((f, i) => i === 0 || f !== p[i - 1]);

// from the hub
for (const g of ["right", "left", "greet"] as Goal[]) {
  const p = play(g, START);
  assert(noRepeats(p), `${g}: repeated frame`);
  console.log(`from the hub, ${g.padEnd(5)} ${secs(p)}`);
}
assert(play("right", START).includes(RIGHT) && play("left", START).includes(LEFT), "glances reach their holds");
assert.equal(play("greet", START).at(-1), LAST, "greeting ends on the point");

// random sessions: a visitor switching goals at random moments, as the player would follow them
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const seen = new Set<number>();
for (let s = 0; s < 2000; s++) {
  const phone = s % 4 === 0;
  let node = START;
  let goal: Goal = "work";
  let last = 0;
  for (let t = 0; t < 1500; t++) {
    if (goal !== "greet" && rand() < 0.02) {
      const opts: Goal[] = phone ? ["greet"] : ["right", "left", "greet"];
      goal = opts[Math.floor(rand() * opts.length)];
    }
    const next = step(node, goal);
    if (next === node) {
      assert(goal === "greet" && frameOf(node) === LAST, `stuck on frame ${frameOf(node)} towards ${goal}`);
      break;
    }
    const f = frameOf((node = next));
    assert.notEqual(f, last, `frame ${f} shown twice in a row`);
    if (phone) assert(PHONE.includes(f), `phone reached frame ${f}, which phones don't load`);
    seen.add(f);
    last = f;
    goal = arrive(f, goal);
  }
}
console.log(`random sessions used ${seen.size} of ${FRAMES} frames`);
console.log("ok");
