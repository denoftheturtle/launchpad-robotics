/**
 * Generates the Google Sheet tabs as CSVs.
 *
 * Why CSV and not the Sheets API: creating a spreadsheet needs Drive OAuth
 * that only Sunny can authorise, and `gog sheets` can only read/write sheets
 * that already exist. CSVs import cleanly and need no credentials, so this
 * stays reproducible by anyone.
 *
 * The point of generating rather than hand-writing: the dropdown values and
 * the eligibility verdicts come from the SAME source files the site used
 * (expense-policy.ts / income-policy.ts), which were transcribed from
 * Yellowstone's letter. Hand-typing them into a sheet is how they drift.
 *
 *   npx tsx scripts/make-sheets.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { expensePolicy } from "../src/lib/expense-policy";
import { incomePolicy } from "../src/lib/income-policy";

const OUT = join(process.cwd(), "..", "sheets");
mkdirSync(OUT, { recursive: true });

const csv = (rows: string[][]) =>
  rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n") + "\n";

const write = (name: string, rows: string[][]) => {
  writeFileSync(join(OUT, name), csv(rows));
  console.log(`  ${name}  (${rows.length - 1} data rows)`);
};

/* ------------------------------------------------------------------ *
 * Lists — the tab every dropdown points at.
 * Keeping the verdict NEXT TO the option means the person entering data
 * sees "NOT COVERED" at the moment they pick it, not in a policy doc.
 * ------------------------------------------------------------------ */
const listRows: string[][] = [
  ["Expense category", "Covered by Yellowstone?", "Note"],
  ...expensePolicy.map((p) => [
    p.label,
    p.eligibility === "eligible"
      ? "YES"
      : p.eligibility === "not-covered"
        ? "NO - fund separately"
        : "ASK BRUCE FIRST",
    p.note,
  ]),
  [],
  ["Income type", "Tax-deductible?", "Note"],
  ...incomePolicy.map((p) => [
    p.label,
    p.sponsorEligible ? "YES - may route through Yellowstone" : "NO - keep out of sponsor pipeline",
    p.note ?? "",
  ]),
  [],
  ["Donation status", "", "Meaning"],
  ["pledged", "", "Promised, nothing submitted yet"],
  ["submitted", "", "Sent to employer / platform"],
  ["processed", "", "Employer or platform approved it"],
  ["received", "", "Yellowstone has the money"],
  ["available", "", "Confirmed drawable for our teams"],
  [],
  ["Reimbursement status", "", "Meaning"],
  ["not-needed", "", "Paid directly by Yellowstone, nobody fronted it"],
  ["not-submitted", "", "Someone is out of pocket and HAS NOT filed yet"],
  ["submitted", "", "Expense report sent to Bruce"],
  ["paid", "", "Reimbursement received"],
  [],
  ["Team status", "", ""],
  ["forming", "", ""],
  ["active", "", ""],
  ["inactive", "", ""],
  [],
  ["Volunteer hours status", "", ""],
  ["logged", "", "Recorded, not yet submitted to employer"],
  ["submitted", "", "Filed in the employer portal"],
  ["granted", "", "Employer paid the grant"],
  ["denied", "", ""],
];
console.log("Writing sheet CSVs:");
write("1-Lists.csv", listRows);

/* Donations. incomeType sits early and adjacent to amount so a non-deductible
 * entry is visible at a glance rather than buried off-screen right. */
write("2-Donations.csv", [
  [
    "Date",
    "Donor name",
    "Email",
    "Employer",
    "Income type",
    "Gross amount",
    "Match amount",
    "Total",
    "Status",
    "Date submitted",
    "Date received",
    "Reference ID",
    "Team",
    "Anonymous?",
    "Notes",
  ],
  [
    "2026-01-15",
    "EXAMPLE - delete this row",
    "donor@example.com",
    "Microsoft",
    "Donation from the general public",
    "250",
    "250",
    "=F2+G2",
    "submitted",
    "2026-01-16",
    "",
    "MSFT-12345",
    "",
    "no",
    "Match pending in Benevity",
  ],
]);

/* Expenses. "Covered?" is a formula, not a typed value - it looks the category
 * up in Lists so it cannot disagree with the policy. */
write("3-Expenses.csv", [
  [
    "Date",
    "Vendor",
    "Category",
    "Covered?",
    "Description",
    "Pre-tax",
    "Sales tax",
    "Total",
    "Funded by sponsor?",
    "Who paid out of pocket",
    "Reimbursement status",
    "Date submitted",
    "Date reimbursed",
    "Receipt link",
    "Team",
    "Notes",
  ],
  [
    "2026-01-20",
    "EXAMPLE - delete this row",
    "Robotics parts & equipment",
    "=IFERROR(VLOOKUP(C2,Lists!$A$2:$B$15,2,FALSE),\"\")",
    "Motors and wheels",
    "120.00",
    "11.40",
    "=F2+G2",
    "yes",
    "",
    "not-needed",
    "",
    "",
    "",
    "",
    "",
  ],
]);

write("4-Volunteer hours.csv", [
  [
    "Date",
    "Person",
    "Employer",
    "Hours",
    "Event",
    "Grant amount",
    "Status",
    "Date submitted",
    "Date granted",
    "Team",
    "Notes",
  ],
  [
    "2026-01-18",
    "EXAMPLE - delete this row",
    "Boeing",
    "4",
    "Regional tournament",
    "",
    "logged",
    "",
    "",
    "",
    "Employer pays $10/hr to nonprofits",
  ],
]);

write("5-Teams.csv", [
  ["Team name", "Age group", "Status", "Season", "Notes"],
  ["EXAMPLE - delete this row", "Middle school", "forming", "2026", ""],
]);

console.log(`\nWrote to ${OUT}`);
