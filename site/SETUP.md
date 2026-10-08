# Launchpad Robotics — setup

The site is **static HTML**. No server, no database, no login.
Money tracking lives in a Google Sheet; forms email the club Gmail.

---

## 1. Create the Google Sheet (10 min)

CSVs are in `../sheets/`. In a new Google Sheet, for each file:
**File → Import → Upload → Insert new sheet**, then rename the tab:

| File | Tab name |
|---|---|
| `1-Lists.csv` | Lists |
| `2-Donations.csv` | Donations |
| `3-Expenses.csv` | Expenses |
| `4-Volunteer hours.csv` | Volunteer hours |
| `5-Teams.csv` | Teams |

Import Lists **first** — the dropdowns and the Expenses "Covered?" formula
reference it by name.

### Add the dropdowns

Select the column, then **Data → Data validation → Dropdown (from a range)**:

- Donations `Income type` → `Lists!A18:A23`
- Donations `Status` → `Lists!A26:A30`
- Expenses `Category` → `Lists!A2:A15`
- Expenses `Reimbursement status` → `Lists!A33:A36`
- Volunteer hours `Status` → `Lists!A44:A47`
- Teams `Status` → `Lists!A39:A41`

Verify the row numbers against your imported Lists tab before setting these —
if a note wrapped onto two rows the offsets shift.

### Then

1. Delete the `EXAMPLE` row in each tab (keep the headers).
2. Drag the Expenses `Covered?` formula down the column. It looks the category
   up in Lists, so it can never disagree with Yellowstone's policy.
3. **Share with specific people** (the 2–3 parents who handle money).
   Do **not** use "anyone with the link." Google is the only access control
   here — there is no second password.

### Why "Covered?" is a formula, not a column you type

The expensive failure is: someone buys team shirts with donated money,
submits the receipt, Yellowstone declines it, and a parent is personally out
the cash. The formula makes the verdict appear the moment the category is
picked — before the money is spent.

Regenerate the CSVs any time the policy changes: `npm run sheets`

---

## 2. Connect the forms (5 min)

1. Sign up at [formspree.io](https://formspree.io) with the club Gmail (free
   tier ≈ 50 submissions/month).
2. Create a form, copy its ID (the `xxxxxxxx` in `formspree.io/f/xxxxxxxx`).
3. Set it as `NEXT_PUBLIC_FORMSPREE_ID` in the host's env vars.

Until that is set the forms show a `mailto:` fallback rather than silently
discarding submissions — a lost volunteer offer is worse than an ugly handoff.

Submissions land in the club Gmail. Set up a filter → label "Volunteers" so
they don't get buried.

---

## 3. Deploy (10 min)

Build output is the `out/` directory — plain HTML/CSS/JS.

**Cloudflare Pages** (recommended — no commercial-use restriction, unlike
Vercel's free tier, which matters because we solicit donations):

1. Push to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → connect the repo.
3. Build command `npm run build`, output directory `out`.
4. Add the `NEXT_PUBLIC_FORMSPREE_ID` env var.

Netlify and GitHub Pages work identically.

### Domain

Buy at **Cloudflare Registrar** (at-cost, no renewal markup) or Porkbun —
about $10–12/yr for a `.org`. Then Pages → Custom domains → add it. HTTPS is
automatic.

> **Website costs cannot come from Yellowstone funds.** "Website" is on their
> excluded list. Someone pays the ~$12/yr personally or it comes from
> non-sponsor money. Keeping it this cheap is the point.

---

## Local development

```bash
npm install
npm run dev     # http://localhost:3210
npm run build   # → out/
npm run sheets  # regenerate the CSVs from the policy files
```

---

## What changed, and what to do if you want it back

The original build had a Next.js admin UI, a Turso/libSQL database, and
bcrypt+JWT login. All of it is in **`../_archive-dynamic/`** — archived, not
deleted.

It was dropped because a spreadsheet is more durable for a volunteer-run org:
the next treasurer is a parent who knows Excel, not Drizzle. It also removes
every runtime failure mode and the hosting bill.

The policy logic survived the move. `src/lib/expense-policy.ts` and
`src/lib/income-policy.ts` are still the source of truth — they are
transcribed from Yellowstone's letter and `npm run sheets` generates the Lists
tab from them, so the sheet and the code cannot drift.

To restore the dynamic version: copy `_archive-dynamic/` back into `src/`,
reinstall `@libsql/client drizzle-orm bcryptjs jose`, and remove
`output: "export"` from `next.config.ts`.
