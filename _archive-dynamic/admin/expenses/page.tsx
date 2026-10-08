import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { money, getSettings } from "@/lib/finance";
import { addExpense, deleteExpense } from "@/app/actions/admin";
import CategoryPicker from "@/components/CategoryPicker";
import { policyFor } from "@/lib/expense-policy";

export const dynamic = "force-dynamic";

function dt(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ExpensesPage() {
  const [rows, cfg] = await Promise.all([
    db.select().from(expenses).orderBy(desc(expenses.spentAt)),
    getSettings(),
  ]);
  const total = rows.reduce((a, e) => a + e.totalAmount, 0);
  const tax = rows.reduce((a, e) => a + e.salesTax, 0);

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Expenses ledger</h1>
      <p className="muted small">
        {rows.length} records · {money(total)} total · {money(tax)} sales tax ·{" "}
        <a href="/api/export/expenses">Download CSV</a>
      </p>

      <div className="callout small">
        Sales tax is tracked separately because purchases are taxed at the{" "}
        <strong>delivery destination</strong> — Washington rates apply even
        when the vendor ships from a state where our sponsor holds an
        exemption. Current configured rate:{" "}
        <strong>{cfg.salesTaxRate ? `${cfg.salesTaxRate}%` : "not set"}</strong>.
      </div>

      <details className="adder">
        <summary>+ Record an expense</summary>
        <form action={addExpense} className="form wide">
          <div className="row">
            <div className="field">
              <label>Vendor *</label>
              <input name="vendor" required />
            </div>
            <CategoryPicker />
            <div className="field">
              <label>Date *</label>
              <input name="spentAt" type="date" required />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Pre-tax amount *</label>
              <input name="preTaxAmount" type="number" step="0.01" required />
            </div>
            <div className="field">
              <label>Sales tax</label>
              <input name="salesTax" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="field">
              <label>Receipt URL</label>
              <input name="receiptUrl" type="url" />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <input name="description" />
          </div>
          <div className="row">
            <div className="field">
              <label>Payee — who fronted the money *</label>
              <input name="payeeName" placeholder="Name the check should be made out to" />
            </div>
            <div className="field">
              <label>Payee mailing address</label>
              <input name="payeeAddress" placeholder="Where Yellowstone sends payment" />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Notes</label>
              <input name="notes" />
            </div>
          </div>
          <p className="small muted" style={{ marginTop: -4 }}>
            Sponsor-funded expenses start as &ldquo;needs an expense report.&rdquo;
            File it from the{" "}
            <Link href="/admin/reimbursements">reimbursements page</Link> to get
            the payee paid back.
          </p>
          <button className="btn" type="submit">Save expense</button>
        </form>
      </details>

      {rows.length === 0 ? (
        <div className="callout">No expenses recorded yet.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Description</th>
                <th className="num">Pre-tax</th>
                <th className="num">Tax</th>
                <th className="num">Total</th>
                <th>Receipt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const pol = policyFor(e.category);
                const bad = e.fundedBySponsor && pol?.eligibility === "not-covered";
                return (
                <tr key={e.id}>
                  <td>{dt(e.spentAt)}</td>
                  <td>{e.vendor}</td>
                  <td>
                    {pol?.label ?? e.category}
                    {bad && (
                      <span className="pill unconfirmed" style={{ marginLeft: 6 }}>
                        not reimbursable
                      </span>
                    )}
                    {!e.fundedBySponsor && (
                      <span className="pill" style={{ marginLeft: 6 }}>
                        self-funded
                      </span>
                    )}
                  </td>
                  <td>{e.description ?? "—"}</td>
                  <td className="num">{money(e.preTaxAmount)}</td>
                  <td className="num">{money(e.salesTax)}</td>
                  <td className="num">{money(e.totalAmount)}</td>
                  <td>
                    {e.receiptUrl ? (
                      <a href={e.receiptUrl} target="_blank" rel="noreferrer">
                        view
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="btn small secondary" type="submit">×</button>
                    </form>
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
