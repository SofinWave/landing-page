import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ALL_SITES } from "@/lib/sites";

export function generateStaticParams() {
  return ALL_SITES.flatMap((site) => routing.locales.map((locale) => ({ site: site.id, locale })));
}

/** `/{locale}` only ever redirects; canonicals point at `/{locale}/home`. */
export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ site: string; locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/home", locale });
}
