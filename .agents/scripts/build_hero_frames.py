r"""Rebuild public/hero-frames from the three magenta clips (all start on the hub frame).

Usage: python .agents/scripts/build_hero_frames.py LOOP GREETING GLANCES
(each a clip, or a folder of its frames as 001.png ...; the sources live in .agents/bridge-frames/fresh/)

Keeps every 4th source frame; played at 12 fps that's twice real time (the user found real time slow).
Numbered to match src/components/heroFrames.ts:
  1-24     loop      (source 1, 5 ... 93; 95 is ~frame 1, so the wrap is seamless)
  25-83    greeting  (source 5, 9 ... 237; source 1 is the hub, already shown)
  84-130   glances   (source 5, 9 ... 189)
Writes frame_NNN.webp (1374x978, quality 80) and an 800px copy in sm/. Old frames are deleted first.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from magenta_key import key  # noqa: E402

OUT = Path(__file__).resolve().parents[2] / "public" / "hero-frames"
W, H = 1374, 978
STEP = 4
CLIPS = [(1, 93), (5, 237), (5, 189)]  # first and last source frame kept per clip


def resize(rgba, w, h):
    # premultiplied, so see-through edge pixels don't drag dark fringes in
    a = rgba[..., 3:].astype(np.float32) / 255
    rgb = cv2.resize(rgba[..., :3] * a, (w, h), interpolation=cv2.INTER_AREA)
    a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA)[..., None]
    rgb = np.where(a > 0.004, rgb / np.maximum(a, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)


def save(rgba, path):
    cv2.imwrite(str(path), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 80])


def main(paths):
    # each input is a clip or a folder of its frames already extracted as 001.png, 002.png ...
    missing = [p for p in paths if not Path(p).exists()]
    if len(paths) != 3 or missing:
        sys.exit(f"need LOOP GREETING GLANCES; missing: {missing}")
    (OUT / "sm").mkdir(parents=True, exist_ok=True)
    for f in [*OUT.glob("frame_*.webp"), *(OUT / "sm").glob("frame_*.webp")]:
        f.unlink()
    n = 0
    for clip, (first, last) in zip(paths, CLIPS):
        with tempfile.TemporaryDirectory() as tmp:
            src = clip
            if Path(clip).is_file():
                subprocess.run(["ffmpeg", "-v", "error", "-i", clip, f"{tmp}/%03d.png"], check=True)
                src = tmp
            for s in range(first, last + 1, STEP):
                rgb = cv2.cvtColor(cv2.imread(f"{src}/{s:03d}.png"), cv2.COLOR_BGR2RGB)
                k = key(rgb)
                n += 1
                save(resize(k, W, H), OUT / f"frame_{n:03d}.webp")
                save(resize(k, 800, round(800 * H / W)), OUT / "sm" / f"frame_{n:03d}.webp")
        print(f"{Path(clip).name}: up to frame {n}")


if __name__ == "__main__":
    main(sys.argv[1:4])
