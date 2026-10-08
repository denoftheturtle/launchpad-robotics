import { desc } from "drizzle-orm";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { money } from "@/lib/finance";
import {
  sponsorEligibleIncome,
  nonDeductibleIncome,
  incomePolicyFor,
  isSponsorEligible,
  incomeTest,
} from "@/lib/income-policy";
import { addDonation, advanceDonation, deleteDonation } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const NEXT: Record<string, string | null> = {
  pledged: "submitted",
  submitted: "processed",
  processed: "received",
  received: "available",
  available: null,
};

function dt(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DonationsPage() {
  const rows = await db.select().from(donations).orderBy(desc(donations.createdAt));
  const total = rows.reduce((a, d) => a + d.grossAmount + d.matchAmount, 0);

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Donations ledger</h1>
      <p className="muted small">
        {rows.length} records · {money(total)} gross + match ·{" "}
        <a href="/api/export/donations">Download CSV</a>
      </p>

      <details className="adder">
        <summary>+ Record a donation</summary>
        <form action={addDonation} className="form wide">
          <div className="row">
            <div className="field">
              <label>Donor name *</label>
              <input name="donorName" required />
            </div>
            <div className="field">
              <label>Donor email</label>
              <input name="donorEmail" type="email" />
            </div>
            <div className="field">
              <label>Employer</label>
              <input name="employer" placeholder="Microsoft" />
            </div>
            <div className="field">
              <label>Platform</label>
              <input name="platform" placeholder="Benevity" />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Gift amount *</label>
              <input name="grossAmount" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label>Employer match</label>
              <input name="matchAmount" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="field">
              <label>Income type *</label>
              <select name="incomeType" defaultValue="public-donation">
                <optgroup label="Routed through the sponsor">
                  {sponsorEligibleIncome.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </optgroup>
                <optgroup label="NOT tax-deductible — keep outside the sponsor">
                  {nonDeductibleIncome.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="submitted">
                <option value="pledged">Pledged</option>
                <option value="submitted">Submitted to employer</option>
                <option value="processed">Processed by employer</option>
                <option value="received">Received by sponsor</option>
                <option value="available">Available to spend</option>
              </select>
            </div>
            <div className="field">
              <label>Date of this status</label>
              <input name="statusDate" type="date" />
            </div>
          </div>
          <p className="small muted" style={{ marginTop: -4 }}>
            {incomeTest} Non-deductible income is recorded for your own books
            but stays pinned at &ldquo;pledged&rdquo; and never counts toward
            sponsor funds.
          </p>
          <div className="row">
            <div className="field">
              <label>Confirmation / reference ID</label>
              <input name="referenceId" placeholder="Benevity transaction ID" />
            </div>
            <div className="field">
              <label>Notes</label>
              <input name="notes" />
            </div>
          </div>
          <div className="checkbox">
            <input id="anon" name="isAnonymous" type="checkbox" />
            <label htmlFor="anon" style={{ margin: 0 }}>
              Donor wishes to remain anonymous publicly
            </label>
          </div>
          <button className="btn" type="submit">Save donation</button>
        </form>
      </details>

      {rows.length === 0 ? (
        <div className="callout">No donations recorded yet.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Employer</th>
                <th className="num">Gift</th>
                <th className="num">Match</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Received</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const pol = incomePolicyFor(d.incomeType);
                const eligible = isSponsorEligible(d.incomeType);
                const next = eligible ? NEXT[d.status] : null;
                return (
                  <tr key={d.id}>
                    <td>
                      {d.donorName}
                      {d.isAnonymous && <span className="tag">anon</span>}
                      {!eligible && (
                        <span
                          className="pill unconfirmed"
                          style={{ marginLeft: 6 }}
                          title={pol?.note}
                        >
                          not deductible
                        </span>
                      )}
                    </td>
                    <td>{d.employer ?? "—"}</td>
                    <td className="num">{money(d.grossAmount)}</td>
                    <td className="num">{money(d.matchAmount)}</td>
                    <td className="num">{money(d.grossAmount + d.matchAmount)}</td>
                    <td><span className={`pill ${d.status}`}>{d.status}</span></td>
                    <td>{dt(d.submittedAt)}</td>
                    <td>{dt(d.receivedAt)}</td>
                    <td>{d.referenceId ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {next && (
                          <form action={advanceDonation}>
                            <input type="hidden" name="id" value={d.id} />
                            <input type="hidden" name="next" value={next} />
                            <button className="btn small" type="submit">
                              → {next}
                            </button>
                          </form>
                        )}
                        <form action={deleteDonation}>
                          <input type="hidden" name="id" value={d.id} />
                          <button className="btn small secondary" type="submit">
                            ×
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
