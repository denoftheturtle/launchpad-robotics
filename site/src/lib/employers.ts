import fs from "node:fs";
import path from "node:path";

export type VolunteerGrant = {
  offered: boolean;
  ratePerHourUsd: number | null;
  annualCapUsd: number | null;
  notes?: string;
};

export type Employer = {
  slug: string;
  name: string;
  platform: string | null;
  portalUrl: string | null;
  matchRatio: string | null;
  annualCapUsd: number | null;
  volunteerGrant?: VolunteerGrant | null;
  eligibility?: string | null;
  confidence: "verified" | "unconfirmed";
  sources?: string[];
  notes?: string;
  /**
   * Some employers only match gifts to educational institutions, and some
   * have no program at all. Saying so up front saves donors a doomed
   * submission and saves us an awkward follow-up.
   */
  restriction?: "education-only" | "no-program" | null;
};

/**
 * Baseline from the org manual. Used if the researched dataset isn't present.
 * Everything here is stated in our own sponsor documentation.
 */
const fallback: Employer[] = [
  {
    slug: "microsoft",
    name: "Microsoft",
    platform: "Benevity",
    portalUrl: "https://microsoft.benevity.org",
    matchRatio: "1:1",
    annualCapUsd: 15000,
    volunteerGrant: { offered: true, ratePerHourUsd: 25, annualCapUsd: 15000 },
    confidence: "verified",
  },
  {
    slug: "amazon",
    name: "Amazon",
    platform: "Benevity",
    portalUrl: "https://amazon.benevity.org",
    matchRatio: null,
    annualCapUsd: null,
    confidence: "unconfirmed",
  },
  {
    slug: "google",
    name: "Google",
    platform: "Benevity",
    portalUrl: "https://google.benevity.org",
    matchRatio: null,
    annualCapUsd: null,
    confidence: "unconfirmed",
  },
  {
    slug: "boeing",
    name: "Boeing",
    platform: "Benevity",
    portalUrl: "https://boeing.benevity.org",
    matchRatio: null,
    annualCapUsd: null,
    confidence: "unconfirmed",
  },
  {
    slug: "cisco",
    name: "Cisco",
    platform: "Benevity",
    portalUrl: "https://cisco.benevity.org",
    matchRatio: "1:1",
    annualCapUsd: null,
    confidence: "unconfirmed",
  },
  {
    slug: "meta",
    name: "Meta",
    platform: "YourCause",
    portalUrl: null,
    matchRatio: null,
    annualCapUsd: null,
    confidence: "unconfirmed",
  },
];

let cache: Employer[] | null = null;

export function getEmployers(): Employer[] {
  if (cache) return cache;
  try {
    const p = path.join(process.cwd(), "src", "data", "employers.json");
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const list: Employer[] = raw.employers ?? [];
    if (list.length) {
      cache = list.sort((a, b) => {
        // Verified programs first, then by generosity, then alphabetical.
        if (a.confidence !== b.confidence) return a.confidence === "verified" ? -1 : 1;
        const ca = a.annualCapUsd ?? -1;
        const cb = b.annualCapUsd ?? -1;
        if (ca !== cb) return cb - ca;
        return a.name.localeCompare(b.name);
      });
      return cache;
    }
  } catch {
    // fall through
  }
  cache = fallback;
  return cache;
}

export function capLabel(e: Employer) {
  if (e.annualCapUsd == null) return "Cap not published — check your portal";
  return `Up to $${e.annualCapUsd.toLocaleString("en-US")}/year`;
}

/** Employers whose programs can actually fund us. */
export function matchable(list: Employer[]) {
  return list.filter((e) => !e.restriction);
}

export function restricted(list: Employer[]) {
  return list.filter((e) => e.restriction);
}
