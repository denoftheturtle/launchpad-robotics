import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const ROUTES = ["", "/donate", "/volunteer", "/volunteer-hours", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `https://launchpadrobotics.org${path}/`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
