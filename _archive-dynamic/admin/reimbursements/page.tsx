import Link from "next/link";
import { money, getOutstandingReimbursements, getTotals } from "@/lib/finance";
import { policyFor } from "@/lib/expense-policy";
import { org } from "@/lib/org";
import { markReportSubmitted, markReimbursed } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

function dt(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ReimbursementsPage() {
  const [rows, totals] = await Promise.all([
    getOutstandingReimbursements(),
    getTotals(),
  ]);

  const unsubmitted = rows.filter((r) => r.reimbursementStatus === "not-submitted");
  const submitted = rows.filter((r) => r.reimbursementStatus === "submitted");

  return (
    <>
      <div className="page-head">
        <h1>Reimbursements</h1>
        <p className="muted">
          Yellowstone doesn&apos;t hold a spendable account for us. Someone pays
          out of pocket, files an expense report with the receipt, and Bruce
          sends a payment — usually within 48 hours.
        </p>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 28 }}>
        <div className="stat">
          <div className="label">Owed to people right now</div>
          <div className="value">{money(totals.awaitingReimbursement)}</div>
          <div className="sub">Paid out of pocket, not yet repaid</div>
        </div>
        <div className="stat">
          <div className="label">No report filed yet</div>
          <div className="value">{money(totals.unsubmittedReimbursement)}</div>
          <div className="sub">Nothing is moving until these are submitted</div>
        </div>
        <div className="stat">
          <div className="label">Reimbursement capacity</div>
          <div className="value">{money(totals.available)}</div>
          <div className="sub">Donor funds Yellowstone holds for us</div>
        </div>
      </div>

      {totals.awaitingReimbursement > totals.available && (
        <div className="callout warn" style={{ marginBottom: 28 }}>
          <strong>
            Outstanding reimbursements exceed the funds Yellowstone is holding.
          </strong>
          <p className="small" style={{ marginBottom: 0 }}>
            {money(totals.awaitingReimbursement)} is owed but only{" "}
            {money(totals.available)} has cleared. Expect a partial payment, or
            chase the pending donations on the{" "}
            <Link href="/admin/donations">donations page</Link> first.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>How to file</h3>
        <ol className="small" style={{ marginBottom: 8 }}>
          <li>
            Get the expense report form from the{" "}
            <a href={org.sponsor.website} target="_blank" rel="noreferrer">
              Yellowstone website
            </a>{" "}
            (or use your own format).
          </li>
          <li>Fill in the club info and a description of the expense.</li>
          <li>Attach a copy of the merchant receipt as proof of payment.</li>
          <li>
            Sign it, then email to{" "}
            <a href={`mailto:${org.sponsor.contact.email}`}>
              {org.sponsor.contact.email}
            </a>
            . Call ahead if you plan to FAX.
          </li>
        </ol>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Payment goes to the name and address on the report — make sure it
          names whoever actually fronted the money.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="muted">Nothing outstanding. Everyone&apos;s square.</p>
      ) : (
        <>
          {unsubmitted.length > 0 && (
            <>
              <h2 style={{ fontSize: 18 }}>
                Needs an expense report ({unsubmitted.length})
              </h2>
              <p className="small muted" style={{ marginTop: -6 }}>
                These are the ones to act on. Until a report is filed, nobody at
                Yellowstone knows the money is owed.
              </p>
              <Table rows={unsubmitted} action="submit" />
            </>
          )}

          {submitted.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, marginTop: 28 }}>
                Submitted, awaiting payment ({submitted.length})
              </h2>
              <Table rows={submitted} action="pay" />
            </>
          )}
        </>
      )}
    </>
  );
}

type Row = Awaited<ReturnType<typeof getOutstandingReimbursements>>[number];

function Table({ rows, action }: { rows: Row[]; action: "submit" | "pay" }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Spent</th>
            <th>Vendor</th>
            <th>Category</th>
            <th>Payee</th>
            <th className="num">Amount</th>
            {action === "pay" && <th>Report sent</th>}
            <th className="num">Age</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td>{dt(e.spentAt)}</td>
              <td>{e.vendor}</td>
              <td>{policyFor(e.category)?.label ?? e.category}</td>
              <td>
                {e.payeeName ?? (
                  <span className="pill unconfirmed">payee not set</span>
                )}
              </td>
              <td className="num">{money(e.totalAmount)}</td>
              {action === "pay" && <td>{dt(e.reportSubmittedAt)}</td>}
              <td className="num">
                {e.daysOutstanding}d
                {e.overdue && (
                  <span className="pill unconfirmed" style={{ marginLeft: 6 }}>
                    chase
                  </span>
                )}
              </td>
              <td>
                <form action={action === "submit" ? markReportSubmitted : markReimbursed}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="btn small" type="submit">
                    {action === "submit" ? "Mark filed" : "Mark paid"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
