import { buildSitemap } from "@/lib/sitemap";
import { DEFAULT_SITE, isSiteId } from "@/lib/sites";

export { generateStaticParams } from "../params";
export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  return new Response(buildSitemap(isSiteId(site) ? site : DEFAULT_SITE.id), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
