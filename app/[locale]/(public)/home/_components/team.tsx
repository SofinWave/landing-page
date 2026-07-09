import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type Member = { name: string; role: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Team() {
  const t = useTranslations("team");
  const members = t.raw("members") as Member[];
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("about")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {members.map((m, i) => (
          <div
            key={`${m.name}-${i}`}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {initials(m.name)}
            </div>
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
