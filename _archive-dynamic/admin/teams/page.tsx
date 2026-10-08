import { desc } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { addTeam, setTeamStatus, deleteTeam } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const rows = await db.select().from(teams).orderBy(desc(teams.createdAt));

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Teams</h1>
      <p className="muted small" style={{ maxWidth: "70ch" }}>
        Teams are data, not website copy. Add or retire them here freely — the
        public site never names a specific team or program, so nothing breaks
        when your roster changes.
      </p>

      <details className="adder">
        <summary>+ Add a team</summary>
        <form action={addTeam} className="form wide">
          <div className="row">
            <div className="field">
              <label>Team name *</label>
              <input name="name" required />
            </div>
            <div className="field">
              <label>Age group</label>
              <input name="ageGroup" placeholder="Elementary" />
            </div>
            <div className="field">
              <label>Season</label>
              <input name="season" placeholder="2026-27" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="forming">
                <option value="forming">Forming</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <input name="notes" />
          </div>
          <button className="btn" type="submit">Add team</button>
        </form>
      </details>

      {rows.length === 0 ? (
        <div className="callout">No teams yet.</div>
      ) : (
        <div className="table-scroll">
          <table style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age group</th>
                <th>Season</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.ageGroup ?? "—"}</td>
                  <td>{t.season ?? "—"}</td>
                  <td>
                    <form action={setTeamStatus} style={{ display: "flex", gap: 6 }}>
                      <input type="hidden" name="id" value={t.id} />
                      <select name="status" defaultValue={t.status} style={{ width: 130 }}>
                        <option value="forming">Forming</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button className="btn small secondary" type="submit">Set</button>
                    </form>
                  </td>
                  <td>{t.notes ?? "—"}</td>
                  <td>
                    <form action={deleteTeam}>
                      <input type="hidden" name="id" value={t.id} />
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
