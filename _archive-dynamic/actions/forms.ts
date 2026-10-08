"use server";

import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";

export type FormState = { ok: boolean; message: string } | null;

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(5, "Tell us a little more").max(4000),
});

const volunteerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(40).optional().or(z.literal("")),
  skills: z.string().max(2000).optional().or(z.literal("")),
  availability: z.string().max(2000).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
  backgroundCheckOk: z.coerce.boolean().optional(),
});

export async function submitContact(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  // Honeypot — bots fill every field they see.
  if (formData.get("website")) return { ok: true, message: "Thanks — we'll be in touch." };

  const d = parsed.data;
  await db.insert(inquiries).values({
    kind: "contact",
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    message: d.message,
  });

  return { ok: true, message: "Thanks — we got it and we'll be in touch soon." };
}

export async function submitVolunteer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = volunteerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  if (formData.get("website")) return { ok: true, message: "Thanks — we'll be in touch." };

  const d = parsed.data;
  await db.insert(inquiries).values({
    kind: "volunteer",
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    skills: d.skills || null,
    availability: d.availability || null,
    message: d.message || null,
    backgroundCheckOk: Boolean(d.backgroundCheckOk),
  });

  return {
    ok: true,
    message:
      "Thanks for offering to help — someone will reach out about next steps.",
  };
}
