import { z } from "zod";

/**
 * Cap on the message field. Browsers and mail clients silently truncate long
 * mailto: URLs (the practical ceiling is around 2000 characters for the whole
 * URL), so bound the one field that can grow without limit.
 */
export const MESSAGE_MAX = 1500;

export const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  message: z.string().trim().min(10).max(MESSAGE_MAX),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

/** Fields that failed validation, so the form can flag every one at once. */
export function invalidContactFields(data: unknown): ContactField[] {
  const parsed = contactSchema.safeParse(data);
  if (parsed.success) return [];
  const fields = new Set<ContactField>();
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (field === "name" || field === "email" || field === "message") fields.add(field);
  }
  return [...fields];
}

type MailtoLabels = {
  subject: string;
  name: string;
  email: string;
  message: string;
};

/**
 * Build the mailto: URL that opens the visitor's own mail client with the
 * enquiry pre-filled. Encoding goes through encodeURIComponent rather than
 * URLSearchParams: the latter encodes spaces as "+", which several mail
 * clients render literally in the compose window.
 */
export function buildContactMailto(to: string, data: ContactInput, labels: MailtoLabels): string {
  const body = [
    `${labels.name}: ${data.name}`,
    `${labels.email}: ${data.email}`,
    "",
    `${labels.message}:`,
    data.message,
  ].join("\n");

  const query = `subject=${encodeURIComponent(labels.subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${to}?${query}`;
}
