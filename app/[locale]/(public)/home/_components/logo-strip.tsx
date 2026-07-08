import { useTranslations } from "next-intl";

export function LogoStrip() {
  const t = useTranslations("logos");
  const items = t.raw("items") as string[];
  return (
    <div className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <p className="mb-6 text-center text-sm text-muted-foreground">{t("title")}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((name) => (
            <li key={name} className="text-lg font-semibold text-muted-foreground/80">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
