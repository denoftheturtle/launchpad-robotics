"use client";

import { useState } from "react";
import {
  expensePolicy,
  policyFor,
  type ExpenseCategory,
} from "@/lib/expense-policy";

/**
 * Category picker that surfaces the sponsor's reimbursement policy at entry
 * time. Choosing an excluded category auto-flips the funding source to
 * self-funded, because charging it to sponsor money is the mistake we're
 * trying to prevent.
 */
export default function CategoryPicker() {
  const [cat, setCat] = useState<ExpenseCategory>("parts");
  const [funded, setFunded] = useState("1");
  const p = policyFor(cat);
  const excluded = p?.eligibility === "not-covered";
  const review = p?.eligibility === "needs-review";

  const eligible = expensePolicy.filter((x) => x.eligibility === "eligible");
  const notCovered = expensePolicy.filter((x) => x.eligibility === "not-covered");
  const other = expensePolicy.filter((x) => x.eligibility === "needs-review");

  return (
    <>
      <div className="field">
        <label>Category</label>
        <select
          name="category"
          value={cat}
          onChange={(e) => {
            const next = e.target.value as ExpenseCategory;
            setCat(next);
            // Excluded categories must not be charged to sponsor funds.
            if (policyFor(next)?.eligibility === "not-covered") setFunded("0");
          }}
        >
          <optgroup label="Sponsor will cover">
            {eligible.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Sponsor will NOT cover">
            {notCovered.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Unclear">
            {other.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="field">
        <label>Funding source</label>
        <select
          name="fundedBySponsor"
          value={funded}
          onChange={(e) => setFunded(e.target.value)}
          disabled={excluded}
        >
          <option value="1">Sponsor-held funds</option>
          <option value="0">Self-funded / outside pipeline</option>
        </select>
        {excluded && <input type="hidden" name="fundedBySponsor" value="0" />}
      </div>

      {p && (
        <p
          className={`small ${excluded ? "warn-text" : review ? "muted" : "muted"}`}
          style={{ flexBasis: "100%", marginTop: -4 }}
        >
          {excluded && <strong>Not reimbursable. </strong>}
          {review && <strong>Check first. </strong>}
          {p.note}
        </p>
      )}
    </>
  );
}
