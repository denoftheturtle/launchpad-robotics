# Launchpad Robotics — Brand

## The wordmark

Two lines of monoline geometric caps — LAUNCHPAD over ROBOTICS — with circuit
traces growing out of the letter stems and terminating in round via pads.

The circuitry is the idea: it's a robotics club, and the traces say that
without resorting to a robot, a gear, or a rocket. Because the traces grow
*out of the letterforms* rather than sitting beside them as decoration, the
mark reads as one object instead of "type plus clip art."

### These are drawn, not typed

The glyphs are custom vector paths, not a font. That's deliberate:

1. A logo must render identically everywhere without shipping a font file.
2. Print shops convert type to outlines anyway — this is already outlines.
3. Only by owning the outlines can the traces attach to specific stem
   terminals at exact coordinates.

Construction: 100-unit cap height, uniform 17-unit stroke, built from straight
segments and quadratic curves on a strict grid. Traces are 7 units —
deliberately lighter than the letters, so they read as circuitry rather than as
part of the type.

Three things carry this mark, and all three are easy to get wrong:

1. **Weight — 17% of cap height.** Medium, not hairline and not black. Too
   thin reads as a tech startup rather than a kids' robotics club, and it
   vanishes when printed small on fabric. Too heavy closes the counters and the
   traces stop reading as a separate, lighter layer.
2. **Via pads are rings, not dots.** A real through-hole pad is an annulus with
   a drilled hole. They're stroked circles with no fill, so the hole stays
   genuinely transparent and the mark works on any background without a
   knockout shape. Solid dots read as bullet points and kill the circuit
   reference entirely.
3. **Open tracking, one cap height.** Both words are drawn at the *same
   scale* and centred; the shorter one is simply narrower. Scaling each line
   to a common width instead would form a tidy rectangle but silently shrink
   LAUNCHPAD, since it has nine letters to ROBOTICS' eight. Two different type
   sizes in a two-line wordmark reads as a mistake, because it is one.

Geometry lives in **`build_wordmark.py`**. Edit there and regenerate; don't
hand-edit the SVGs or the React component.

### Two bugs worth remembering

Both were caught only by rendering the thing and looking at it — neither was
visible in the coordinates:

- The **O** originally had a wide PCB-style gap and collapsed into a **C**. The
  second line read `RCBCTICS`. The break is now a hairline.
- A via under the **S** tail read as a **cedilla** (`Ş`). There is now no node
  on the S. Not every letter needs one; the traces should look placed, not
  distributed.

### Verified

Wordmark legible down to **110px wide**. Monogram legible at **16px**. Both
checked by rendering at target size and looking — coordinates lie.

The design was matched against the reference garment by rendering mine directly
beneath it and comparing. That caught a first pass that was far too thin, then
an overcorrection that was too heavy and too tight. Worth repeating that loop
for any future change.

## Files

Vector, single-colour, in `brand/`. Hand the SVGs straight to a printer.

| File | Use |
| --- | --- |
| `wordmark-gold.svg` | Primary. Gold on navy garments. |
| `wordmark-navy.svg` | Navy on light garments. |
| `wordmark-white.svg` | One-colour white on any dark ground. |
| `wordmark-black.svg` | One-colour black on any light ground. |
| `wordmark-gold-on-navy.svg` | Preview/comp with its navy ground baked in. |
| `monogram-gold-on-navy.svg` | App icon, avatars, rounded tile. |
| `monogram-gold/navy/white/black.svg` | Small placements, left chest, cap. |

Regenerate everything:

```bash
cd brand && python3 build_wordmark.py .
```

### Printing

It's **one ink colour** — a single screen-print plate. A second colour roughly
doubles the per-shirt cost and this mark gains nothing from it. Gold on navy
is the primary; navy on white, white on black, black on white all work.

Minimum print width for the two-line wordmark is about **2 inches**. Below
that, use the monogram.

## In the app

- `src/components/Wordmark.tsx` — `<Wordmark width>` and `<Logo width>`.
  Uses `currentColor`, so it takes its colour from CSS.
- `src/app/icon.tsx` / `apple-icon.tsx` — favicon and iOS icon, **generated**
  from the same geometry so they can't drift from the wordmark.

## Colour

Taken from the merchandise: navy ground, gold print.

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#0b1222` | Page ground |
| `--card` | `#17223c` | Raised surfaces |
| `--accent` | `#f5c518` | Wordmark, links, primary action |
| `--accent-ink` | `#1a1405` | Text sitting on gold |
| `--fg` | `#eef2fa` | Body text |
| `--muted` | `#9aa8c4` | Secondary text |

All pairs verified against **WCAG AA**: gold on bg 11.46:1, gold on card
9.68:1, body text 16.65:1, muted 7.81:1, ink on gold buttons 11.24:1. The
lowest is comfortably past the 4.5:1 threshold.

## Typography

System UI stack for body copy — no webfont. A webfont is a render-blocking
network request that costs real time on a phone on gym wifi, for a difference
most visitors won't consciously register. The wordmark carries the personality;
the body text just needs to be readable.

## Mobile

Phone-first, because the realistic reader is a parent on a phone, possibly
standing in a gym.

- **16px minimum on form inputs** — anything smaller makes iOS zoom the page on
  focus, which is disorienting and hard to recover from.
- **Safe-area insets** so content clears notches and rounded corners.
- **Nav and admin bar scroll horizontally** with a fade hint, rather than
  hiding behind a hamburger nobody opens.
- **Full-width primary buttons** under 760px. Thumbs are not mice.
- **`minmax(min(300px, 100%), 1fr)`** on every grid, so tracks can't overflow a
  320px iPhone SE.
- **Copy fields stack** under 760px — the single most important mobile
  interaction on the site is a donor copying the EIN into an employer portal.
- **Wordmark scales down** to 124px (then 108px) in the nav rather than
  wrapping or crowding the links.
- **`prefers-reduced-motion`** respected.

## What to avoid

- Don't add gradients, glows, or drop shadows.
- Don't set the name in a font and call it the logo — use the SVGs.
- Don't add vias to every letter. The current placement is balanced, not
  symmetrical, and deliberately skips the S.
- Don't fill the via pads. They are rings with real holes; that's the whole
  circuit-board reference.
- Don't tighten the tracking. It was tried and it broke the mark.
- Don't thin the traces to a hairline. They are the *same weight as the stems*
  because they're the stems continuing; narrowing them turns them into pins
  stuck onto the type.
- Don't run a trace to the centre of its pad. Stop it at the pad's outer edge,
  or it paints across the drilled hole and the via reads as a solid blob.
- Don't shallow out the P's bowl. Above ~50% of cap height it reads as an F.
- Don't justify the two lines to equal width. It shrinks LAUNCHPAD and the
  cap heights stop matching.
- Don't set the two lines flush left or justified; both lines are centred.
- Don't stretch non-uniformly or recolour outside the palette.
