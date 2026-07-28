import { buildLlmsFullTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** Complete page text, so answer engines can cite specifics without crawling. */
export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
