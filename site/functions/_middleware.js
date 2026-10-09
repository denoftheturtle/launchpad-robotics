/**
 * Canonical host redirect.
 *
 * Cloudflare Pages always serves the project on <project>.pages.dev and on a
 * per-deployment <hash>.<project>.pages.dev. Those cannot be turned off -- the
 * custom domain is layered on top of them, not a replacement for them. Left
 * alone they are fully browsable copies of the site, which splits search
 * ranking and lets someone link to a URL we do not control the lifetime of.
 *
 * So: anything that is not the canonical host gets a 301 to the same path on
 * launchpadrobotics.org. 301 rather than 302 so search engines transfer
 * ranking signals instead of indexing both.
 */
const CANONICAL_HOST = "launchpadrobotics.org";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === CANONICAL_HOST) {
    return context.next();
  }

  url.hostname = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";

  return Response.redirect(url.toString(), 301);
}
