import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations, expenses, volunteerHours } from "@/db/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
  ].join("\n");
}

/** Dates as ISO strings so the file is readable by a human (or a sponsor). */
function humanize(rows: Record<string, unknown>[], dateCols: string[]) {
  return rows.map((r) => {
    const o = { ...r };
    for (const c of dateCols) {
      if (typeof o[c] === "number" && o[c]) {
        o[c] = new Date((o[c] as number) * 1000).toISOString().slice(0, 10);
      }
    }
    return o;
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  if (!(await getSession())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { table } = await params;
  let rows: Record<string, unknown>[];
  let dateCols: string[];

  switch (table) {
    case "donations":
      rows = (await db.select().from(donations)) as never;
      dateCols = ["pledgedAt", "submittedAt", "processedAt", "receivedAt", "availableAt", "createdAt", "updatedAt"];
      break;
    case "expenses":
      rows = (await db.select().from(expenses)) as never;
      dateCols = ["spentAt", "createdAt"];
      break;
    case "volunteers":
      rows = (await db.select().from(volunteerHours)) as never;
      dateCols = ["activityDate", "submittedAt", "grantedAt", "createdAt"];
      break;
    default:
      return new NextResponse("Unknown table", { status: 404 });
  }

  const csv = toCsv(humanize(rows, dateCols));
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="launchpad-${table}-${stamp}.csv"`,
    },
  });
}
