import { Nav, Footer } from "@/components/Chrome";
import CopyField from "@/components/CopyField";
import { org } from "@/lib/org";
import { getEmployers } from "@/lib/employers";

export const metadata = { title: `Log Volunteer Hours — ${org.name}` };

export default function VolunteerHoursPage() {
  const granting = getEmployers().filter((e) => e.volunteerGrant?.offered);

  return (
    <>
      <Nav />
      <main>
        <div className="hero">
          <div className="wrap">
            <h1>Turn your volunteer hours into funding</h1>
            <p className="lead">
              Many employers pay cash grants to nonprofits based on hours their
              employees volunteer. If you&apos;ve helped out at a build session,
              chaperoned a tournament or helped haul equipment, those hours may
              be worth real money to our teams — at no cost to you beyond a few
              minutes in a portal.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <h2>How to log them</h2>
            <ol style={{ paddingLeft: 20, maxWidth: "70ch" }}>
              <li>
                Log into your company&apos;s workplace giving system — usually
                Benevity, YourCause, or an internal HR portal.
              </li>
              <li>
                Find <strong>Volunteer Activity Tracking</strong> or{" "}
                <strong>Log Hours</strong>.
              </li>
              <li>Search for our nonprofit host by name or EIN:</li>
            </ol>

            <CopyField label="Organization" value={org.sponsor.searchNames[0]} />
            <CopyField label="EIN" value={org.sponsor.ein} />

            <ol start={4} style={{ paddingLeft: 20, maxWidth: "70ch" }}>
              <li>Enter your accrued hours.</li>
              <li>
                In the memo or designation field, add the routing identifier
                exactly:
              </li>
            </ol>

            <CopyField value={org.memoString} />
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>&quot;What did you do when volunteering?&quot;</h2>
            <p className="section-sub">
              Most portals ask for a description. This one is written to
              satisfy corporate compliance review — paste it as-is, or edit to
              match what you actually did.
            </p>
            <CopyField block value={org.volunteerDescription} />
          </div>
        </section>

        {granting.length > 0 && (
          <section>
            <div className="wrap">
              <h2>Employers we know pay volunteer grants</h2>
              <p className="section-sub">
                Rates change and this list is not exhaustive — check your own
                portal for current terms.
              </p>
              <div className="grid cols-3">
                {granting.map((e) => (
                  <div className="card" key={e.slug}>
                    <h3 style={{ fontSize: 16 }}>{e.name}</h3>
                    <p className="small">
                      {e.volunteerGrant?.ratePerHourUsd
                        ? `~$${e.volunteerGrant.ratePerHourUsd} per hour`
                        : "Volunteer grants offered"}
                      {e.volunteerGrant?.annualCapUsd
                        ? ` · up to $${e.volunteerGrant.annualCapUsd.toLocaleString("en-US")}/yr`
                        : ""}
                    </p>
                    {e.volunteerGrant?.notes && (
                      <p className="small muted">{e.volunteerGrant.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="wrap">
            <h2>Already logged some hours?</h2>
            <p className="section-sub">
              Let us know so we can track the grant and follow up if it
              doesn&apos;t arrive. <a href="/contact">Send us a note</a> with
              your employer and the number of hours submitted.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
