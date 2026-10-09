import type { Metadata, Viewport } from "next";
import "./globals.css";
import { org } from "@/lib/org";

export const metadata: Metadata = {
  // Absolute base for canonical/OG URLs. Pages also serves this site on
  // launchpad-robotics.pages.dev and on per-deploy hash subdomains, which we
  // cannot disable; metadataBase makes every emitted URL point at the host we
  // actually want indexed.
  metadataBase: new URL("https://launchpadrobotics.org"),
  alternates: { canonical: "/" },
  title: `${org.name} — ${org.tagline}`,
  description:
    "Launchpad Robotics supports parent-led youth robotics and STEM teams in the Puget Sound area. Donate, get your gift matched, or volunteer.",
};

/** Dark browser chrome on mobile so the URL bar matches the page. */
export const viewport: Viewport = {
  themeColor: "#16203a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
