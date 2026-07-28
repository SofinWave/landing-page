import { buildLlmsTxt } from "@/lib/llms";
import { isSiteId } from "@/lib/sites";
import { DEFAULT_SITE } from "@/lib/sites";

export { generateStaticParams } from "../params";
export const dynamic = "force-static";

/** Short site index for answer engines — the llms.txt convention. */
export async function GET(_request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  return new Response(buildLlmsTxt(isSiteId(site) ? site : DEFAULT_SITE.id), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
