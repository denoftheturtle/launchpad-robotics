"use client";

import { useState } from "react";
import { org } from "@/lib/org";

/**
 * Forms post straight to Formspree, which forwards to the club Gmail.
 *
 * Why not a server action: the site is statically exported now, so there is no
 * server to run one. Formspree's free tier (~50 submissions/month) is well
 * clear of our volume and does spam filtering we would otherwise have to
 * build.
 *
 * Set NEXT_PUBLIC_FORMSPREE_ID at build time. Until it is set, the forms fall
 * back to a mailto: link rather than silently posting into a void — a
 * volunteer offer that vanishes is worse than an ugly handoff.
 */
const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const endpoint = FORM_ID ? `https://formspree.io/f/${FORM_ID}` : null;

type Status = "idle" | "sending" | "ok" | "error";

function useFormspree(subject: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", subject);

    // Honeypot: bots fill hidden fields, humans do not.
    if (data.get("website")) {
      setStatus("ok");
      return;
    }

    if (!endpoint) {
      setStatus("error");
      setError("This form isn't connected yet. Please email us directly.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
    } catch {
      setStatus("error");
      setError(`Something went wrong. Please email us at ${org.email}.`);
    }
  }

  return { status, error, onSubmit };
}

function Fallback({ message }: { message: string }) {
  return (
    <p className="error">
      {message}{" "}
      <a href={`mailto:${org.email}`}>{org.email}</a>
    </p>
  );
}

export function ContactForm() {
  const { status, error, onSubmit } = useFormspree("Contact form — launchpadrobotics.org");

  if (status === "ok") {
    return (
      <div className="callout">
        <p className="success" style={{ margin: 0 }}>
          Thanks — we got your message and will get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
      <div className="row">
        <div className="field">
          <label htmlFor="c-name">Your name *</label>
          <input id="c-name" name="name" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="c-email">Email *</label>
          <input id="c-email" name="email" type="email" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-phone">Phone (optional)</label>
        <input id="c-phone" name="phone" type="tel" />
      </div>
      <div className="field">
        <label htmlFor="c-message">How can we help? *</label>
        <textarea id="c-message" name="message" required minLength={5} />
      </div>
      {status === "error" && <Fallback message={error} />}
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export function VolunteerForm() {
  const { status, error, onSubmit } = useFormspree("Volunteer signup — launchpadrobotics.org");

  if (status === "ok") {
    return (
      <div className="callout">
        <p className="success" style={{ margin: 0 }}>
          Thanks for offering to help — someone will reach out about next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
      <div className="row">
        <div className="field">
          <label htmlFor="v-name">Your name *</label>
          <input id="v-name" name="name" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="v-email">Email *</label>
          <input id="v-email" name="email" type="email" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="v-phone">Phone (optional)</label>
        <input id="v-phone" name="phone" type="tel" />
      </div>
      <div className="field">
        <label htmlFor="v-skills">
          What could you help with? Engineering, coding, logistics, snacks,
          driving — all of it counts.
        </label>
        <textarea id="v-skills" name="skills" />
      </div>
      <div className="field">
        <label htmlFor="v-availability">
          General availability (weeknights, weekends, tournament days…)
        </label>
        <textarea id="v-availability" name="availability" style={{ minHeight: 80 }} />
      </div>
      <div className="field">
        <label htmlFor="v-message">Anything else?</label>
        <textarea id="v-message" name="message" style={{ minHeight: 80 }} />
      </div>
      <div className="checkbox">
        <input id="v-bg" name="backgroundCheckOk" type="checkbox" value="true" />
        <label htmlFor="v-bg" style={{ margin: 0 }}>
          I&apos;m willing to complete a background check if required to work
          with students
        </label>
      </div>
      {status === "error" && <Fallback message={error} />}
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Sign me up"}
      </button>
    </form>
  );
}
