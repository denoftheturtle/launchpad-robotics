import { Nav, Footer } from "@/components/Chrome";
import { ContactForm } from "@/components/Forms";
import { org } from "@/lib/org";

export const metadata = { title: `Contact — ${org.name}` };

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main>
        <div className="hero">
          <div className="wrap">
            <h1>Get in touch</h1>
            <p className="lead">
              Questions about joining a team, starting one in your
              neighborhood, sponsoring us, or verifying our nonprofit standing
              — we read everything.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid cols-2">
              <div>
                <h2>Send a message</h2>
                <ContactForm />
              </div>
              <div>
                <h2>Other details</h2>
                <div className="card">
                  <h3>Email</h3>
                  <p>
                    <a href={`mailto:${org.email}`}>{org.email}</a>
                  </p>
                </div>
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>Verifying our nonprofit status</h3>
                  <p>
                    {org.name} is a sponsored program of{" "}
                    {org.sponsor.legalName}, a 501(c)(3) public charity.
                    <br />
                    EIN: <strong>{org.sponsor.ein}</strong>
                    <br />
                    {org.sponsor.address}
                  </p>
                  <p className="small muted">
                    Listed with the{" "}
                    <a href="https://apps.irs.gov/app/eos/" target="_blank" rel="noreferrer">
                      IRS Tax Exempt Organization Search
                    </a>
                    , Charity Navigator and GuideStar.
                  </p>
                </div>
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>Questions about a donation</h3>
                  <p className="small">
                    For receipts, acknowledgement letters, or to confirm a gift
                    reached our club, contact our fiscal sponsor directly:
                  </p>
                  <p>
                    {org.sponsor.contact.name},{" "}
                    {org.sponsor.contact.title}
                    <br />
                    <a href={`mailto:${org.sponsor.contact.email}`}>
                      {org.sponsor.contact.email}
                    </a>
                    <br />
                    <a href={`tel:${org.sponsor.contact.phone.replace(/\./g, "")}`}>
                      {org.sponsor.contact.phone}
                    </a>
                  </p>
                </div>
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>Starting a team?</h3>
                  <p>
                    Tell us roughly where you are and what age group you have in
                    mind, and we&apos;ll walk you through what a parent-led team
                    actually takes to get going.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
