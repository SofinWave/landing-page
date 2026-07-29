import { DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";
import { siteUrl } from "@/lib/site";

export { generateStaticParams } from "../params";
export const dynamic = "force-static";

/**
 * AI / answer-engine crawlers explicitly welcomed (GEO). Listing them by name
 * makes the allow-intent unambiguous even as generic rules evolve.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

/**
 * Chinese search crawlers, named for the same reason the AI crawlers are.
 *
 * `User-Agent: *` already allows them, so this changes no behaviour. It is here
 * because Baiduspider is the one crawler most often blocked by accident — it is
 * absent from the allowlists people copy, and a later `Disallow` written for
 * some other bot is easy to scope too widely. Naming it makes the intent
 * survive the next edit to this file.
 *
 * Sogou powers WeChat's in-app search, which is a separate surface from Baidu
 * and worth being crawlable on.
 */
const CHINESE_SEARCH_CRAWLERS = ["Baiduspider", "Sogou web spider", "360Spider"];

export async function GET(_request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const id = isSiteId(site) ? site : DEFAULT_SITE.id;
  const origin = siteUrl(id);

  const lines = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    ...AI_CRAWLERS.flatMap((agent) => [`User-Agent: ${agent}`, "Allow: /", ""]),
    ...CHINESE_SEARCH_CRAWLERS.flatMap((agent) => [`User-Agent: ${agent}`, "Allow: /", ""]),
    // `Host` is read by Baidu and Yandex, and ignored by Google.
    `Host: ${origin}`,
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ];

  // Keeps the site name in the file for humans reading it; no crawler parses it.
  lines.unshift(`# ${siteConfig(id).name}`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
