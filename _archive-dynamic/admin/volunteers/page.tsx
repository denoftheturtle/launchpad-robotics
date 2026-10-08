import { desc } from "drizzle-orm";
import { db } from "@/db";
import { volunteerHours } from "@/db/schema";
import { money } from "@/lib/finance";
import { addVolunteerHours, deleteVolunteerHours } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

function dt(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function VolunteersPage() {
  const rows = await db
    .select()
    .from(volunteerHours)
    .orderBy(desc(volunteerHours.activityDate));

  const hours = rows.reduce((a, v) => a + v.hours, 0);
  const granted = rows
    .filter((v) => v.status === "granted")
    .reduce((a, v) => a + v.grantAmount, 0);
  const awaiting = rows
    .filter((v) => v.status === "submitted")
    .reduce((a, v) => a + v.grantAmount, 0);

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Volunteer hours</h1>
      <p className="muted small">
        {hours.toFixed(1)} hours logged · {money(granted)} granted ·{" "}
        {money(awaiting)} awaiting ·{" "}
        <a href="/api/export/volunteers">Download CSV</a>
      </p>

      <details className="adder">
        <summary>+ Log volunteer hours</summary>
        <form action={addVolunteerHours} className="form wide">
          <div className="row">
            <div className="field">
              <label>Volunteer name *</label>
              <input name="personName" required />
            </div>
            <div className="field">
              <label>Employer</label>
              <input name="employer" />
            </div>
            <div className="field">
              <label>Date *</label>
              <input name="activityDate" type="date" required />
            </div>
            <div className="field">
              <label>Hours *</label>
              <input name="hours" type="number" step="0.25" required />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Event / activity</label>
              <input name="eventName" placeholder="Weekly build session" />
            </div>
            <div className="field">
              <label>Expected grant amount</label>
              <input name="grantAmount" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="logged">
                <option value="logged">Logged internally</option>
                <option value="submitted">Submitted to employer</option>
                <option value="granted">Grant received</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <input name="notes" />
          </div>
          <button className="btn" type="submit">Save hours</button>
        </form>
      </details>

      {rows.length === 0 ? (
        <div className="callout">No volunteer hours logged yet.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Volunteer</th>
                <th>Employer</th>
                <th>Activity</th>
                <th className="num">Hours</th>
                <th className="num">Grant</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td>{dt(v.activityDate)}</td>
                  <td>{v.personName}</td>
                  <td>{v.employer ?? "—"}</td>
                  <td>{v.eventName ?? "—"}</td>
                  <td className="num">{v.hours}</td>
                  <td className="num">{money(v.grantAmount)}</td>
                  <td>
                    <span className={`pill ${v.status === "granted" ? "received" : "submitted"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <form action={deleteVolunteerHours}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="btn small secondary" type="submit">×</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
