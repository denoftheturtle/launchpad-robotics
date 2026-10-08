import { Nav, Footer } from "@/components/Chrome";
import { VolunteerForm } from "@/components/Forms";
import { org } from "@/lib/org";

export const metadata = { title: `Volunteer — ${org.name}` };

export default function VolunteerPage() {
  return (
    <>
      <Nav />
      <main>
        <div className="hero">
          <div className="wrap">
            <h1>Volunteer with us</h1>
            <p className="lead">
              Teams run entirely on parent volunteers. You don&apos;t need an
              engineering background — you need a couple of hours and some
              patience with middle schoolers. We&apos;ll teach you the rest.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="grid cols-2">
              <div>
                <h2>Tell us about you</h2>
                <VolunteerForm />
              </div>
              <div>
                <h2>What volunteers actually do</h2>
                <div className="card">
                  <h3>Help at build sessions</h3>
                  <p>
                    Lend a hand at a team&apos;s build sessions — helping
                    students work through a problem. The biggest need, and the
                    most rewarding.
                  </p>
                </div>
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>Chaperone competitions</h3>
                  <p>
                    Weekend tournaments need adults to keep the group together,
                    fed and roughly on schedule.
                  </p>
                </div>
                <div className="card" style={{ marginTop: 16 }}>
                  <h3>Logistics and operations</h3>
                  <p>
                    Equipment, transport, registration paperwork, fundraising.
                    Unglamorous and completely essential.
                  </p>
                </div>
                <div className="callout">
                  <strong>Already volunteering?</strong> Your hours may be
                  worth a cash grant from your employer.{" "}
                  <a href="/volunteer-hours">Here&apos;s how to log them.</a>
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
