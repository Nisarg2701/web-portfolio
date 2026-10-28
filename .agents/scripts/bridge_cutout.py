"""Cut the character out of a plain off-white background, in the crop box the hero frames use.

Usage for a new bridge clip (1920x1080 video, 24 fps -> keep every other frame for 12 fps):
  ffmpeg -i clip.mp4 -vf "select='not(mod(n\,2))'" -fps_mode vfr raw/f_%03d.png
  then matte() each PNG and save as public/hero-frames/frame_NNN.webp (quality 80) plus an
  800px-wide copy in public/hero-frames/sm/ (quality 78).
Self-check against a shipped frame:  python bridge_cutout.py <source_1920x1080.png> <frame_NNN.webp>
(frames 14 and 47 score IoU 0.99 with the defaults).

matte(rgb_1920x1080) -> RGBA 1374x978. Background = smooth gradient, fitted per frame from pixels
far from the figure; alpha comes from Lab distance to it, soft only in a thin edge band.
"""
import cv2
import numpy as np

BOX = (278, 27, 1374, 978)  # x, y, w, h: same crop as public/hero-frames
T0, T1 = 4.0, 16.0  # Lab distance: below T0 = background, above T1 = solid (fitted on frames 14 and 47: IoU 0.99)
HOLE = 2500  # px


def fit_bg(img, mask_bg):
    # quadratic surface per channel, fitted on known-background pixels
    h, w = mask_bg.shape
    yy, xx = np.mgrid[0:h, 0:w]
    x, y = xx / w, yy / h
    A = np.stack([np.ones_like(x), x, y, x * x, y * y, x * y], -1).reshape(-1, 6)
    sel = mask_bg.reshape(-1)
    out = np.empty_like(img)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A[sel][::7], img[..., c].reshape(-1)[sel][::7], rcond=None)
        out[..., c] = (A @ coef).reshape(h, w)
    return out


def matte(rgb, t0=T0, t1=T1):
    x, y, w, h = BOX
    img = rgb[y : y + h, x : x + w].astype(np.float32)
    lab = cv2.cvtColor(img / 255, cv2.COLOR_RGB2Lab)
    # rough pass: bright, low-saturation pixels touching the border region are background
    seed = (lab[..., 0] > 80) & (np.hypot(lab[..., 1], lab[..., 2]) < 12)
    bg = fit_bg(img, seed)
    bg_lab = cv2.cvtColor(np.clip(bg, 0, 255) / 255, cv2.COLOR_RGB2Lab)
    d = np.linalg.norm(lab - bg_lab, axis=-1)
    solid = (d > t1).astype(np.uint8)
    # keep the figure (largest component) and fill holes inside it (eye whites, highlights)
    n, lbl, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    keep = (lbl == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    # fill only small holes (eye whites, highlights); big ones are real gaps, e.g. inside the headband
    holes = (1 - keep).astype(np.uint8)
    n, hl, hs, _ = cv2.connectedComponentsWithStats(holes, 4)
    small = np.isin(hl, [i for i in range(1, n) if hs[i, cv2.CC_STAT_AREA] < HOLE])
    filled = keep | small.astype(np.uint8)
    near = cv2.dilate(filled, np.ones((5, 5), np.uint8)) > 0
    a = np.clip((d - t0) / (t1 - t0), 0, 1)
    a = np.where(filled > 0, 1.0, np.where(near, a, 0.0))
    # edge colour decontamination: remove the background's share from semi-transparent pixels
    fg = (img - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3)
    fg = np.where(a[..., None] > 0.02, np.clip(fg, 0, 255), 0)
    return np.dstack([fg, a * 255]).astype(np.uint8)


if __name__ == "__main__":
    import sys
    from PIL import Image

    ref = np.array(Image.open(sys.argv[2]).convert("RGBA")).astype(np.float32) / 255
    src = cv2.cvtColor(cv2.imread(sys.argv[1]), cv2.COLOR_BGR2RGB)
    for t0, t1 in [(T0, T1)]:
        a = matte(src, t0, t1)[..., 3] / 255
        r = ref[..., 3]
        iou = ((a > 0.5) & (r > 0.5)).sum() / ((a > 0.5) | (r > 0.5)).sum()
        print(f"t0={t0} t1={t1} IoU={iou:.4f} alphaMAE={np.abs(a - r).mean():.4f} edgeMAE={np.abs(a - r)[(r > 0.02) & (r < 0.98)].mean():.3f}")
