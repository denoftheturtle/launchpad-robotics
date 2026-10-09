import type { MetadataRoute } from "next";

// Required under output: "export" -- these are route handlers, and the static
// exporter will not emit them unless they are declared static.
export const dynamic = "force-static";

/**
 * Point crawlers at the canonical host. The Pages middleware already 301s
 * pages.dev traffic here, but a robots.txt naming the real sitemap means a
 * crawler that reached a stale pages.dev copy still ends up indexing
 * launchpadrobotics.org.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://launchpadrobotics.org/sitemap.xml",
    host: "launchpadrobotics.org",
  };
}
