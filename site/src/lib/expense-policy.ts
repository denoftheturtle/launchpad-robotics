/**
 * Yellowstone Robotics expense policy, transcribed from the sponsor's
 * "Expenses Allowed Within IRS Guidelines" letter (Bruce Reynolds, ED).
 *
 * The governing test: does the expense *directly* support kids building and
 * using robots? Anything that fails that test is not reimbursable from
 * sponsor-held funds, even though it may still be a real cost the club incurs.
 *
 * We encode this rather than leaving it in a PDF because the failure mode is
 * expensive: you buy team shirts out of donated funds, submit the receipt, and
 * Yellowstone declines it. Now a parent is personally out the money.
 */

export type ExpenseCategory =
  | "parts"
  | "registration"
  | "tournament"
  | "travel"
  | "tools"
  | "software"
  | "apparel"
  | "food"
  | "awards"
  | "marketing"
  | "website"
  | "fundraising"
  | "admin-software"
  | "other";

export type Eligibility = "eligible" | "not-covered" | "needs-review";

export interface CategoryPolicy {
  value: ExpenseCategory;
  label: string;
  eligibility: Eligibility;
  /** Shown in admin when this category is selected. */
  note: string;
}

export const expensePolicy: CategoryPolicy[] = [
  {
    value: "parts",
    label: "Robotics parts & equipment",
    eligibility: "eligible",
    note: "Core qualifying expense.",
  },
  {
    value: "registration",
    label: "Registration fees",
    eligibility: "eligible",
    note: "Event and competition entrance fees qualify.",
  },
  {
    value: "tournament",
    label: "Competition / event fees",
    eligibility: "eligible",
    note: "Event and competition entrance fees qualify.",
  },
  {
    value: "travel",
    label: "Travel to competitions",
    eligibility: "eligible",
    note: "Bus rental, gas, or IRS standard mileage for a private vehicle. Keep a mileage log.",
  },
  {
    value: "tools",
    label: "Tools",
    eligibility: "eligible",
    note: "Screwdrivers, saws, tape measures, tool boxes.",
  },
  {
    value: "software",
    label: "Robotics software (for the kids)",
    eligibility: "eligible",
    note: "Design and development software the students use, e.g. RobotC, AutoCAD.",
  },

  {
    value: "apparel",
    label: "Tee shirts / uniforms",
    eligibility: "not-covered",
    note: "Explicitly excluded by the sponsor. Fund separately.",
  },
  {
    value: "food",
    label: "Food & snacks",
    eligibility: "not-covered",
    note: "Explicitly excluded by the sponsor. Fund separately.",
  },
  {
    value: "awards",
    label: "Trophies & awards",
    eligibility: "not-covered",
    note: "Explicitly excluded by the sponsor.",
  },
  {
    value: "marketing",
    label: "Banners / advertising / business cards",
    eligibility: "not-covered",
    note: "Explicitly excluded by the sponsor.",
  },
  {
    value: "website",
    label: "Website & domain",
    eligibility: "not-covered",
    note: "Explicitly excluded. This site's domain and hosting cannot be paid from sponsor funds.",
  },
  {
    value: "fundraising",
    label: "Fundraising expenses",
    eligibility: "not-covered",
    note: "Explicitly excluded by the sponsor.",
  },
  {
    value: "admin-software",
    label: "Business software (Office, QuickBooks)",
    eligibility: "not-covered",
    note: "Non-robotics software is excluded. Student robotics software is fine — use that category.",
  },
  {
    value: "other",
    label: "Other",
    eligibility: "needs-review",
    note: "Not on the sponsor's list either way. Ask Bruce before spending if the amount is material.",
  },
];

const byValue = new Map(expensePolicy.map((p) => [p.value, p]));

export function policyFor(c: string): CategoryPolicy | undefined {
  return byValue.get(c as ExpenseCategory);
}

export function eligibilityOf(c: string): Eligibility {
  return policyFor(c)?.eligibility ?? "needs-review";
}

export const eligibleCategories = expensePolicy.filter((p) => p.eligibility === "eligible");
export const excludedCategories = expensePolicy.filter((p) => p.eligibility === "not-covered");

/** The sponsor's own one-line test, for display. */
export const governingTest =
  "Any expense that directly supports kids building and using robots qualifies.";
