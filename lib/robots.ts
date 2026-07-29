import type { SiteId } from "@/enums";
import { siteConfig } from "@/lib/sites";
import { siteUrl } from "@/lib/site";

/**
 * AI / answer-engine crawlers explicitly welcomed (GEO). Listing them by name
 * makes the allow-intent unambiguous even as generic rules evolve.
 *
 * Every vendor runs more than one agent, and they do different jobs: one builds
 * the training corpus, one builds the search index the assistant answers from,
 * and one fetches a page live when someone pastes a link. A crawler obeys the
 * group carrying its own name before it falls back to `*`, so an incomplete
 * list is how a site ends up welcoming the training bot and nothing else. The
 * search and live-fetch agents are the ones that cite the site back to a person
 * asking a question today.
 */
const AI_CRAWLERS = [
  // OpenAI — training, the ChatGPT search index, and user-triggered fetch.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic. `Claude-Web` and `anthropic-ai` are retired names, kept because
  // costing nothing beats guessing which deployments still send them.
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Claude-Web",
  "anthropic-ai",
  // Google. Googlebot itself crawls under `*`; these two are the tokens that
  // govern Gemini grounding and Vertex AI fetches specifically.
  "Google-Extended",
  "Google-CloudVertexBot",
  // Perplexity — index and user-triggered fetch.
  "PerplexityBot",
  "Perplexity-User",
  // Apple: `Applebot` crawls for Siri and Spotlight, `Applebot-Extended` is
  // only the opt-out token for training on what it already has.
  "Applebot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "YouBot",
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

/** One site's robots.txt, on its own origin. */
export function buildRobotsTxt(site: SiteId): string {
  const origin = siteUrl(site);

  return [
    // Keeps the site name in the file for humans reading it; no crawler parses it.
    `# ${siteConfig(site).name}`,
    "",
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    ...AI_CRAWLERS.flatMap((agent) => [`User-Agent: ${agent}`, "Allow: /", ""]),
    ...CHINESE_SEARCH_CRAWLERS.flatMap((agent) => [`User-Agent: ${agent}`, "Allow: /", ""]),
    // `Host` is read by Baidu and Yandex, and ignored by Google.
    `Host: ${origin}`,
    `Sitemap: ${origin}/sitemap.xml`,
    // No directive announces llms.txt, and robots.txt is the one file every
    // agent fetches first — so the pointer goes here as a comment, which is
    // also where a model reading the file will look for it.
    `# llms.txt: ${origin}/llms.txt`,
    `# llms-full.txt: ${origin}/llms-full.txt`,
    "",
  ].join("\n");
}
