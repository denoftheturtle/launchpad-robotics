import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon.
 *
 * LR monogram lifted from brand/monogram-v2-icon-currentcolor.svg, which reuses
 * the exact L and R outlines from the v2 wordmark - so the icon cannot drift
 * from the logo. The R's via-pad terminal is dropped here: at icon sizes the
 * pad closes up into a blob. Verified legible at 32px.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg viewBox="40 77 339 275" width={180} height={180}>
          <rect x="40" y="77" width="339" height="275" rx="48" fill="#111c34"/>
          <g fill="#f5c518" fillRule="evenodd">
<path id="letter-l" d="M74 110H100V208H147V230H74Z"/>
<g transform="translate(27,-156)"><g id="letter-r">
        <path d="M146 266H185C216 266 232 279 232 304C232 323 222 337 203 342L253 427L233 438L182 344H177V323H184C200 323 207 317 207 304C207 292 200 286 184 286H146Z"/>
        <path d="M146 297H172V390H146Z"/>
        
      </g></g>
</g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
