"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/actions/admin";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    login,
    null
  );

  return (
    <form action={action} className="form">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state && !state.ok && <p className="error">{state.message}</p>}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
