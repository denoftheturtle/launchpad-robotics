import Link from "next/link";
import { Nav, Footer } from "@/components/Chrome";
import { org } from "@/lib/org";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <div className="hero">
          <div className="wrap">
            <h1>
              Kids building real robots,
              <br />
              supported by their own community.
            </h1>
            <p className="lead">
              {org.name} is a parent-led nonprofit program in the{" "}
              {org.region} area. We help parent-led youth robotics and STEM
              teams get the parts and guidance they need — so students get
              hands-on experience with engineering, coding, problem-solving and
              teamwork, and parents get a practical way to make that happen.
            </p>
            <div className="btn-row">
              <Link href="/donate" className="btn">
                Donate &amp; get it matched
              </Link>
              <Link href="/volunteer" className="btn secondary">
                Volunteer with us
              </Link>
            </div>
          </div>
        </div>

        <section>
          <div className="wrap">
            <h2>What we do</h2>
            <p className="section-sub">
              We handle the funding and paperwork so parent volunteers can focus
              on the kids.
            </p>
            <div className="grid cols-3">
              <div className="card">
                <h3>Help starting out</h3>
                <p>
                  We help parents get a neighborhood team off the ground —
                  registration, sourcing parts and kit, and guidance through the
                  paperwork nobody wants to deal with.
                </p>
              </div>
              <div className="card">
                <h3>Parts and entry costs</h3>
                <p>
                  We help cover parts, kit and competition entry fees for the
                  parent-led teams we support, so no family is priced out of
                  participating.
                </p>
              </div>
              <div className="card">
                <h3>Keep it accessible</h3>
                <p>
                  Community funding rather than per-family fees. Students
                  should be able to join because they&apos;re curious, not
                  because their household can absorb the cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Texture break between the two content sections. Decorative only, so
            it is hidden from assistive tech. */}
        <div className="parts-band" role="presentation" aria-hidden="true" />

        <section>
          <div className="wrap">
            <h2>How we&apos;re organized</h2>
            <p className="section-sub">
              {org.name} operates as a sponsored program of{" "}
              <strong>{org.sponsor.legalName}</strong>, a registered 501(c)(3)
              public charity.
            </p>
            <div className="grid cols-2">
              <div className="card">
                <h3>Tax-deductible giving</h3>
                <p>
                  Donations, corporate grants and matching funds route through
                  our fiscal sponsor and are fully tax-deductible for the
                  contributor.
                </p>
              </div>
              <div className="card">
                <h3>No administrative cut</h3>
                <p>
                  Our sponsor is volunteer-operated and passes 100% of received
                  funds through to our program budget — no platform fees, no
                  overhead skim.
                </p>
              </div>
              <div className="card">
                <h3>Parent-led by design</h3>
                <p>
                  Teams are run by their own parent volunteers. We are not a
                  facility or a coaching staff — we are the shared backend that
                  helps those teams get parts and find their footing.
                </p>
              </div>
              <div className="card">
                <h3>Verify us</h3>
                <p>
                  Legal name: {org.sponsor.legalName}
                  <br />
                  EIN: <strong>{org.sponsor.ein}</strong>
                  <br />
                  {org.sponsor.address}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>Ways to help</h2>
            <div className="grid cols-3">
              <div className="card">
                <h3>Give — and double it</h3>
                <p>
                  Most large local employers match employee donations, many at
                  1:1. Your gift can be worth twice what you put in.
                </p>
                <Link href="/donate" className="btn small">
                  See employer instructions
                </Link>
              </div>
              <div className="card">
                <h3>Log your volunteer hours</h3>
                <p>
                  Already helping out? Many employers convert volunteer hours
                  into cash grants. It costs you nothing but a few minutes in a
                  portal.
                </p>
                <Link href="/volunteer-hours" className="btn small secondary">
                  How to log hours
                </Link>
              </div>
              <div className="card">
                <h3>Give your time</h3>
                <p>
                  Helping hands, chaperones and folks who are just good with
                  a soldering iron — we can use you.
                </p>
                <Link href="/volunteer" className="btn small secondary">
                  Volunteer form
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
