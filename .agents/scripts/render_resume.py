"""Render public/Resume.pdf to public/resume-preview.webp for the contact dialog's viewer.

Run again whenever Resume.pdf changes:  python .agents/scripts/render_resume.py
"""
import io
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

ROOT = Path(__file__).resolve().parents[2] / "public"
WIDTH = 1700  # ~2x the pane's width, so text stays sharp on high-DPI screens

page = fitz.open(ROOT / "Resume.pdf")[0]  # the resume is one page
pix = page.get_pixmap(matrix=fitz.Matrix(WIDTH / page.rect.width, WIDTH / page.rect.width))
Image.open(io.BytesIO(pix.tobytes("png"))).save(ROOT / "resume-preview.webp", quality=90)
print(f"{pix.width}x{pix.height} -> public/resume-preview.webp")
