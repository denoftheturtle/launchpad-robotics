import { getSettings } from "@/lib/finance";
import { saveSettings } from "@/app/actions/admin";
import { org } from "@/lib/org";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cfg = await getSettings();

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Settings</h1>
      <p className="muted small" style={{ maxWidth: "70ch" }}>
        Budget targets are internal. They drive the dashboard progress bars and
        nothing else — no dollar figures or goals appear anywhere on the public
        site.
      </p>

      <form action={saveSettings} className="form" style={{ marginTop: 22 }}>
        <div className="field">
          <label>Committed baseline budget (USD)</label>
          <input
            name="baselineBudget"
            type="number"
            step="1"
            defaultValue={cfg.baselineBudget ?? ""}
            placeholder="1030"
          />
          <span className="small muted">
            Minimum cash needed to field your current teams this season.
          </span>
        </div>
        <div className="field">
          <label>Annual target budget (USD)</label>
          <input
            name="annualBudget"
            type="number"
            step="1"
            defaultValue={cfg.annualBudget ?? ""}
            placeholder="10000"
          />
          <span className="small muted">
            Scaled target used for grant applications and registry onboarding.
          </span>
        </div>
        <div className="field">
          <label>Local sales tax rate (%)</label>
          <input
            name="salesTaxRate"
            type="number"
            step="0.01"
            defaultValue={cfg.salesTaxRate ?? ""}
            placeholder="10.3"
          />
          <span className="small muted">
            Destination-based. Used as a reference when entering expenses.
          </span>
        </div>
        <div className="field">
          <label>Fiscal period label</label>
          <input
            name="fiscalYearLabel"
            defaultValue={cfg.fiscalYearLabel ?? ""}
            placeholder="2026-27 season"
          />
        </div>
        <button className="btn" type="submit">Save settings</button>
      </form>

      <div className="card" style={{ marginTop: 32 }}>
        <h3>Fiscal sponsor reference</h3>
        <p className="small">
          These values are compiled into the site. Changing them requires a
          code edit in <code>src/lib/org.ts</code> and a redeploy — deliberate,
          since they appear on donor-facing pages.
        </p>
        <p className="small">
          <strong>Legal name:</strong> {org.sponsor.legalName}
          <br />
          <strong>EIN:</strong> {org.sponsor.ein}
          <br />
          <strong>Address:</strong> {org.sponsor.address}
          <br />
          <strong>Memo string:</strong> {org.memoString}
        </p>
      </div>
    </>
  );
}
