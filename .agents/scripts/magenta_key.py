r"""Key a character out of a flat magenta (#FF00FF-ish) background, in the hero frames' crop box.

key(rgb_1920x1080) -> RGBA 1374x978.
"Magenta-ness" = min(R, B) - G: ~214 on the background, <= ~20 on him (skin, navy shirt, grey
headphones and green eyes all have G >= min(R, B)), so it separates cleanly. Edge pixels are
unmixed against the measured background colour, which also removes the magenta tint.

Usage for a new clip (24 fps): extract frames with ffmpeg, key() each, keep the frames you need
(12 fps = every other one), save as public/hero-frames/frame_NNN.webp (quality 80) + an 800px copy in sm/.
"""
import cv2
import numpy as np

BOX = (278, 27, 1374, 978)  # x, y, w, h: same crop as public/hero-frames
SOLID, CLEAR = 40.0, 190.0  # magenta-ness at or below SOLID = fully him, at or above CLEAR = background


def key(rgb, solid=SOLID, clear=CLEAR):
    x, y, w, h = BOX
    img = rgb.astype(np.float32)
    # background colour measured from the frame's own top band, so a slightly different magenta still works
    bg = np.median(img[:40].reshape(-1, 3), axis=0)
    img = img[y : y + h, x : x + w]
    m = np.minimum(img[..., 0], img[..., 2]) - img[..., 1]
    a = np.clip((clear - m) / (clear - solid), 0, 1)
    # drop specks: keep only the figure (largest blob) and anything attached to it
    n, lbl, st, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8), 8)
    figure = lbl == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
    a = np.where(cv2.dilate(figure.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0, a, 0)
    # unmix edges: I = a*F + (1-a)*bg  ->  F
    fg = (img - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3)
    fg = np.clip(fg, 0, 255)
    # any magenta left on edges (min(R,B) > G): pull R and B down to G
    spill = np.maximum(np.minimum(fg[..., 0], fg[..., 2]) - fg[..., 1], 0)
    fg[..., 0] -= spill
    fg[..., 2] -= spill
    fg = np.where(a[..., None] > 0.02, fg, 0)
    return np.dstack([fg, a * 255]).astype(np.uint8)
