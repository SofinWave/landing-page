import { buildRobotsTxt } from "@/lib/robots";
import { DEFAULT_SITE, isSiteId } from "@/lib/sites";

export { generateStaticParams } from "../params";
export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  return new Response(buildRobotsTxt(isSiteId(site) ? site : DEFAULT_SITE.id), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
