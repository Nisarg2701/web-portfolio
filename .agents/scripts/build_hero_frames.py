r"""Build the hero animation from the five magenta clips: frames in public/hero-frames and the
playback table in src/components/hero/heroGraph.json.

Usage: python .agents/scripts/build_hero_frames.py LOOP GREETING GLANCES BRIDGE_RIGHT BRIDGE_LEFT [--dry] [--keep DIR]
(--keep: keyed frames and measurements are saved in DIR and reused on the next run, which then takes
seconds instead of ~5 minutes; delete DIR when the clips change)

How it works
1. Every frame is keyed (magenta_key.py) and measured on a small (128px) premultiplied copy.
2. Joins: one clip may cut into another only between frames that differ by no more than the motion
   already happening there (JOIN), so a cut looks like an ordinary step. No crossfades, no held frames.
3. Each frame is a node (glance frames twice: playing forwards or backwards; he may only change
   direction where he is still, i.e. in a hold). Loop, greeting and bridges only play forwards.
4. For every goal (work, look right, look left, greet) a shortest-path search gives, for every node,
   the next node on the quickest seamless way to that goal. The player just follows that table at
   24 fps, so every reaction starts at once from wherever he is, and every path is seamless by
   construction.
5. Only frames some path can show are exported (1280px), numbered 1..N; sm/ (800px) only has the
   frames phones can reach (loop and greeting).
"""
import heapq
import os
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from magenta_key import key  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "hero-frames"
TABLE = ROOT / "src" / "components" / "hero" / "heroGraph.json"
SIZES = {"": (1280, 911), "sm/": (800, 569)}  # the crop box's 1518x1080 aspect; shown at most 640 CSS px wide
QUALITY = 78
ALPHA_QUALITY = 60  # lossy edges: ~20% smaller, average alpha error under 0.1/255

CLIPS = ["loop", "greeting", "glances", "bridge_right", "bridge_left"]
# 0-based source frames, measured (see the --dry report)
LOOP_END = 93  # 93 runs back into 0
RIGHT = 76  # deep in the right-look hold: ~2.6 s from turned to turning back
LEFT = 106  # deep in the left-look hold: ~2.6 s (both targets are still frames, so he can turn back there)
LOOK = 33  # greeting: first frame facing the viewer; the greet goal is any frame from here on
GREET_IN = 46  # cuts into the greeting may land up to here (never into the headphone lift)
WAVE, POINT = 122, 194  # greeting frames for the captions
STILL = 0.3  # step size below which he counts as still (direction may change there)
JOIN = 1.2  # a cut may always be this big (two frames of different clips of the same pose ~0.5)
# allowed cuts between clips (from, to); nothing cuts out of the greeting or back into a bridge
CUTS = {("loop", "glances"), ("glances", "loop"), ("loop", "greeting"), ("glances", "greeting"),
        ("glances", "bridge_right"), ("glances", "bridge_left"), ("bridge_right", "greeting"),
        ("bridge_left", "greeting")}


def extract(clip, tmp):
    subprocess.run(["ffmpeg", "-v", "error", "-i", clip, f"{tmp}/%04d.png"], check=True)
    return sorted(Path(tmp).glob("*.png"))


def measure(paths, keyed_dir):
    """Key every frame (saved for export) and return small premultiplied copies + clip offsets."""
    small, off = [], [0]
    for c, clip in enumerate(paths):
        def one(i_f, c=c):
            i, f = i_f
            k = key(cv2.cvtColor(cv2.imread(str(f)), cv2.COLOR_BGR2RGB))
            cv2.imwrite(str(keyed_dir / f"{c}_{i:04d}.png"), cv2.cvtColor(k, cv2.COLOR_RGBA2BGRA))
            k = k.astype(np.float32)
            a = k[..., 3:] / 255
            return cv2.resize(np.dstack([k[..., :3] * a, k[..., 3:]]), (128, 91), interpolation=cv2.INTER_AREA)

        # keying is numpy/OpenCV work that releases the GIL, so threads use every core
        with tempfile.TemporaryDirectory() as tmp, ThreadPoolExecutor(os.cpu_count()) as pool:
            small += pool.map(one, enumerate(extract(clip, tmp)))
        off.append(len(small))
        print(f"{CLIPS[c]}: {off[-1] - off[-2]} frames", flush=True)
    return np.stack(small).reshape(len(small), -1), off


def build(X, off):
    N = len(X)
    clip = np.searchsorted(off, np.arange(N), side="right") - 1
    name = lambda i: CLIPS[clip[i]]
    src = lambda c, i: off[CLIPS.index(c)] + i
    D = np.stack([np.abs(X - X[i]).mean(1) for i in range(N)])
    loop_end = src("loop", LOOP_END)

    def nxt(i, d):  # the next frame in the clip, or None
        if i == loop_end and d == 1:
            return src("loop", 0)
        j = i + d
        return j if off[clip[i]] <= j < off[clip[i] + 1] else None

    # how much he moves around frame i (largest neighbouring step)
    s = np.array([max([D[i, j] for j in (nxt(i, 1), nxt(i, -1)) if j is not None] or [0]) for i in range(N)])
    dirs = lambda i: (1, -1) if name(i) == "glances" else (1,)
    g_in = src("greeting", GREET_IN)
    cuts = {}
    for a in range(N):
        for b in range(N):
            if (name(a), name(b)) in CUTS and not (name(b) == "greeting" and b > g_in):
                if D[a, b] <= max(JOIN, min(s[a], s[b])):
                    cuts.setdefault(a, []).append(b)

    # nodes: (frame, direction); edges with cost (1 per shown frame, cuts slightly dearer by size)
    def succ(i, d):
        j = nxt(i, d)
        if j is not None:
            yield (j, d), 1.0
        if name(i) == "glances" and s[i] < STILL and nxt(i, -d) is not None:
            yield (nxt(i, -d), -d), 1.0
        for b in cuts.get(i, []):
            for db in dirs(b):
                yield (b, db), 2.5 + D[i, b]  # a cut must save a couple of frames to be worth it

    nodes = [(i, d) for i in range(N) for d in dirs(i)]
    pred = {n: [] for n in nodes}
    for n in nodes:
        for m, w in succ(*n):
            pred[m].append((n, w))

    def policy(goal_nodes, at_goal):
        dist = {n: 0.0 for n in goal_nodes}
        heap = [(0.0, n) for n in goal_nodes]
        while heap:
            dn, n = heapq.heappop(heap)
            if dn > dist[n]:
                continue
            for p, w in pred[n]:
                if dn + w < dist.get(p, 1e9):
                    dist[p] = dn + w
                    heapq.heappush(heap, (dn + w, p))
        out = {}
        for n in nodes:
            if n in goal_nodes:
                out[n] = at_goal(n)
            else:
                opts = [(w + dist[m], m) for m, w in succ(*n) if m in dist]
                out[n] = min(opts)[1] if opts else None
        return out

    loop_nodes = {(i, 1) for i in range(off[0], off[1]) if i <= loop_end}
    work = policy(loop_nodes, lambda n: (nxt(n[0], 1), 1))
    side = lambda f: {(src("glances", f), 1), (src("glances", f), -1)}
    right = policy(side(RIGHT), lambda n: work[n])
    left = policy(side(LEFT), lambda n: work[n])
    greet_nodes = {(i, 1) for i in range(src("greeting", LOOK), off[2])}
    greet = policy(greet_nodes, lambda n: (nxt(n[0], 1), 1) if nxt(n[0], 1) is not None else n)
    goals = {"work": work, "right": right, "left": left, "greet": greet}

    # what the player can reach: from the start, any goal at any time (greeting and bridges lock to greet)
    def reach(names):
        seen, todo = set(), [(0, 1)]
        while todo:
            n = todo.pop()
            if n in seen or n is None:
                continue
            seen.add(n)
            for g in (["greet"] if name(n[0]) in ("greeting", "bridge_right", "bridge_left") else names):
                todo.append(goals[g][n])
        return seen

    desk, phone = reach(goals), reach(["work", "greet"])
    return dict(D=D, clip=clip, name=name, src=src, s=s, cuts=cuts, goals=goals, desk=desk, phone=phone, nodes=nodes)


def walk(g, goal, n, limit=600):
    """Frames shown from node n following goal until it arrives (or loops)."""
    out = []
    target = {"right": g["src"]("glances", RIGHT), "left": g["src"]("glances", LEFT)}.get(goal)
    while len(out) < limit:
        n = g["goals"][goal][n]
        out.append(n)
        if n[0] == target:
            goal, target = "work", None
        if goal == "work" and g["name"](n[0]) == "loop" and target is None and len(out) > 1:
            break
        if goal == "greet" and g["goals"]["greet"][n] == n:
            break
    return out


def report(g):
    lab = lambda i: f"{g['name'](i)}[{i - g['src'](g['name'](i), 0)}]"
    print("\ncuts used by some path:")
    used = set()
    for goal, pol in g["goals"].items():
        for n in g["desk"]:
            m = pol[n]
            if m and m[0] != n[0] and g["clip"][m[0]] != g["clip"][n[0]]:
                used.add((n[0], m[0]))
    for a, b in sorted(used):
        print(f"  {lab(a)} -> {lab(b)}  diff {g['D'][a, b]:.2f}  (moving {g['s'][a]:.2f} / {g['s'][b]:.2f})")
    hub = (0, 1)
    for goal in ["right", "left", "greet"]:
        p = walk(g, goal, hub)
        print(f"\nfrom the hub, {goal}: {len(p)} frames ({len(p) / 24:.1f} s): " + " ".join(lab(n[0]) for n in p[:: max(1, len(p) // 40)]))
    for goal, f in [("greet", RIGHT), ("greet", LEFT), ("left", RIGHT), ("right", LEFT)]:
        p = walk(g, goal, (g["src"]("glances", f), 1))
        print(f"\nfrom glances[{f}], {goal}: {len(p)} frames ({len(p) / 24:.1f} s)")
    print(f"\nframes: desktop {len({n[0] for n in g['desk']})}, phones {len({n[0] for n in g['phone']})}")


def resize(rgba, w, h):
    # premultiplied, so see-through edge pixels don't drag dark fringes in
    a = rgba[..., 3:].astype(np.float32) / 255
    rgb = cv2.resize(rgba[..., :3] * a, (w, h), interpolation=cv2.INTER_AREA)
    a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA)[..., None]
    rgb = np.where(a > 0.004, rgb / np.maximum(a, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)


def export(g, keyed_dir):
    frames = sorted({n[0] for n in g["desk"]})
    ids = {f: k + 1 for k, f in enumerate(frames)}  # frame numbers 1..N, clip by clip
    for d in SIZES:
        (OUT / d).mkdir(parents=True, exist_ok=True)
        for f in (OUT / d).glob("frame_*.webp"):
            f.unlink()
    phone = {n[0] for n in g["phone"]}

    def one(f):
        c = g["clip"][f]
        k = cv2.cvtColor(cv2.imread(str(keyed_dir / f"{c}_{f - g['src'](CLIPS[c], 0):04d}.png"), cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA)
        for d, (w, h) in SIZES.items():
            if d == "sm/" and f not in phone:
                continue  # small screens never show it
            Image.fromarray(resize(k, w, h)).save(OUT / d / f"frame_{ids[f]:03d}.webp", quality=QUALITY, alpha_quality=ALPHA_QUALITY, method=6)

    # resizing and webp encoding release the GIL, so threads use every core
    with ThreadPoolExecutor(os.cpu_count()) as pool:
        list(pool.map(one, frames))
    # table: node index = 2 * (id - 1) + (1 if playing backwards), value = next node index
    node = lambda n: 2 * (ids[n[0]] - 1) + (n[1] == -1)
    table = {goal: [-1] * (2 * len(frames)) for goal in g["goals"]}
    for goal, pol in g["goals"].items():
        for n in g["desk"]:
            if pol[n] is not None and pol[n][0] in ids:
                table[goal][node(n)] = node(pol[n])
    gs = lambda f: ids[g["src"]("greeting", f)]
    data = {
        "frames": len(frames),
        "loop": sum(g["name"](f) == "loop" for f in frames),  # frames 1..loop are the working loop
        "phone": sorted({ids[n[0]] for n in g["phone"]}),
        "right": ids[g["src"]("glances", RIGHT)],
        "left": ids[g["src"]("glances", LEFT)],
        "wave": gs(WAVE),
        "point": gs(POINT),
        "last": ids[max(f for f in frames if g["name"](f) == "greeting")],
        "next": table,
    }
    TABLE.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    print(f"wrote {len(frames)} frames and {TABLE.relative_to(ROOT)}")


def main(args):
    dry = "--dry" in args
    keep = args[args.index("--keep") + 1] if "--keep" in args else None
    paths = [a for a in args if a != "--dry" and a != "--keep" and a != keep]
    if len(paths) != len(CLIPS) or any(not Path(p).is_file() for p in paths):
        sys.exit("usage: build_hero_frames.py LOOP GREETING GLANCES BRIDGE_RIGHT BRIDGE_LEFT [--dry] [--keep DIR]")
    with tempfile.TemporaryDirectory() as tmp:
        keyed = Path(keep or tmp)
        keyed.mkdir(parents=True, exist_ok=True)
        if (keyed / "small.npz").exists():
            z = np.load(keyed / "small.npz")
            X, off = z["X"], list(z["off"])
        else:
            X, off = measure(paths, keyed)
            np.savez(keyed / "small.npz", X=X, off=off)
        g = build(X, off)
        report(g)
        if not dry:
            export(g, keyed)


if __name__ == "__main__":
    main(sys.argv[1:])
