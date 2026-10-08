import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = sql`(strftime('%s','now'))`;

/** Teams are data, not copy. Add/retire freely without touching the site. */
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ageGroup: text("age_group"),
  status: text("status", { enum: ["forming", "active", "inactive"] })
    .notNull()
    .default("forming"),
  season: text("season"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull().default(now),
});

/**
 * Donation lifecycle. The whole point of this table is the status pipeline:
 * you need to know what's been promised vs what Yellowstone actually holds.
 */
export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email"),
  employer: text("employer"),
  platform: text("platform"),
  grossAmount: real("gross_amount").notNull(),
  matchAmount: real("match_amount").notNull().default(0),
  status: text("status", {
    enum: ["pledged", "submitted", "processed", "received", "available"],
  })
    .notNull()
    .default("pledged"),
  // Timestamps per transition — this is what lets you age a stuck donation.
  pledgedAt: integer("pledged_at"),
  submittedAt: integer("submitted_at"),
  processedAt: integer("processed_at"),
  receivedAt: integer("received_at"),
  availableAt: integer("available_at"),
  referenceId: text("reference_id"),
  teamId: integer("team_id").references(() => teams.id),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  /**
   * What kind of income this is. Only `public-donation` and `corporate-match`
   * are properly tax-deductible and may be routed through the sponsor.
   * Dues, parent purchases and quid-pro-quo income must stay out of the
   * sponsor pipeline entirely — see Yellowstone's IRS Guidelines letter.
   */
  incomeType: text("income_type", {
    enum: [
      "public-donation",
      "corporate-match",
      "parent-dues",
      "parent-purchase",
      "quid-pro-quo",
      "other-non-deductible",
    ],
  })
    .notNull()
    .default("public-donation"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
});

/** WA destination sales tax is broken out so procurement math stays honest. */
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendor: text("vendor").notNull(),
  category: text("category", {
    enum: [
      "parts",
      "registration",
      "tournament",
      "travel",
      "tools",
      "software",
      "apparel",
      "food",
      "awards",
      "marketing",
      "website",
      "fundraising",
      "admin-software",
      "other",
    ],
  })
    .notNull()
    .default("other"),
  /**
   * Whether this came out of sponsor-held funds. Ineligible expenses are still
   * worth recording — they are real club costs — but they must be funded
   * outside the Yellowstone pipeline, and they must not reduce available funds.
   */
  fundedBySponsor: integer("funded_by_sponsor", { mode: "boolean" })
    .notNull()
    .default(true),
  description: text("description"),
  preTaxAmount: real("pre_tax_amount").notNull(),
  salesTax: real("sales_tax").notNull().default(0),
  totalAmount: real("total_amount").notNull(),
  spentAt: integer("spent_at").notNull(),
  receiptUrl: text("receipt_url"),
  paidDirect: integer("paid_direct", { mode: "boolean" }).notNull().default(true),
  reimbursedTo: text("reimbursed_to"),
  teamId: integer("team_id").references(() => teams.id),
  notes: text("notes"),
  /**
   * Reimbursement pipeline. Yellowstone does not hold a spendable balance we
   * can draw from: someone pays out of pocket, submits an expense report plus
   * receipt, and Bruce cuts a payment (typically within 48h). Until that
   * lands, a real person is personally out the money.
   */
  reimbursementStatus: text("reimbursement_status", {
    enum: ["not-needed", "not-submitted", "submitted", "paid"],
  })
    .notNull()
    .default("not-submitted"),
  reportSubmittedAt: integer("report_submitted_at"),
  reimbursedAt: integer("reimbursed_at"),
  /** Who fronted the money, and where the payment should be sent. */
  payeeName: text("payee_name"),
  payeeAddress: text("payee_address"),
  createdAt: integer("created_at").notNull().default(now),
});

export const volunteerHours = sqliteTable("volunteer_hours", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personName: text("person_name").notNull(),
  employer: text("employer"),
  activityDate: integer("activity_date").notNull(),
  hours: real("hours").notNull(),
  eventName: text("event_name"),
  grantAmount: real("grant_amount").notNull().default(0),
  status: text("status", { enum: ["logged", "submitted", "granted", "denied"] })
    .notNull()
    .default("logged"),
  submittedAt: integer("submitted_at"),
  grantedAt: integer("granted_at"),
  teamId: integer("team_id").references(() => teams.id),
  notes: text("notes"),
  createdAt: integer("created_at").notNull().default(now),
});

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["contact", "volunteer"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  skills: text("skills"),
  availability: text("availability"),
  backgroundCheckOk: integer("background_check_ok", { mode: "boolean" }),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(now),
});

/** Single-row key/value settings. Budget targets live here — admin only. */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull().default(now),
});
