/**
 * Org-level constants. Deliberately league-agnostic and team-agnostic:
 * teams live in the database, budget targets live in admin settings.
 * Nothing here should need editing when a team joins or leaves.
 */
export const org = {
  name: "Launchpad Robotics",
  tagline: "Youth robotics and STEM, built by our community.",
  region: "Puget Sound, Washington",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@launchpadrobotics.org",

  sponsor: {
    legalName: "Yellowstone Robotics",
    searchNames: ["Yellowstone Robotics"],
    ein: "46-3680683",
    address: "17714 NE 105th Street, Redmond, WA 98052-2888",
    donatePage: "https://yellowstonerobotics.org/donate/",
    website: "https://yellowstonerobotics.org/",
    /** Verified against the IRS Tax Exempt Organization Search, ruling year 2014. */
    irsVerified: true,
    /** Checks are made payable to this exact string. */
    checkPayableTo: "Yellowstone Robotics",
    contact: {
      name: "Bruce Reynolds",
      title: "Executive Director",
      email: "yellowstonerobotics@gmail.com",
      phone: "425.298.7353",
    },
    /** Card processing cost passed through by the sponsor's processor. */
    cardFee: { percent: 2.9, flatCents: 30 },
    /** IRS threshold above which the sponsor mails a written acknowledgement. */
    acknowledgementThreshold: 250,
    acknowledgementBy: "April 15 of the following year",
  },

  /** The routing identifier. Must be reproduced verbatim by donors. */
  memoString: "In support of Launchpad Robotics",

  /** Shown on the volunteer-hours page; generic by design. */
  volunteerDescription:
    "Served as a volunteer parent chaperone and advisor for an independent youth robotics club over multiple seasonal build sessions. Actively supervised students during mechanical assembly and coding workflows, ensured strict adherence to workspace safety guidelines, and managed team logistics in support of preparation for the upcoming competition season.",
} as const;

/**
 * Who makes a good donor, per the sponsor's welcome letter. The pipeline only
 * works if the ask goes to the general public rather than to club families.
 */
export const donorProspects = [
  "Coworkers \u2014 especially at employers with matching programs, where one gift can double",
  "Local professionals: dentists, orthodontists, doctors, lawyers",
  "Local businesses looking for community sponsorship",
  "Extended family \u2014 grandparents, aunts and uncles, cousins",
  "Neighbors and community members who want to back hands-on STEM for kids",
] as const;

/**
 * Rules governing what income can be routed through our fiscal sponsor.
 * Sourced from Yellowstone's "IRS Guidelines" letter and the welcome packet.
 * `title` is the scannable version (home page); `detail` is the full
 * explanation (donate page).
 */
export const complianceRules = [
  {
    title: "Never name an individual child",
    detail:
      "Do not reference any individual child's name on a contribution or company form. Our sponsor will refuse and return any gift directed to the benefit of a specific individual, as IRS rules for public charities require.",
  },
  {
    title: "Not for dues, fees, or a family's own equipment",
    detail:
      "Our sponsor cannot handle participation dues or fees, payments parents make to buy robotics equipment for their own kids, or entry fees parents pay for their own kids. Those are personal expenses, not deductible gifts, and they have to stay outside this pipeline.",
  },
  {
    title: "A parent shouldn't fund their own child's participation here",
    detail:
      "Support from the general public is exactly what this pipeline is for \u2014 community members, local professionals, businesses, and coworkers. A parent covering their own child's costs is not making a charitable gift.",
  },
  {
    title: "Gifts must be unrestricted",
    detail:
      "Our sponsor handles only unrestricted, properly tax-deductible donations supporting youth robotics education. Funds cannot be earmarked for a particular student, family, or private benefit.",
  },
  {
    title: "No goods or services in return",
    detail:
      "If a donor receives something of equal value in return, that portion isn't a deductible gift and can't be routed through our sponsor. Raffles, merchandise sales, and ticketed items fall outside this pipeline.",
  },
] as const;

/**
 * Yellowstone's stated non-discrimination commitments. Worth saying out loud:
 * families sometimes assume access to funds tracks how much they donated or
 * volunteered. It does not.
 */
export const fairnessPolicy = {
  grants:
    "Our sponsor does not make funding decisions to our club based on what parents or families contributed, how much a family fundraised, or how much time they put in.",
  nonDiscrimination:
    "Yellowstone Robotics does not discriminate on the grounds of race, color, gender, or national origin.",
} as const;

/** Gross-up helper: what a donor pays by card so we net `target`. */
export function grossUp(target: number): number {
  const { percent, flatCents } = org.sponsor.cardFee;
  return Math.ceil(((target + flatCents / 100) / (1 - percent / 100)) * 100) / 100;
}

/**
 * Currency formatting. Lives here rather than in finance.ts so that public,
 * statically-rendered pages can format money without pulling in the database.
 */
export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
