import { Nav, Footer } from "@/components/Chrome";
import CopyField from "@/components/CopyField";
import { org, fairnessPolicy, donorProspects, grossUp, money } from "@/lib/org";
import { getEmployers, capLabel, matchable, restricted } from "@/lib/employers";

export const metadata = { title: `Donate & Match — ${org.name}` };

export default function DonatePage() {
  const all = getEmployers();
  const employers = matchable(all);
  const blocked = restricted(all);
  const verified = employers.filter((e) => e.confidence === "verified");
  const others = employers.filter((e) => e.confidence !== "verified");

  return (
    <>
      <Nav />
      <main>
        <div className="hero">
          <div className="wrap">
            <h1>Donate &amp; get it matched</h1>
            <p className="lead">
              Every gift goes through our fiscal sponsor, so it&apos;s fully
              tax-deductible — and most large employers in this region will
              match it, often dollar for dollar. Five minutes in your
              company&apos;s giving portal can double what your gift is worth.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <h2>The three things you&apos;ll need</h2>
            <p className="section-sub">
              Whatever portal your employer uses, it&apos;ll ask for some
              version of these. Copy them exactly.
            </p>

            <CopyField label="Search for this organization" value={org.sponsor.searchNames[0]} />
            <CopyField label="EIN / Tax ID" value={org.sponsor.ein} />
            <CopyField label="Designation / memo / comment field — verbatim" value={org.memoString} />

            <div className="callout warn">
              <strong>The memo line is the whole ballgame.</strong> Our sponsor
              supports multiple programs. Without that exact designation text,
              your gift lands in their general fund instead of with our teams.
              Use the copy button rather than retyping it.
            </div>

            <div className="callout">
              <strong>Confirmed registrations.</strong> Our sponsor is already
              registered with Benevity, YourCause and the PayPal Giving Fund,
              and is certified to receive employee donations and corporate
              matching funds at several major Puget Sound employers including
              Boeing, Microsoft, Amazon, Google and Meta. If you work at one of
              those, your search will resolve.
            </div>

            <div className="callout">
              <strong>Organization address, if the form asks:</strong>
              <br />
              {org.sponsor.address}
            </div>

            <p className="small muted">
              Want to verify us independently? {org.sponsor.legalName} appears
              in the{" "}
              <a
                href="https://apps.irs.gov/app/eos/"
                target="_blank"
                rel="noreferrer"
              >
                IRS Tax Exempt Organization Search
              </a>
              , as well as Charity Navigator and GuideStar.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>Find your employer</h2>
            <p className="section-sub">
              Local employers we have confirmed program details for. If yours
              isn&apos;t listed, the generic steps above still work — search
              your giving portal by EIN.
            </p>

            <div className="grid cols-2">
              {verified.map((e) => (
                <div className="card" key={e.slug}>
                  <h3>
                    {e.name}
                    <span className="pill verified" style={{ marginLeft: 8 }}>
                      verified
                    </span>
                  </h3>
                  <p>
                    {e.matchRatio ? `${e.matchRatio} match` : "Matching program"}
                    {" · "}
                    {capLabel(e)}
                    {e.platform ? ` · via ${e.platform}` : ""}
                  </p>
                  {e.volunteerGrant?.offered && (
                    <p>
                      <strong>Volunteer grants:</strong>{" "}
                      {e.volunteerGrant.ratePerHourUsd
                        ? `about $${e.volunteerGrant.ratePerHourUsd}/hour`
                        : "offered"}
                      {" — see "}
                      <a href="/volunteer-hours">how to log hours</a>.
                    </p>
                  )}
                  {e.eligibility && <p className="small muted">{e.eligibility}</p>}
                  {e.notes && <p className="small muted">{e.notes}</p>}
                  {e.portalUrl && (
                    <a
                      className="btn small"
                      href={e.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open giving portal →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {others.length > 0 && (
              <>
                <h3>Other local employers</h3>
                <p className="small muted">
                  These employers are known to run giving programs, but we
                  haven&apos;t been able to confirm current ratios or caps from
                  a public source. Check your internal portal for the real
                  numbers — and if you find them,{" "}
                  <a href="/contact">tell us</a> so we can update this page.
                </p>
                <div className="grid cols-3">
                  {others.map((e) => (
                    <div className="card" key={e.slug}>
                      <h3 style={{ fontSize: 15 }}>{e.name}</h3>
                      <p className="small">
                        {e.platform ?? "Program details unconfirmed"}
                        {e.matchRatio ? ` · ${e.matchRatio}` : ""}
                      </p>
                      {e.portalUrl && (
                        <a
                          className="small"
                          href={e.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Portal →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {blocked.length > 0 && (
              <>
                <h3>Employers whose programs likely won&apos;t cover us</h3>
                <p className="small muted">
                  Worth knowing before you spend time in a portal. Several
                  large employers restrict matching to educational
                  institutions only, and some have no employee matching
                  program at all. If you work at one of these, a direct gift
                  through our sponsor still helps — and your spouse&apos;s
                  employer may match.
                </p>
                <div className="grid cols-3">
                  {blocked.map((e) => (
                    <div className="card" key={e.slug}>
                      <h3 style={{ fontSize: 15 }}>
                        {e.name}
                        <span className="pill unconfirmed" style={{ marginLeft: 8 }}>
                          {e.restriction === "education-only"
                            ? "education only"
                            : "no program"}
                        </span>
                      </h3>
                      {e.notes && <p className="small muted">{e.notes}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>No workplace portal?</h2>
            <p className="section-sub">
              Friends, family and anyone without a corporate giving program can
              donate directly through our sponsor&apos;s secure page.
            </p>
            <a className="btn" href={org.sponsor.donatePage} target="_blank" rel="noreferrer">
              Donate via our sponsor →
            </a>
            <p className="small muted" style={{ marginTop: 14 }}>
              Include this in the transaction note:
            </p>
            <CopyField value={org.memoString} />

            <div className="callout" style={{ marginTop: 22 }}>
              <strong>Giving by check avoids processing fees.</strong>
              <p className="small" style={{ marginBottom: 10 }}>
                Card gifts lose {org.sponsor.cardFee.percent}% plus{" "}
                {org.sponsor.cardFee.flatCents}&cent; to the payment processor. A
                check delivers the full amount. If you&apos;d rather give by
                card and still have us receive a round number, gross the gift up
                — a {money(1000)} gift should be entered as{" "}
                {money(grossUp(1000))}.
              </p>
              <CopyField label="Make the check payable to" value={org.sponsor.checkPayableTo} />
              <CopyField label="Mail it to" value={org.sponsor.address} />
              <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
                Write &ldquo;{org.memoString}&rdquo; on the memo line so it
                reaches our club.
              </p>
            </div>

            <p className="small muted" style={{ marginTop: 16 }}>
              Gifts of {money(org.sponsor.acknowledgementThreshold)} or more
              receive a written tax acknowledgement from{" "}
              {org.sponsor.legalName}, mailed no later than{" "}
              {org.sponsor.acknowledgementBy}.
            </p>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <h2>Not sure who to ask?</h2>
            <p className="section-sub">
              This pipeline is built for support from the wider community. Our
              sponsor&apos;s own guidance on where that support usually comes
              from:
            </p>
            <ul className="checklist">
              {donorProspects.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="small muted">
              If you&apos;re a parent on one of our teams, the highest-leverage
              thing you can do isn&apos;t writing a check — it&apos;s asking one
              coworker whose employer matches, and logging your volunteer
              hours. Both route through this page.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>Funding is not tied to what any family gives</h2>
            <div className="callout">
              <p className="small" style={{ marginBottom: 0 }}>
                {fairnessPolicy.grants} {fairnessPolicy.nonDiscrimination} Every
                student on our teams has the same access to what the club has,
                regardless of whether their family donated, fundraised, or
                volunteered.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
