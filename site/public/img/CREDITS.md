# Image credits

These are **licence obligations, not optional courtesy.** CC-BY requires visible
attribution. Do not ship these files without the credit line rendered somewhere a
user can reach (currently the footer links here).

## In use

### circuit-hero.jpg
- **Source:** "JTAG board 1" by AMagill (Flickr)
- **Licence:** CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/
- **Original:** https://live.staticflickr.com/3213/2877921712_ccd83cd5f5_b.jpg
- **Found via:** Openverse (https://openverse.org)
- **Modifications:** cropped, desaturated, duotoned into brand navy, contrast
  adjusted, darkened for use as a background. CC BY permits derivatives;
  modification is disclosed here as required.
- **Used in:** hero band, footer band.

### parts-band.jpg
- **Source:** "Montaje Chassis Robot" by m4rlonj (Flickr)
- **Licence:** CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/
- **Original:** https://live.staticflickr.com/3048/2941704765_0d54f7f866_b.jpg
- **Found via:** Openverse (https://openverse.org)
- **Modifications:** same duotone treatment as above.
- **Used in:** `.parts-band` divider on the home page.

## Why no photos of people

Deliberate. Three reasons, in order of how badly they bite:

1. **Credibility.** A parent who recognises a stock photo on a youth nonprofit's
   site stops trusting everything else on it, including the donation page.
2. **Consent.** Photos of identifiable minors need signed media releases. Stock
   photos have model releases for the model, which is not the same as our
   programme implying those kids are our participants.
3. **Accuracy.** Implying kids are in our programme when they are not is a
   misrepresentation on a page that solicits donations.

Abstract hardware texture gives the same engineering feeling with none of this.

## Replacing these with real photos

This is the goal. When the programme has real photos **with signed releases**:

1. Drop them in `public/img/`.
2. Update the `.hero` and `footer` rules in `src/app/globals.css`.
3. Keep the navy gradient scrim — it is what guarantees text contrast over an
   arbitrary photo. Without it, light areas of a photo will eat the headline.
4. Delete the entry above once the CC-BY images are no longer shipped.

Prefer: hands on hardware, robots mid-build, workspace detail. Faces need
releases on file; wide shots of a team from behind usually do not, but check.
