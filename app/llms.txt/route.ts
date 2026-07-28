import { buildLlmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** Short site index for answer engines — the llms.txt convention. */
export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
