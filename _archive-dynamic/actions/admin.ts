"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  donations,
  expenses,
  volunteerHours,
  teams,
  inquiries,
  settings,
} from "@/db/schema";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { eligibilityOf } from "@/lib/expense-policy";
import { isSponsorEligible } from "@/lib/income-policy";

export type ActionState = { ok: boolean; message: string } | null;

async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

const secs = (v: FormDataEntryValue | null) =>
  v ? Math.floor(new Date(String(v)).getTime() / 1000) : null;
const num = (v: FormDataEntryValue | null) => Number(v ?? 0) || 0;
const str = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

/* ---------------- auth ---------------- */

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Enter an email and password." };

  const ok = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!ok) return { ok: false, message: "Invalid credentials." };

  await createSession(parsed.data.email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

/* ---------------- donations ---------------- */

export async function addDonation(formData: FormData) {
  await requireAdmin();
  const incomeType = String(
    formData.get("incomeType") ?? "public-donation"
  ) as never;

  let status = String(formData.get("status") ?? "pledged") as
    | "pledged" | "submitted" | "processed" | "received" | "available";

  // Non-deductible income cannot progress through the sponsor pipeline.
  // Pin it at `pledged` so it is tracked but never counted as sponsor funds,
  // regardless of what the client submitted.
  if (!isSponsorEligible(String(incomeType))) status = "pledged";

  const nowS = Math.floor(Date.now() / 1000);
  const dated = secs(formData.get("statusDate")) ?? nowS;

  await db.insert(donations).values({
    donorName: String(formData.get("donorName") ?? "").trim() || "Anonymous",
    donorEmail: str(formData.get("donorEmail")),
    employer: str(formData.get("employer")),
    platform: str(formData.get("platform")),
    grossAmount: num(formData.get("grossAmount")),
    matchAmount: num(formData.get("matchAmount")),
    incomeType,
    status,
    pledgedAt: dated,
    submittedAt: ["submitted", "processed", "received", "available"].includes(status) ? dated : null,
    processedAt: ["processed", "received", "available"].includes(status) ? dated : null,
    receivedAt: ["received", "available"].includes(status) ? dated : null,
    availableAt: status === "available" ? dated : null,
    referenceId: str(formData.get("referenceId")),
    isAnonymous: formData.get("isAnonymous") === "on",
    notes: str(formData.get("notes")),
  });

  revalidatePath("/admin/donations");
  revalidatePath("/admin");
}

/** Advance a donation one step and stamp the transition time. */
export async function advanceDonation(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = String(formData.get("next"));
  const nowS = Math.floor(Date.now() / 1000);

  const field = {
    submitted: "submittedAt",
    processed: "processedAt",
    received: "receivedAt",
    available: "availableAt",
  }[next];
  if (!field) return;

  // Guard the other entry point too: a non-deductible record must never be
  // advanced into the sponsor pipeline.
  const [row] = await db.select().from(donations).where(eq(donations.id, id));
  if (!row || !isSponsorEligible(row.incomeType)) return;

  await db
    .update(donations)
    .set({ status: next as never, [field]: nowS, updatedAt: nowS } as never)
    .where(eq(donations.id, id));

  revalidatePath("/admin/donations");
  revalidatePath("/admin");
}

export async function deleteDonation(formData: FormData) {
  await requireAdmin();
  await db.delete(donations).where(eq(donations.id, Number(formData.get("id"))));
  revalidatePath("/admin/donations");
  revalidatePath("/admin");
}

/* ---------------- expenses ---------------- */

export async function addExpense(formData: FormData) {
  await requireAdmin();
  const pre = num(formData.get("preTaxAmount"));
  const tax = num(formData.get("salesTax"));
  const category = (str(formData.get("category")) ?? "other") as never;

  // Enforce the sponsor's policy server-side too: a category their letter
  // excludes can never be recorded against sponsor-held funds, regardless of
  // what the client submitted.
  const requested = formData.get("fundedBySponsor") !== "0";
  const fundedBySponsor =
    eligibilityOf(String(category)) === "not-covered" ? false : requested;

  // Self-funded spend never enters the reimbursement pipeline.
  const reimbursementStatus = fundedBySponsor ? "not-submitted" : "not-needed";

  await db.insert(expenses).values({
    vendor: String(formData.get("vendor") ?? "").trim() || "Unknown",
    category,
    fundedBySponsor,
    reimbursementStatus,
    payeeName: str(formData.get("payeeName")),
    payeeAddress: str(formData.get("payeeAddress")),
    description: str(formData.get("description")),
    preTaxAmount: pre,
    salesTax: tax,
    totalAmount: Math.round((pre + tax) * 100) / 100,
    spentAt: secs(formData.get("spentAt")) ?? Math.floor(Date.now() / 1000),
    receiptUrl: str(formData.get("receiptUrl")),
    paidDirect: formData.get("paidDirect") === "on",
    reimbursedTo: str(formData.get("reimbursedTo")),
    notes: str(formData.get("notes")),
  });

  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

export async function deleteExpense(formData: FormData) {
  await requireAdmin();
  await db.delete(expenses).where(eq(expenses.id, Number(formData.get("id"))));
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

/** An expense report has been emailed to the sponsor. Starts the 48h clock. */
export async function markReportSubmitted(formData: FormData) {
  await requireAdmin();
  await db
    .update(expenses)
    .set({
      reimbursementStatus: "submitted",
      reportSubmittedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(expenses.id, Number(formData.get("id"))));
  revalidatePath("/admin/reimbursements");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

/** Payment received by the person who fronted the money. */
export async function markReimbursed(formData: FormData) {
  await requireAdmin();
  await db
    .update(expenses)
    .set({
      reimbursementStatus: "paid",
      reimbursedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(expenses.id, Number(formData.get("id"))));
  revalidatePath("/admin/reimbursements");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}

/* ---------------- volunteer hours ---------------- */

export async function addVolunteerHours(formData: FormData) {
  await requireAdmin();
  await db.insert(volunteerHours).values({
    personName: String(formData.get("personName") ?? "").trim() || "Unknown",
    employer: str(formData.get("employer")),
    activityDate: secs(formData.get("activityDate")) ?? Math.floor(Date.now() / 1000),
    hours: num(formData.get("hours")),
    eventName: str(formData.get("eventName")),
    grantAmount: num(formData.get("grantAmount")),
    status: (str(formData.get("status")) ?? "logged") as never,
    notes: str(formData.get("notes")),
  });
  revalidatePath("/admin/volunteers");
  revalidatePath("/admin");
}

export async function deleteVolunteerHours(formData: FormData) {
  await requireAdmin();
  await db.delete(volunteerHours).where(eq(volunteerHours.id, Number(formData.get("id"))));
  revalidatePath("/admin/volunteers");
  revalidatePath("/admin");
}

/* ---------------- teams ---------------- */

export async function addTeam(formData: FormData) {
  await requireAdmin();
  await db.insert(teams).values({
    name: String(formData.get("name") ?? "").trim() || "Untitled team",
    ageGroup: str(formData.get("ageGroup")),
    status: (str(formData.get("status")) ?? "forming") as never,
    season: str(formData.get("season")),
    notes: str(formData.get("notes")),
  });
  revalidatePath("/admin/teams");
}

export async function setTeamStatus(formData: FormData) {
  await requireAdmin();
  await db
    .update(teams)
    .set({ status: String(formData.get("status")) as never })
    .where(eq(teams.id, Number(formData.get("id"))));
  revalidatePath("/admin/teams");
}

export async function deleteTeam(formData: FormData) {
  await requireAdmin();
  await db.delete(teams).where(eq(teams.id, Number(formData.get("id"))));
  revalidatePath("/admin/teams");
}

/* ---------------- inquiries ---------------- */

export async function toggleInquiryHandled(formData: FormData) {
  await requireAdmin();
  await db
    .update(inquiries)
    .set({ handled: formData.get("handled") === "true" })
    .where(eq(inquiries.id, Number(formData.get("id"))));
  revalidatePath("/admin/inbox");
}

/* ---------------- settings (budget targets — admin only) ---------------- */

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const nowS = Math.floor(Date.now() / 1000);
  const entries: [string, string][] = [
    ["baselineBudget", String(formData.get("baselineBudget") ?? "")],
    ["annualBudget", String(formData.get("annualBudget") ?? "")],
    ["salesTaxRate", String(formData.get("salesTaxRate") ?? "")],
    ["fiscalYearLabel", String(formData.get("fiscalYearLabel") ?? "")],
  ];
  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value, updatedAt: nowS })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: nowS } });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}
