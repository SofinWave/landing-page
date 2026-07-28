import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { ContactForm } from "./contact-form";

export function Contact() {
  const t = useTranslations("contact");
  return (
    <Section id="contact" className="bg-hero-gradient">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ContactForm />
    </Section>
  );
}
