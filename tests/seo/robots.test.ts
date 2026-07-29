import { describe, it, expect } from "vitest";
import { buildRobotsTxt } from "@/lib/robots";
import { ALL_SITES, siteConfig } from "@/lib/sites";

/**
 * The agents that answer questions today, per vendor. A vendor's training bot
 * being welcome says nothing about its search index or its live fetch — those
 * are separate user-agents, and they are the ones that cite the site.
 */
const ANSWER_ENGINE_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Google-CloudVertexBot",
  "PerplexityBot",
];

describe.each(ALL_SITES.map((s) => s.id))("robots.txt for %s", (siteId) => {
  const config = siteConfig(siteId);
  const txt = buildRobotsTxt(siteId);

  it("names every answer-engine agent and allows it", () => {
    for (const agent of ANSWER_ENGINE_AGENTS) {
      expect(txt).toContain(`User-Agent: ${agent}\nAllow: /`);
    }
  });

  it("allows everything except the API under the catch-all", () => {
    expect(txt).toContain("User-Agent: *\nAllow: /\nDisallow: /api/");
    expect(txt).not.toMatch(/^Disallow: \/$/m);
  });

  it("points at its own sitemap and llms files, never another site's", () => {
    expect(txt).toContain(`Sitemap: https://${config.host}/sitemap.xml`);
    expect(txt).toContain(`# llms.txt: https://${config.host}/llms.txt`);
    expect(txt).toContain(`# llms-full.txt: https://${config.host}/llms-full.txt`);
    for (const other of ALL_SITES) {
      if (other.id === siteId) continue;
      // With the scheme attached, so the apex host does not match as a
      // substring of the subdomain the file belongs to.
      expect(txt).not.toContain(`https://${other.host}/`);
    }
  });
});
