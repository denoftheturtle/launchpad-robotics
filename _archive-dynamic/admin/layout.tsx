import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/admin";
import { Wordmark } from "@/components/Wordmark";
import { org } from "@/lib/org";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="wrap" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div className="admin-bar">
        <Link href="/admin" className="brand admin-brand" style={{ marginRight: 8 }}>
          <Wordmark width={104} title={`${org.name} admin`} />
          <span className="admin-tag">Admin</span>
        </Link>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/donations">Donations</Link>
        <Link href="/admin/expenses">Expenses</Link>
        <Link href="/admin/reimbursements">Reimbursements</Link>
        <Link href="/admin/volunteers">Volunteer Hours</Link>
        <Link href="/admin/teams">Teams</Link>
        <Link href="/admin/inbox">Inbox</Link>
        <Link href="/admin/settings">Settings</Link>
        <form action={logout} style={{ marginLeft: "auto" }}>
          <button className="btn small secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
