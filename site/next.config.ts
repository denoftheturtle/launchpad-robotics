import type { NextConfig } from "next";

/**
 * Static export. There is no server: donations/expenses live in a Google
 * Sheet and forms post to Formspree, so every route is prerendered HTML that
 * any static host will serve for free.
 *
 * `images.unoptimized` is required because next/image's optimizer is a server
 * feature. Our images are pre-sized duotone JPEGs, so nothing is lost.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
