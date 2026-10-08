import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { toggleInquiryHandled } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

function dt(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function InboxPage() {
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  const open = rows.filter((r) => !r.handled);

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Inbox</h1>
      <p className="muted small">
        {open.length} unhandled of {rows.length} total
      </p>

      {rows.length === 0 ? (
        <div className="callout">
          No submissions yet. Contact and volunteer forms land here.
        </div>
      ) : (
        <div className="grid cols-2">
          {rows.map((r) => (
            <div
              className="card"
              key={r.id}
              style={{ opacity: r.handled ? 0.55 : 1 }}
            >
              <h3>
                {r.name}
                <span className="tag">{r.kind}</span>
                {r.handled && <span className="tag">handled</span>}
              </h3>
              <p className="small muted" style={{ marginBottom: 8 }}>
                {dt(r.createdAt)} · <a href={`mailto:${r.email}`}>{r.email}</a>
                {r.phone ? ` · ${r.phone}` : ""}
              </p>
              {r.message && <p>{r.message}</p>}
              {r.skills && (
                <p className="small">
                  <strong>Can help with:</strong> {r.skills}
                </p>
              )}
              {r.availability && (
                <p className="small">
                  <strong>Availability:</strong> {r.availability}
                </p>
              )}
              {r.kind === "volunteer" && (
                <p className="small">
                  <strong>Background check:</strong>{" "}
                  {r.backgroundCheckOk ? "willing" : "not indicated"}
                </p>
              )}
              <form action={toggleInquiryHandled}>
                <input type="hidden" name="id" value={r.id} />
                <input
                  type="hidden"
                  name="handled"
                  value={r.handled ? "false" : "true"}
                />
                <button className="btn small secondary" type="submit">
                  {r.handled ? "Reopen" : "Mark handled"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
