# Launchpad Robotics — website

Static site for **Launchpad Robotics**, a parent-led youth robotics and STEM
program in Washington State. We help parent-run teams with parts, entry costs
and the paperwork — we are not a facility or a coaching staff.

Launchpad Robotics operates as a sponsored program of **Yellowstone Robotics**,
a registered 501(c)(3) public charity (EIN 46-3680683).

## Stack

Next.js 15 exported to static HTML. No server, no database, no login.

- Money tracking lives in a Google Sheet (templates in [`sheets/`](./sheets))
- Forms post to Formspree and arrive in the club Gmail
- Deploys to any static host; hosting cost is the domain alone

See **[site/SETUP.md](./site/SETUP.md)** for sheet setup, form wiring and deploy steps.

## Develop

```bash
cd site
npm install
npm run dev     # http://localhost:3210
npm run build   # → site/out/
npm run sheets  # regenerate the Google Sheet CSVs from the policy files
```

## Layout

| Path | What |
|---|---|
| `site/` | The Next.js app |
| `brand/` | Wordmark and monogram SVGs (`wordmark-v2-currentcolor.svg` is canonical) |
| `sheets/` | Generated CSVs to import as Google Sheet tabs |
| `data/` | Employer matching-gift research, compiled from public CSR pages |
| `_archive-dynamic/` | The previous database-backed admin build, kept for reference |

## A note on the expense policy

`site/src/lib/expense-policy.ts` and `income-policy.ts` are transcribed from our
fiscal sponsor's written guidance on what IRS rules let them reimburse. The
Google Sheet's dropdowns are **generated** from those files (`npm run sheets`),
so the spreadsheet and the code cannot drift apart.

This matters because the failure mode is expensive: buy something ineligible
with donated funds, submit the receipt, have it declined — and a volunteer is
personally out the money. Keep the generator as the single source of truth.

## Images

Hero and divider images are Creative Commons and **require attribution**, which
ships at [`site/public/img/CREDITS.md`](./site/public/img/CREDITS.md) and is
linked in the site footer. Don't remove it while those images are in use.
