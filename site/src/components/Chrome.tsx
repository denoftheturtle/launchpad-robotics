import Link from "next/link";
import { org, fairnessPolicy } from "@/lib/org";
import { Wordmark } from "@/components/Wordmark";

export function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label={`${org.name} \u2014 home`}>
          <Wordmark width={150} />
        </Link>
        <div className="nav-links">
          <Link href="/donate">Donate &amp; Match</Link>
          <Link href="/volunteer-hours">Log Volunteer Hours</Link>
          <Link href="/volunteer">Volunteer</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <p className="footer-brand">
          <Wordmark width={160} title={org.name} />
        </p>
        <p className="muted">{org.region}</p>
        <p>
          A sponsored program of {org.sponsor.legalName}, a registered
          501(c)(3) public charity. EIN {org.sponsor.ein}. Contributions are
          tax-deductible to the extent allowed by law.
        </p>
        <p className="small muted">
          {fairnessPolicy.nonDiscrimination} Gifts must be unrestricted and
          cannot be earmarked for an individual student.
        </p>
        <p>
          <a href={`mailto:${org.email}`}>{org.email}</a>
          {" · "}
          {/* CC BY requires visible attribution for the hero/footer texture.
              See public/img/CREDITS.md. Do not remove while those images ship. */}
          <a href="/img/CREDITS.md">Image credits</a>
        </p>
      </div>
    </footer>
  );
}
