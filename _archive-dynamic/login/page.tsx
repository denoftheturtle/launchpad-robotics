import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { org } from "@/lib/org";
import { Wordmark } from "@/components/Wordmark";

export const metadata = { title: `Admin sign in — ${org.name}` };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="wrap login-wrap">
      <div style={{ marginBottom: 28 }}>
        <Wordmark width={200} title={org.name} />
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 6, textAlign: "center" }}>
        Admin sign in
      </h1>
      <p
        className="muted small"
        style={{ marginBottom: 24, textAlign: "center" }}
      >
        Ledger and dashboard access for {org.name} administrators.
      </p>
      <LoginForm />
    </div>
  );
}
