"use server";

import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message is too short"),
});

export type ContactInput = z.infer<typeof contactSchema>;

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
