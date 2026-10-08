#!/usr/bin/env python3
"""
Launchpad Robotics wordmark generator.

Draws the two-line wordmark - LAUNCHPAD over ROBOTICS - as custom vector
letterforms with circuit traces terminating in through-hole via pads.

WHY GENERATED, NOT A FONT
-------------------------
A logo should not depend on a font file being installed. Print shops convert
type to outlines anyway, and owning the outlines is the only way to attach
traces to *specific* stem terminals at exact coordinates. Edit here and
regenerate; the SVGs, the React component and the favicons are downstream
artifacts of this file.

CONSTRUCTION
------------
Monoline geometric caps on a 100-unit cap height with a 17-unit stroke.
"Monoline" describes only how it is drawn - the weight is heavy enough that it
reads as solid filled type, which is what the reference garment shows.

Three details carry the identity, and all three are easy to get wrong:

  1. WEIGHT. 17% of cap height - medium, not hairline and not black. Too thin
     reads as a tech startup rather than a kids' robotics club and vanishes
     when printed small on fabric; too heavy closes the counters and the
     circuit traces stop reading as a separate, lighter layer.

  2. VIA PADS ARE RINGS, NOT DOTS. A real through-hole pad is an annulus with
     a drilled hole. Drawn as a stroked circle with no fill, so the hole is
     genuinely transparent and the mark works on any background without a
     knockout shape. Solid dots read as bullet points and kill the circuit
     reference entirely.

  3. OPEN TRACKING + EQUAL LINE WIDTHS. Letters are generously spaced, and
     both lines are scaled to a common width so the block reads as one object
     rather than two stacked words.
"""

GOLD = "#F5C518"
NAVY = "#111C34"

H = 100.0        # cap height
T = 20.0         # letter stroke weight
S = T / 2.0      # centreline inset from the glyph's optical edge
TOP = S
BOT = H - S

TRACE = T        # circuit trace weight - EQUAL TO THE STEM, not a hairline.
                 # The traces are the stems continuing, so they don't narrow.
VIA_R = 16.0     # via pad ring radius (to the centre of the ring stroke)
VIA_T = 8.0     # via pad ring thickness; the remainder is the drilled hole
TRACK = 13.0     # letter spacing
SLIT = 5.0       # hairline split through the O, like a solder-mask line
LINE_GAP = 22.0  # vertical gap between the two lines


def f(v):
    """Trim float noise so the SVG stays readable and diffs stay small."""
    return f"{v:.6g}"


# ---------------------------------------------------------------------------
# Glyphs
#
# Each returns (advance_width, [path_d, ...]). Paths are centrelines; the
# 23-unit stroke is applied by the renderer. y is down, caps span 0..H.
# ---------------------------------------------------------------------------

def glyph(ch):
    if ch == "L":
        w = 60.0
        return w, [f"M{f(S)} {f(TOP)} L{f(S)} {f(BOT)} L{f(w - S)} {f(BOT)}"]

    if ch == "A":
        w = 78.0
        mid = w / 2.0
        bar = BOT - 24.0
        return w, [
            f"M{f(S)} {f(BOT)} L{f(mid - 6)} {f(TOP)} L{f(mid + 6)} {f(TOP)} "
            f"L{f(w - S)} {f(BOT)}",
            f"M{f(S + 14)} {f(bar)} L{f(w - S - 14)} {f(bar)}",
        ]

    if ch == "U":
        w = 76.0
        r = 24.0
        return w, [
            f"M{f(S)} {f(TOP)} L{f(S)} {f(BOT - r)} "
            f"Q{f(S)} {f(BOT)} {f(S + r)} {f(BOT)} "
            f"L{f(w - S - r)} {f(BOT)} Q{f(w - S)} {f(BOT)} {f(w - S)} {f(BOT - r)} "
            f"L{f(w - S)} {f(TOP)}"
        ]

    if ch == "N":
        w = 78.0
        return w, [
            f"M{f(S)} {f(BOT)} L{f(S)} {f(TOP)} L{f(w - S)} {f(BOT)} L{f(w - S)} {f(TOP)}"
        ]

    if ch == "C":
        w = 74.0
        r = 28.0
        return w, [
            f"M{f(w - S)} {f(TOP + 18)} Q{f(w - S)} {f(TOP)} {f(w - S - 24)} {f(TOP)} "
            f"L{f(S + r)} {f(TOP)} Q{f(S)} {f(TOP)} {f(S)} {f(TOP + r)} "
            f"L{f(S)} {f(BOT - r)} Q{f(S)} {f(BOT)} {f(S + r)} {f(BOT)} "
            f"L{f(w - S - 24)} {f(BOT)} Q{f(w - S)} {f(BOT)} {f(w - S)} {f(BOT - 18)}"
        ]

    if ch == "H":
        w = 78.0
        return w, [
            f"M{f(S)} {f(TOP)} L{f(S)} {f(BOT)}",
            f"M{f(w - S)} {f(TOP)} L{f(w - S)} {f(BOT)}",
            f"M{f(S)} {f(H / 2)} L{f(w - S)} {f(H / 2)}",
        ]

    if ch == "P":
        # Bowl runs to just past mid-height, and is wide. A shallow, narrow
        # bowl was the single most obviously wrong letter in the set: it read
        # as an F with a nub.
        w = 80.0
        bowl = TOP + 54.0
        r = 27.0
        return w, [
            f"M{f(S)} {f(BOT)} L{f(S)} {f(TOP)} L{f(w - S - r)} {f(TOP)} "
            f"Q{f(w - S)} {f(TOP)} {f(w - S)} {f(TOP + r)} "
            f"Q{f(w - S)} {f(bowl)} {f(w - S - r)} {f(bowl)} L{f(S)} {f(bowl)}"
        ]

    if ch == "D":
        # Closes back on the left stem, so the top-right curve has no nick.
        w = 76.0
        r = 28.0
        return w, [
            f"M{f(S)} {f(BOT)} L{f(S)} {f(TOP)} L{f(w - S - r)} {f(TOP)} "
            f"Q{f(w - S)} {f(TOP)} {f(w - S)} {f(TOP + r)} "
            f"L{f(w - S)} {f(BOT - r)} Q{f(w - S)} {f(BOT)} {f(w - S - r)} {f(BOT)} Z"
        ]

    if ch == "R":
        w = 76.0
        bowl = TOP + 42.0
        return w, [
            f"M{f(S)} {f(BOT)} L{f(S)} {f(TOP)} L{f(w - S - 22)} {f(TOP)} "
            f"Q{f(w - S)} {f(TOP)} {f(w - S)} {f(TOP + 21)} "
            f"Q{f(w - S)} {f(bowl)} {f(w - S - 22)} {f(bowl)} L{f(S)} {f(bowl)}",
            f"M{f(w - S - 28)} {f(bowl)} L{f(w - S)} {f(BOT)}",
        ]

    if ch == "O":
        # Two halves split by a hairline slit at top and bottom centre, the
        # way a PCB pad is split by a solder-mask line. The slit is a GAP
        # between two open paths, not a line painted over a closed letter, so
        # it stays transparent on any background - same reasoning as the via
        # holes. Keep it hairline: an earlier version used one wide gap on a
        # single side and the letter collapsed into a C, so the word read
        # "RCBCTICS".
        w = 80.0
        r = 28.0
        mid = w / 2.0
        g = SLIT / 2.0
        return w, [
            f"M{f(mid - g)} {f(TOP)} L{f(S + r)} {f(TOP)} "
            f"Q{f(S)} {f(TOP)} {f(S)} {f(TOP + r)} "
            f"L{f(S)} {f(BOT - r)} Q{f(S)} {f(BOT)} {f(S + r)} {f(BOT)} "
            f"L{f(mid - g)} {f(BOT)}",
            f"M{f(mid + g)} {f(TOP)} L{f(w - S - r)} {f(TOP)} "
            f"Q{f(w - S)} {f(TOP)} {f(w - S)} {f(TOP + r)} "
            f"L{f(w - S)} {f(BOT - r)} Q{f(w - S)} {f(BOT)} {f(w - S - r)} {f(BOT)} "
            f"L{f(mid + g)} {f(BOT)}",
        ]

    if ch == "B":
        w = 74.0
        mid = H / 2.0
        return w, [
            f"M{f(S)} {f(TOP)} L{f(w - S - 24)} {f(TOP)} "
            f"Q{f(w - S - 3)} {f(TOP)} {f(w - S - 3)} {f(TOP + 19)} "
            f"Q{f(w - S - 3)} {f(mid)} {f(w - S - 24)} {f(mid)} "
            f"L{f(S)} {f(mid)} L{f(w - S - 22)} {f(mid)} "
            f"Q{f(w - S)} {f(mid)} {f(w - S)} {f(mid + 20)} "
            f"Q{f(w - S)} {f(BOT)} {f(w - S - 22)} {f(BOT)} L{f(S)} {f(BOT)} "
            f"L{f(S)} {f(TOP)}"
        ]

    if ch == "T":
        w = 72.0
        mid = w / 2.0
        return w, [
            f"M{f(S)} {f(TOP)} L{f(w - S)} {f(TOP)}",
            f"M{f(mid)} {f(TOP)} L{f(mid)} {f(BOT)}",
        ]

    if ch == "I":
        w = T + 2.0
        mid = w / 2.0
        return w, [f"M{f(mid)} {f(TOP)} L{f(mid)} {f(BOT)}"]

    if ch == "S":
        w = 72.0
        r = 20.0
        return w, [
            f"M{f(w - S)} {f(TOP + 17)} Q{f(w - S)} {f(TOP)} {f(w - S - 24)} {f(TOP)} "
            f"L{f(S + r)} {f(TOP)} Q{f(S)} {f(TOP)} {f(S)} {f(TOP + r)} "
            f"Q{f(S)} {f(H / 2)} {f(S + r + 2)} {f(H / 2)} "
            f"L{f(w - S - r - 2)} {f(H / 2)} "
            f"Q{f(w - S)} {f(H / 2)} {f(w - S)} {f(BOT - r)} "
            f"Q{f(w - S)} {f(BOT)} {f(w - S - r)} {f(BOT)} "
            f"L{f(S + 24)} {f(BOT)} Q{f(S)} {f(BOT)} {f(S)} {f(BOT - 17)}"
        ]

    raise ValueError(f"no glyph for {ch!r}")


# Via pads: (line_index, letter_index, stem, direction, trace_length).
#
# `stem` is "l" (left stem), "r" (right stem) or "c" (centre stem), resolved
# against the glyph's actual stroke centrelines - NOT an x fraction. This
# matters: a trace must continue a real stem exactly, so the stem and the
# trace read as one conductor that narrows as it leaves the letter. Offset it
# even slightly and it reads as a pin stuck on top of the type instead.
#
# Deliberately asymmetric - traces should look routed, not evenly distributed.
#
# Letter indices, since off-by-one here is easy and silent:
#   LAUNCHPAD = L0 A1 U2 N3 C4 H5 P6 A7 D8
#   ROBOTICS  = R0 O1 B2 O3 T4 I5 C6 S7
#
# NOTE: no node on the S. A via under the S tail reads as a cedilla.
NODES = [
    (0, 3, "r", -1, 40.0),   # up off N's right stem
    (0, 5, "l", -1, 62.0),   # up off H's left stem, tallest on the top line
    (1, 4, "c", +1, 44.0),   # down off T's centre stem
    (1, 5, "c", +1, 64.0),   # down off I, tallest on the bottom line
]

# R is special: its diagonal leg doesn't stop at the baseline, it keeps going
# as a trace and terminates in a pad. That one detail does more work than any
# of the vertical traces - it proves the circuitry is grown out of the
# letterforms rather than applied to them.
R_LEG_EXTEND = 42.0


def layout(word):
    """Place glyphs along a baseline. Returns (total_width, placements)."""
    out = []
    x = 0.0
    for ch in word:
        w, paths = glyph(ch)
        out.append((x, w, paths))
        x += w + TRACK
    return x - TRACK, out


def build(color, bg=None, size=900):
    """
    Render the full two-line wordmark.

    `bg` paints a background rectangle. Without it the export is a
    single-colour transparent SVG, which is what a screen printer wants.
    """
    l1, place1 = layout("LAUNCHPAD")
    l2, place2 = layout("ROBOTICS")

    # ONE CAP HEIGHT FOR BOTH LINES. Both lines are drawn at the same scale
    # and centred; the shorter word is simply narrower. The tempting
    # alternative - scaling each line to a common width so the block forms a
    # neat rectangle - silently shrinks the longer word, because LAUNCHPAD has
    # nine letters and ROBOTICS has eight. The result reads as two different
    # type sizes, which is exactly wrong for a wordmark.
    sc = 1.0
    target = max(l1, l2)

    lines = [
        (place1, sc, 0.0, (target - l1) / 2.0),
        (place2, sc, H * sc + LINE_GAP, (target - l2) / 2.0),
    ]

    # Pad must clear the longest trace plus its via ring, or the pads clip.
    reach = max(max(n[4] for n in NODES), R_LEG_EXTEND) + VIA_R + VIA_T / 2.0
    pad = reach + 10.0
    vb_w = target + pad * 2
    vb_h = H * sc + LINE_GAP + H * sc + pad * 2

    letters, deco = [], []

    for li, (place, sc, y_off, x_off) in enumerate(lines):
        for gi, (gx, gw, paths) in enumerate(place):
            tx, ty = pad + x_off + gx * sc, pad + y_off
            body = "".join(
                f'<path d="{p}" stroke="{color}" stroke-width="{f(T)}" fill="none" '
                f'stroke-linecap="butt" stroke-linejoin="round"/>'
                for p in paths
            )
            letters.append(
                f'<g transform="translate({f(tx)},{f(ty)}) scale({f(sc)})">{body}</g>'
            )

            # R's leg continues past the baseline and becomes a trace.
            if li == 1 and gi == 0:
                # Extrapolate along the actual leg vector so the trace is
                # collinear with the stroke it grows out of.
                bowl = TOP + 42.0
                lx0, ly0 = gw - S - 28.0, bowl
                lx1, ly1 = gw - S, BOT
                dx, dy = lx1 - lx0, ly1 - ly0
                mag = (dx * dx + dy * dy) ** 0.5
                ex = lx1 + dx / mag * R_LEG_EXTEND
                ey = ly1 + dy / mag * R_LEG_EXTEND
                ax0, ay0 = pad + x_off + (gx + lx1) * sc, pad + y_off + ly1 * sc
                ax1, ay1 = pad + x_off + (gx + ex) * sc, pad + y_off + ey * sc
                # Stop at the pad's outer edge, not its centre, or the trace
                # paints straight across the drilled hole and fills it in.
                stop = VIA_R + VIA_T / 2.0
                tdx, tdy = ax1 - ax0, ay1 - ay0
                tmag = (tdx * tdx + tdy * tdy) ** 0.5
                bx = ax1 - tdx / tmag * stop * sc
                by = ay1 - tdy / tmag * stop * sc
                deco.append(
                    f'<path d="M{f(ax0)} {f(ay0)} L{f(bx)} {f(by)}" stroke="{color}" '
                    f'stroke-width="{f(TRACE * sc)}" fill="none" stroke-linecap="butt"/>'
                )
                deco.append(
                    f'<circle cx="{f(ax1)}" cy="{f(ay1)}" r="{f(VIA_R * sc)}" '
                    f'fill="none" stroke="{color}" stroke-width="{f(VIA_T * sc)}"/>'
                )

            for (nl, ng, stem, direction, length) in NODES:
                if nl == li and ng == gi:
                    # Resolve against real stroke centrelines, so the trace
                    # continues the stem exactly rather than sitting near it.
                    if stem == "l":
                        sx = S
                    elif stem == "r":
                        sx = gw - S
                    else:
                        sx = gw / 2.0
                    cx = pad + x_off + (gx + sx) * sc
                    if direction < 0:
                        y0 = pad + y_off + TOP * sc
                        y1 = y0 - length * sc
                    else:
                        y0 = pad + y_off + BOT * sc
                        y1 = y0 + length * sc
                    # Stop at the pad's outer edge, not its centre, or the
                    # trace paints across the drilled hole and fills it in.
                    stop = (VIA_R + VIA_T / 2.0) * sc
                    ty1 = y1 + stop if direction < 0 else y1 - stop
                    deco.append(
                        f'<path d="M{f(cx)} {f(y0)} L{f(cx)} {f(ty1)}" stroke="{color}" '
                        f'stroke-width="{f(TRACE * sc)}" fill="none" stroke-linecap="butt"/>'
                    )
                    # Ring, not a dot - a real pad has a drilled hole. Stroked
                    # so the hole is transparent on any background colour.
                    deco.append(
                        f'<circle cx="{f(cx)}" cy="{f(y1)}" r="{f(VIA_R * sc)}" '
                        f'fill="none" stroke="{color}" stroke-width="{f(VIA_T * sc)}"/>'
                    )

    # Traces sit under the letters so a trace never crosses a glyph face.
    order = []
    if bg:
        order.append(f'<rect width="{f(vb_w)}" height="{f(vb_h)}" fill="{bg}"/>')
    order += deco + letters

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(vb_w)} {f(vb_h)}" '
        f'width="{size}" height="{f(size * vb_h / vb_w)}">\n'
        f'<title>Launchpad Robotics</title>\n' + "\n".join(order) + "\n</svg>\n"
    )


def build_monogram(color, bg=None, size=512):
    """
    App icon / favicon.

    The two-line wordmark turns to mud at 32px, so the icon is an LR monogram
    from the same glyph system with one via pad. Verified legible at 16px.
    """
    wL, pL = glyph("L")
    wR, pR = glyph("R")
    gap = 12.0
    total = wL + gap + wR
    trace_len = 24.0
    top = trace_len + VIA_R + VIA_T / 2.0

    box_w, box_h = total, H + top
    pad = box_w * 0.17
    vb = max(box_w, box_h) + pad * 2
    ox, oy = (vb - box_w) / 2, (vb - box_h) / 2
    tx = S  # trace rises off the L's stem, mirroring the wordmark's vocabulary

    parts = []
    if bg:
        parts.append(
            f'<rect width="{f(vb)}" height="{f(vb)}" rx="{f(vb * 0.2)}" fill="{bg}"/>'
        )
    parts.append(f'<g transform="translate({f(ox)},{f(oy + top)})">')
    parts.append(
        f'<path d="M{f(tx)} {f(TOP)} L{f(tx)} {f(TOP - trace_len)}" stroke="{color}" '
        f'stroke-width="{f(TRACE)}" fill="none"/>'
    )
    parts.append(
        f'<circle cx="{f(tx)}" cy="{f(TOP - trace_len)}" r="{f(VIA_R)}" fill="none" '
        f'stroke="{color}" stroke-width="{f(VIA_T)}"/>'
    )
    for p in pL:
        parts.append(
            f'<path d="{p}" stroke="{color}" stroke-width="{f(T)}" fill="none" '
            f'stroke-linecap="butt" stroke-linejoin="round"/>'
        )
    for p in pR:
        parts.append(
            f'<path transform="translate({f(wL + gap)},0)" d="{p}" stroke="{color}" '
            f'stroke-width="{f(T)}" fill="none" stroke-linecap="butt" '
            f'stroke-linejoin="round"/>'
        )
    parts.append("</g>")

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(vb)} {f(vb)}" '
        f'width="{size}" height="{size}">\n<title>Launchpad Robotics</title>\n'
        + "\n".join(parts)
        + "\n</svg>\n"
    )


if __name__ == "__main__":
    import sys

    out = sys.argv[1] if len(sys.argv) > 1 else "."
    files = {
        "wordmark-gold.svg": build(GOLD),
        "wordmark-navy.svg": build(NAVY),
        "wordmark-white.svg": build("#FFFFFF"),
        "wordmark-black.svg": build("#000000"),
        "wordmark-gold-on-navy.svg": build(GOLD, NAVY),
        "monogram-gold.svg": build_monogram(GOLD),
        "monogram-navy.svg": build_monogram(NAVY),
        "monogram-white.svg": build_monogram("#FFFFFF"),
        "monogram-black.svg": build_monogram("#000000"),
        "monogram-gold-on-navy.svg": build_monogram(GOLD, NAVY),
    }
    for name, svg in files.items():
        with open(f"{out}/{name}", "w") as fh:
            fh.write(svg)
        print(f"wrote {name}")
