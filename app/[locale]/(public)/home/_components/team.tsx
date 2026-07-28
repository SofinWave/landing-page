import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";

type Member = { name: string; role: string };

/** Portraits are locale-independent, so they pair with `team.members` by order. */
const PHOTOS = [
  "/images/members/jesse.png",
  "/images/members/anonymous-1.png",
  "/images/members/anonymous-2.png",
];

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
    <Section index={6} label="Team">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("about")}</p>
      </div>
      <Reveal>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {members.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              className="hud-corners relative overflow-hidden flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              {PHOTOS[i] ? (
                <Image
                  src={PHOTOS[i]}
                  alt={m.name}
                  width={128}
                  height={128}
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {initials(m.name)}
                </div>
              )}
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {m.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
