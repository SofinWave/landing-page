"use server";

import { contactSchema, type ContactInput } from "./contact.schema";

export async function submitContact(
  data: ContactInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  // TODO(integration): forward to email/webhook provider (see spec §9).
  console.log("[contact] submission", parsed.data);
  return { ok: true };
}
