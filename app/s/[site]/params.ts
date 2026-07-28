import { SiteId } from "@/enums";

/** Every site gets its own statically generated copy of these root files. */
export function generateStaticParams() {
  return Object.values(SiteId).map((site) => ({ site }));
}
