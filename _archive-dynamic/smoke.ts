import "dotenv/config";
import { db } from "../src/db";
import { donations, expenses, volunteerHours } from "../src/db/schema";
import { getTotals, getStaleDonations, getIneligibleExpenses, getOutstandingReimbursements, money } from "../src/lib/finance";
import { eligibilityOf } from "../src/lib/expense-policy";
import { isSponsorEligible } from "../src/lib/income-policy";

const day = 86400;
const now = Math.floor(Date.now() / 1000);

async function main() {
  await db.delete(donations); await db.delete(expenses); await db.delete(volunteerHours);

  await db.insert(donations).values([
    { donorName: "S. Meda", employer: "Microsoft", platform: "Benevity",
      grossAmount: 500, matchAmount: 500, status: "available",
      pledgedAt: now - 60*day, submittedAt: now - 60*day, processedAt: now - 50*day,
      receivedAt: now - 45*day, availableAt: now - 40*day, referenceId: "BEN-1001" },
    { donorName: "A. Patel", employer: "Amazon", platform: "Benevity",
      grossAmount: 250, matchAmount: 250, status: "submitted",
      pledgedAt: now - 70*day, submittedAt: now - 70*day, referenceId: "BEN-1002" },
    { donorName: "Grandma", grossAmount: 100, matchAmount: 0, status: "received",
      pledgedAt: now - 10*day, receivedAt: now - 5*day },
    { donorName: "J. Kim", employer: "Adobe", grossAmount: 300, matchAmount: 300,
      status: "pledged", pledgedAt: now - 2*day },
    // Non-deductible: must be tracked but excluded from every sponsor total.
    { donorName: "Nguyen family", grossAmount: 150, matchAmount: 0,
      status: "pledged", incomeType: "parent-dues", pledgedAt: now - 8*day },
    // Misrouted: non-deductible but wrongly pushed into the pipeline.
    { donorName: "Raffle proceeds", grossAmount: 75, matchAmount: 0,
      status: "received", incomeType: "quid-pro-quo",
      pledgedAt: now - 9*day, receivedAt: now - 4*day },
  ]);

  await db.insert(expenses).values([
    { vendor: "RECF", category: "registration", preTaxAmount: 200, salesTax: 0,
      totalAmount: 200, spentAt: now - 30*day, description: "Team registration",
      payeeName: "S. Meda", reimbursementStatus: "paid", reimbursedAt: now - 25*day,
      reportSubmittedAt: now - 28*day },
    { vendor: "VEX Robotics", category: "parts", preTaxAmount: 680, salesTax: 70.04,
      totalAmount: 750.04, spentAt: now - 20*day, description: "Starter kit + spares",
      payeeName: "S. Meda", reimbursementStatus: "submitted",
      reportSubmittedAt: now - 18*day },
    { vendor: "Home Depot", category: "tools", preTaxAmount: 85, salesTax: 8.76,
      totalAmount: 93.76, spentAt: now - 6*day, description: "Screwdrivers, tool box",
      payeeName: "R. Meda", reimbursementStatus: "not-submitted" },
    // Excluded by the sponsor, but mistakenly charged to sponsor funds.
    { vendor: "CustomInk", category: "apparel", preTaxAmount: 180, salesTax: 18.54,
      totalAmount: 198.54, spentAt: now - 12*day, description: "Team shirts",
      fundedBySponsor: true },
    // Excluded, correctly funded outside the pipeline.
    { vendor: "Cloudflare", category: "website", preTaxAmount: 12, salesTax: 0,
      totalAmount: 12, spentAt: now - 3*day, description: "Domain",
      fundedBySponsor: false, reimbursementStatus: "not-needed" },
  ]);

  await db.insert(volunteerHours).values([
    { personName: "S. Meda", employer: "Microsoft", activityDate: now - 15*day,
      hours: 12, eventName: "Build sessions", grantAmount: 300, status: "granted" },
    { personName: "R. Meda", employer: "Microsoft", activityDate: now - 8*day,
      hours: 6, grantAmount: 150, status: "submitted" },
  ]);

  const t = await getTotals();
  console.log("--- totals ---");
  for (const [k, v] of Object.entries(t)) console.log(k.padEnd(16), money(v as number));

  const expect = {
    available: 1000, received: 100, pending: 1100, pledged: 600,
    volunteerGrants: 300, totalRaised: 1400,
    totalSpent: 1254.34,        // everything
    sponsorSpent: 1242.34,      // excludes the self-funded domain
    selfFundedSpent: 12,
    balance: 157.66,            // raised - sponsorSpent, NOT - totalSpent
    ineligibleSponsorSpend: 198.54, // the shirts
    awaitingReimbursement: 843.80,  // VEX submitted + Home Depot unsubmitted
    unsubmittedReimbursement: 93.76, // Home Depot only
    nonDeductibleIncome: 225,        // $150 dues + $75 raffle
    misroutedIncome: 75,             // raffle wrongly marked received
  };
  let fail = 0;
  for (const [k, v] of Object.entries(expect)) {
    const got = (t as any)[k];
    if (Math.abs(got - v) > 0.01) { console.error(`MISMATCH ${k}: got ${got} want ${v}`); fail++; }
  }

  const stale = await getStaleDonations(45);
  console.log("--- stale (>45d) ---");
  stale.forEach(s => console.log(` ${s.donorName} ${s.status} ${s.daysWaiting}d ref=${s.referenceId}`));
  if (stale.length !== 1 || stale[0].referenceId !== "BEN-1002") { console.error("MISMATCH stale"); fail++; }

  const bad = await getIneligibleExpenses();
  console.log("--- ineligible, charged to sponsor ---");
  bad.forEach(b => console.log(` ${b.vendor} (${b.category}) ${money(b.totalAmount)}`));
  if (bad.length !== 1 || bad[0].vendor !== "CustomInk") {
    console.error("MISMATCH ineligible: expected only CustomInk"); fail++;
  }

  // The self-funded domain is excluded-category too, but must NOT be flagged,
  // because it never touched sponsor money.
  if (bad.some(b => b.vendor === "Cloudflare")) {
    console.error("MISMATCH: self-funded excluded expense should not be flagged"); fail++;
  }

  // Policy table sanity.
  const checks: [string, string][] = [
    ["parts", "eligible"], ["travel", "eligible"], ["tools", "eligible"],
    ["software", "eligible"], ["apparel", "not-covered"], ["food", "not-covered"],
    ["awards", "not-covered"], ["website", "not-covered"],
    ["fundraising", "not-covered"], ["admin-software", "not-covered"],
    ["other", "needs-review"],
  ];
  for (const [c, want] of checks) {
    const got = eligibilityOf(c);
    if (got !== want) { console.error(`MISMATCH policy ${c}: ${got} != ${want}`); fail++; }
  }
  console.log(`--- policy table: ${checks.length} categories checked ---`);

  const out = await getOutstandingReimbursements();
  console.log("--- outstanding reimbursements ---");
  out.forEach(o => console.log(` ${o.vendor} ${money(o.totalAmount)} ${o.reimbursementStatus} ${o.daysOutstanding}d payee=${o.payeeName} overdue=${o.overdue}`));
  if (out.length !== 2) { console.error(`MISMATCH outstanding count: ${out.length} != 2`); fail++; }
  // Already-paid registration must not appear.
  if (out.some(o => o.vendor === "RECF")) { console.error("MISMATCH: paid expense still outstanding"); fail++; }
  // Excluded apparel is not reimbursable, so it must not appear either.
  if (out.some(o => o.vendor === "CustomInk")) { console.error("MISMATCH: excluded expense in reimbursement queue"); fail++; }
  // Self-funded domain must not appear.
  if (out.some(o => o.vendor === "Cloudflare")) { console.error("MISMATCH: self-funded expense in reimbursement queue"); fail++; }
  // VEX was submitted 18 days ago, well past the ~48h turnaround.
  const vex = out.find(o => o.vendor === "VEX Robotics");
  if (!vex?.overdue) { console.error("MISMATCH: 18-day-old submitted report should be flagged overdue"); fail++; }

  // Income policy classification.
  const incomeChecks: [string, boolean][] = [
    ["public-donation", true], ["corporate-match", true],
    ["parent-dues", false], ["parent-purchase", false],
    ["quid-pro-quo", false], ["other-non-deductible", false],
  ];
  for (const [t, want] of incomeChecks) {
    if (isSponsorEligible(t) !== want) {
      console.error(`MISMATCH income ${t}: ${isSponsorEligible(t)} != ${want}`); fail++;
    }
  }
  console.log(`--- income policy: ${incomeChecks.length} types checked ---`);

  // The dues/raffle money must not have leaked into sponsor-held totals.
  // available is $1,000 from BEN-1001 only; the $75 raffle marked "received"
  // must NOT appear in `received` ($100 Grandma only).
  if (t.received !== 100) { console.error(`MISMATCH: non-deductible leaked into received (${t.received})`); fail++; }
  if (t.totalRaised !== 1400) { console.error(`MISMATCH: non-deductible leaked into totalRaised (${t.totalRaised})`); fail++; }

  console.log(fail ? `\nFAILED (${fail})` : "\nALL ASSERTIONS PASSED");
  process.exit(fail ? 1 : 0);
}
main();
