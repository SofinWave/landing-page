"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildContactMailto,
  contactSchema,
  invalidContactFields,
  MESSAGE_MAX,
  type ContactField,
} from "@/lib/contact";
import { SITE_EMAIL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const t = useTranslations("contact");
  const [errors, setErrors] = useState<ContactField[]>([]);
  const [opened, setOpened] = useState(false);
  const [count, setCount] = useState(0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    const invalid = invalidContactFields(data);
    setErrors(invalid);
    if (invalid.length > 0) {
      setOpened(false);
      return;
    }

    // Deliberately not resetting the form: if no mail client is registered
    // nothing visible happens, and clearing the fields would lose their text.
    window.location.href = buildContactMailto(SITE_EMAIL, contactSchema.parse(data), {
      subject: t("mailSubject", { name: data.name }),
      name: t("name"),
      email: t("email"),
      message: t("message"),
    });
    setOpened(true);
  }

  function fieldProps(field: ContactField) {
    const invalid = errors.includes(field);
    return {
      "aria-invalid": invalid || undefined,
      "aria-describedby": invalid ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: ContactField) {
    if (!errors.includes(field)) return null;
    return (
      <p id={`${field}-error`} role="alert" className="font-mono text-xs text-destructive">
        {t(`errors.${field}`)}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">
          {t("name")}
        </Label>
        <Input id="name" name="name" {...fieldProps("name")} />
        {fieldError("name")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">
          {t("email")}
        </Label>
        <Input id="email" name="email" type="email" {...fieldProps("email")} />
        {fieldError("email")}
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="message" className="font-mono text-xs uppercase tracking-wider">
            {t("message")}
          </Label>
          <span aria-hidden className="font-mono text-xs text-muted-foreground">
            {count}/{MESSAGE_MAX}
          </span>
        </div>
        <Textarea
          id="message"
          name="message"
          rows={5}
          maxLength={MESSAGE_MAX}
          onChange={(e) => setCount(e.currentTarget.value.length)}
          {...fieldProps("message")}
        />
        {fieldError("message")}
      </div>

      <Button type="submit" size="lg" className="w-full bg-accent-gradient text-primary-foreground">
        {t("submit")}
      </Button>

      <p className="text-center font-mono text-xs text-muted-foreground">{t("hint")}</p>

      <div aria-live="polite">
        {opened && <p className="font-mono text-sm text-primary">{`> ${t("opened")}`}</p>}
      </div>

      <p className="text-center font-mono text-xs text-muted-foreground">
        {t("fallback")}{" "}
        <a href={`mailto:${SITE_EMAIL}`} className="text-primary underline underline-offset-4">
          {SITE_EMAIL}
        </a>
      </p>
    </form>
  );
}
