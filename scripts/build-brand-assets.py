"""Derive the SofinWave brand assets from the square source lockup.

Run from the repo root; requires Pillow (`pip install pillow`):

    python3 scripts/build-brand-assets.py

The source stacks the mark above the "Sofinwave" wordmark, which would render the
text about 6px tall in a 32px header, so the lockup is re-composed side by side.
The region constants below were measured from the source — re-measure them if the
source art is ever replaced.
"""

import colorsys
from PIL import Image

SRC = "public/images/logo-sofinwave.png"

# Content regions measured from the source (left, top, right, bottom).
MARK = (228, 519, 1822, 1260)  # SF ligature + circuit wave
TEXT = (242, 1346, 1809, 1531)  # "Sofinwave" wordmark
MONOGRAM = (228, 519, 735, 1259)  # the S alone — the only piece that reads at favicon sizes

# Background -> alpha ramp. Above HI is fully transparent, below LO fully opaque.
BG_HI, BG_LO = 250.0, 238.0

LOCKUP_HEIGHT = 192  # exported height; the header renders it at 32px CSS
TEXT_RATIO = 0.42  # wordmark height as a fraction of the mark height
GAP_RATIO = 0.10  # space between mark and wordmark, same basis
ICON_SIZE = 500  # app/manifest.ts declares icons at 500x500
MONOGRAM_PAD = 0.10  # breathing room around the S inside the square
DARK_FLOOR = 0.52  # brightness floor for the dark-theme variant


def to_transparent(rgb: Image.Image) -> Image.Image:
    """Knock out the near-white background, un-premultiplying anti-aliased edges."""
    rgb = rgb.convert("RGB")
    out = Image.new("RGBA", rgb.size)
    src, dst = rgb.load(), out.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            r, g, b = src[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            a = (BG_HI - lum) / (BG_HI - BG_LO)
            a = 0.0 if a < 0 else (1.0 if a > 1 else a)
            if a == 0.0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            if a < 1.0:
                r, g, b = (min(255, max(0, round((c - 255 * (1 - a)) / a))) for c in (r, g, b))
            dst[x, y] = (r, g, b, round(a * 255))
    return out


def lift_for_dark(img: Image.Image) -> Image.Image:
    """Compress brightness into [DARK_FLOOR, 1] so the navy survives a dark canvas."""
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            r2, g2, b2 = colorsys.hsv_to_rgb(h, s * 0.92, DARK_FLOOR + (1 - DARK_FLOOR) * v)
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
    return out


def save(img: Image.Image, path: str) -> None:
    """Palette-quantise (the source is noisy) and write, keeping the alpha channel."""
    img.quantize(colors=256, method=Image.FASTOCTREE).save(path, optimize=True)
    print(path, Image.open(path).size)


def scaled_to_height(img: Image.Image, height: int) -> Image.Image:
    return img.resize((max(1, round(img.width * height / img.height)), height), Image.LANCZOS)


def main() -> None:
    src = Image.open(SRC)

    mark = to_transparent(src.crop(MARK))
    text = scaled_to_height(to_transparent(src.crop(TEXT)), round(mark.height * TEXT_RATIO))
    gap = round(mark.height * GAP_RATIO)

    lockup = Image.new("RGBA", (mark.width + gap + text.width, mark.height), (0, 0, 0, 0))
    lockup.paste(mark, (0, 0), mark)
    lockup.paste(text, (mark.width + gap, (mark.height - text.height) // 2), text)
    lockup = scaled_to_height(lockup, LOCKUP_HEIGHT)

    save(lockup, "public/images/logo-wordmark.png")
    save(lift_for_dark(lockup), "public/images/logo-wordmark-dark.png")

    mono = to_transparent(src.crop(MONOGRAM))
    side = round(max(mono.size) * (1 + MONOGRAM_PAD))
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(mono, ((side - mono.width) // 2, (side - mono.height) // 2), mono)
    square = square.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)

    save(square, "public/images/logo-mark.png")
    save(square, "app/icon.png")


if __name__ == "__main__":
    main()
