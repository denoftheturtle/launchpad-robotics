/**
 * What income may be routed through our fiscal sponsor.
 *
 * Source: Yellowstone Robotics, "IRS Guidelines" (Bruce Reynolds, ED).
 * Yellowstone handles only unrestricted, properly tax-deductible donations.
 * Club income that isn't deductible must be kept out of the sponsor pipeline
 * — it's not a paperwork preference, it's what keeps the 501(c)(3) clean.
 */

export type IncomeType =
  | "public-donation"
  | "corporate-match"
  | "parent-dues"
  | "parent-purchase"
  | "quid-pro-quo"
  | "other-non-deductible";

export type IncomePolicy = {
  value: IncomeType;
  label: string;
  /** May this be routed through the fiscal sponsor? */
  sponsorEligible: boolean;
  note: string;
};

export const incomePolicy: IncomePolicy[] = [
  {
    value: "public-donation",
    label: "Donation from the general public",
    sponsorEligible: true,
    note: "Community members, coworkers, local businesses. Exactly what the sponsor is for.",
  },
  {
    value: "corporate-match",
    label: "Corporate match or volunteer grant",
    sponsorEligible: true,
    note: "Employer matching funds and volunteer-hour grants paid to the sponsor.",
  },
  {
    value: "parent-dues",
    label: "Participation dues or fees",
    sponsorEligible: false,
    note: "Fees your club requires for participation are not deductible. Collect these outside the sponsor pipeline.",
  },
  {
    value: "parent-purchase",
    label: "Parent buying equipment / entry for their own child",
    sponsorEligible: false,
    note: "A parent purchasing robotics equipment or paying entry fees for their own kid is a personal expense, not a gift.",
  },
  {
    value: "quid-pro-quo",
    label: "Donor received something of equal value",
    sponsorEligible: false,
    note: "Raffles, merchandise, ticketed items. The portion matched by value received is not deductible.",
  },
  {
    value: "other-non-deductible",
    label: "Other non-deductible income",
    sponsorEligible: false,
    note: "Anything else that isn't a properly tax-deductible gift.",
  },
];

export function incomePolicyFor(v: string): IncomePolicy | undefined {
  return incomePolicy.find((p) => p.value === v);
}

export function isSponsorEligible(v: string): boolean {
  return incomePolicyFor(v)?.sponsorEligible ?? false;
}

export const sponsorEligibleIncome = incomePolicy.filter((p) => p.sponsorEligible);
export const nonDeductibleIncome = incomePolicy.filter((p) => !p.sponsorEligible);

/** The sponsor's own one-line test, quoted for the UI. */
export const incomeTest =
  "Yellowstone handles support for your club from the general public. It does not handle dues, fees, parents buying equipment for their own kids, or anything the donor gets equal value back for.";
