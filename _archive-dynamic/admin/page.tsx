import Link from "next/link";
import { db } from "@/db";
import { donations, expenses } from "@/db/schema";
import { getTotals, getStaleDonations, getSettings, money } from "@/lib/finance";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <div className={`stat${tone ? " " + tone : ""}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function Progress({ raised, goal, label }: { raised: number; goal: number; label: string }) {
  if (!goal) return null;
  const pct = Math.min(100, (raised / goal) * 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        <span className="muted">{label}</span>
        <span>
          {money(raised)} of {money(goal)} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div
        style={{
          height: 10,
          background: "var(--bg)",
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: pct >= 100 ? "var(--accent-2)" : "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const [totals, stale, cfg, allDonations, allExpenses] = await Promise.all([
    getTotals(),
    getStaleDonations(45),
    getSettings(),
    db.select().from(donations),
    db.select().from(expenses),
  ]);

  const baseline = Number(cfg.baselineBudget ?? 0);
  const annual = Number(cfg.annualBudget ?? 0);

  // Expense breakdown by category — where the money actually went.
  const byCategory = allExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.totalAmount;
    return acc;
  }, {});

  const taxPaid = allExpenses.reduce((a, e) => a + e.salesTax, 0);
  const matchTotal = allDonations.reduce((a, d) => a + d.matchAmount, 0);

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Budget summary</h1>
      <p className="muted small" style={{ marginBottom: 24 }}>
        {cfg.fiscalYearLabel || "Current period"} · {allDonations.length}{" "}
        donation records · {allExpenses.length} expenses
      </p>

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat
          label="Pending"
          value={money(totals.pending)}
          sub="Promised, not yet at sponsor"
          tone={totals.pending > 0 ? "warn" : undefined}
        />
        <Stat
          label="Received"
          value={money(totals.received)}
          sub="At sponsor, not yet released"
        />
        <Stat
          label="Available"
          value={money(totals.available)}
          sub="Reimbursement capacity"
          tone="good"
        />
        <Stat
          label="Total spent"
          value={money(totals.totalSpent)}
          sub={
            totals.selfFundedSpent > 0
              ? `${money(totals.sponsorSpent)} from sponsor funds · ${money(totals.selfFundedSpent)} self-funded`
              : `incl. ${money(taxPaid)} sales tax`
          }
        />
      </div>

      {totals.misroutedIncome > 0 && (
        <div className="callout warn" style={{ marginBottom: 28 }}>
          <strong>
            {money(totals.misroutedIncome)} of non-deductible income is sitting
            in the sponsor pipeline.
          </strong>
          <p className="small" style={{ marginBottom: 0 }}>
            Yellowstone handles only properly tax-deductible gifts. Dues, parent
            purchases, and anything the donor got equal value back for must be
            collected outside this pipeline. Fix these on the{" "}
            <Link href="/admin/donations">donations page</Link>.
          </p>
        </div>
      )}

      {totals.unsubmittedReimbursement > 0 && (
        <div className="callout warn" style={{ marginBottom: 28 }}>
          <strong>
            {money(totals.unsubmittedReimbursement)} paid out of pocket with no
            expense report filed.
          </strong>
          <p className="small" style={{ marginBottom: 0 }}>
            Yellowstone reimburses on receipt of a signed report plus a copy of
            the receipt, usually within 48 hours — but nothing happens until the
            report is sent. File these on the{" "}
            <Link href="/admin/reimbursements">reimbursements page</Link>.
          </p>
        </div>
      )}

      {totals.ineligibleSponsorSpend > 0 && (
        <div className="callout warn" style={{ marginBottom: 28 }}>
          <strong>
            {money(totals.ineligibleSponsorSpend)} charged to sponsor funds in
            categories Yellowstone does not reimburse.
          </strong>
          <p className="small" style={{ marginBottom: 0 }}>
            Their policy letter excludes apparel, food, trophies, marketing,
            website costs, fundraising expenses and business software. Review
            these on the{" "}
            <Link href="/admin/expenses">expenses page</Link> and re-tag them as
            self-funded, or expect the reimbursement to be declined.
          </p>
        </div>
      )}

      <div className="grid cols-3" style={{ marginBottom: 28 }}>
        <Stat
          label="Total raised"
          value={money(totals.totalRaised)}
          sub="Received + available + volunteer grants"
        />
        <Stat
          label="Current balance"
          value={money(totals.balance)}
          sub="Raised minus spent"
          tone={totals.balance < 0 ? "bad" : "good"}
        />
        <Stat
          label="Employer match earned"
          value={money(matchTotal)}
          sub={`+ ${money(totals.volunteerGrants)} volunteer grants`}
        />
      </div>

      {(baseline > 0 || annual > 0) && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 14 }}>Progress to targets</h3>
          {baseline > 0 && (
            <Progress raised={totals.totalRaised} goal={baseline} label="Committed baseline" />
          )}
          {annual > 0 && (
            <Progress raised={totals.totalRaised} goal={annual} label="Annual target" />
          )}
          <p className="small muted" style={{ margin: 0 }}>
            Targets are internal only — they are not displayed anywhere on the
            public site. Edit them in <Link href="/admin/settings">Settings</Link>.
          </p>
        </div>
      )}

      {stale.length > 0 && (
        <div className="callout warn" style={{ marginBottom: 28 }}>
          <strong>
            {stale.length} donation{stale.length > 1 ? "s" : ""} waiting more
            than 45 days — worth following up with the sponsor.
          </strong>
          <div className="table-scroll" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Employer</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th className="num">Days</th>
                </tr>
              </thead>
              <tbody>
                {stale.map((d) => (
                  <tr key={d.id}>
                    <td>{d.isAnonymous ? "Anonymous" : d.donorName}</td>
                    <td>{d.employer ?? "—"}</td>
                    <td className="num">{money(d.grossAmount + d.matchAmount)}</td>
                    <td>
                      <span className={`pill ${d.status}`}>{d.status}</span>
                    </td>
                    <td>{d.referenceId ?? "—"}</td>
                    <td className="num">{d.daysWaiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
            Quote the reference ID when you contact them — it&apos;s the
            fastest way to get a transaction located.
          </p>
        </div>
      )}

      {Object.keys(byCategory).length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Spending by category</h3>
          <div className="table-scroll">
            <table style={{ minWidth: 400 }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="num">Total</th>
                  <th className="num">Share</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amt]) => (
                    <tr key={cat}>
                      <td style={{ textTransform: "capitalize" }}>{cat}</td>
                      <td className="num">{money(amt)}</td>
                      <td className="num">
                        {totals.totalSpent
                          ? ((amt / totals.totalSpent) * 100).toFixed(0)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allDonations.length === 0 && allExpenses.length === 0 && (
        <div className="callout">
          <strong>Nothing recorded yet.</strong> Start by adding your{" "}
          <Link href="/admin/donations">first donation</Link> or an{" "}
          <Link href="/admin/expenses">expense</Link>, and set your budget
          targets in <Link href="/admin/settings">Settings</Link>.
        </div>
      )}
    </>
  );
}
