import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { isStaticMetadataFile } from "next/dist/lib/metadata/is-metadata-route";
import { normalizeAppPath } from "next/dist/shared/lib/router/utils/app-paths";

const APP_DIR = join(process.cwd(), "app");
const PROXY_FILE = join(process.cwd(), "proxy.ts");

/** Every `page`/`route` file under `app/`, as the app path Next builds from it. */
function appRoutePaths(dir: string = APP_DIR): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return appRoutePaths(full);
    if (!/^(page|route)\.(tsx?|jsx?)$/.test(entry.name)) return [];
    const segments = relative(APP_DIR, dir).split(/[/\\]/).join("/");
    return [normalizeAppPath(`/${segments}/${entry.name.replace(/\.\w+$/, "")}`)];
  });
}

describe("app route naming", () => {
  const routes = appRoutePaths();

  it("finds the site-scoped root files", () => {
    expect(routes).toContain("/s/[site]/sitemap-xml");
    expect(routes).toContain("/s/[site]/robots.txt");
  });

  /**
   * A route directory named after a metadata file (`sitemap.xml`) makes Next
   * treat the route as a *static* metadata file. The deployment adapter skips
   * those when building its output map, so a statically prerendered dynamic
   * route ends up with no parent output and the build fails with
   * `Invariant: failed to find source route`. That only happens where the
   * adapter runs — Vercel — so `pnpm build` locally will not catch it.
   */
  it("never gives a dynamic route a static-metadata filename", () => {
    const offenders = routes.filter((route) => route.includes("[") && isStaticMetadataFile(route));
    expect(offenders).toEqual([]);
  });
});

/**
 * Google's favicon crawler, Bing, Slack and every browser's zero-config default
 * probe `/favicon.ico` before reading any `<link>`. `icon.png` alone leaves that
 * a 404, which is how the search result ends up with a generic placeholder.
 * All three are derived — regenerate with `scripts/build-brand-assets.py`.
 */
describe("brand icon files", () => {
  it.each(["favicon.ico", "icon.png", "apple-icon.png"])("ships app/%s", (name) => {
    expect(statSync(join(APP_DIR, name)).size).toBeGreaterThan(0);
  });

  it("keeps favicon.ico out of the proxy matcher, so it is served verbatim", () => {
    expect(readFileSync(PROXY_FILE, "utf8")).toContain("favicon.ico");
  });
});

describe("proxy site-scoped file map", () => {
  const source = readFileSync(PROXY_FILE, "utf8");
  const block = source.slice(
    source.indexOf("const SITE_SCOPED_FILES"),
    source.indexOf("export default function proxy"),
  );
  const entries = [...block.matchAll(/\["(\/[^"]+)",\s*"(\/[^"]+)"\]/g)].map(
    ([, publicPath, handler]) => ({ publicPath, handler }),
  );

  it("maps every public root file", () => {
    expect(entries.map((e) => e.publicPath).sort()).toEqual([
      "/llms-full.txt",
      "/llms.txt",
      "/manifest.webmanifest",
      "/robots.txt",
      "/sitemap.xml",
    ]);
  });

  it("rewrites each one to a handler that exists", () => {
    for (const { publicPath, handler } of entries) {
      const dir = join(APP_DIR, "s", "[site]", handler);
      expect(statSync(dir).isDirectory(), `${publicPath} -> ${handler}`).toBe(true);
    }
  });

  it("keeps the public sitemap URL at /sitemap.xml", () => {
    const sitemap = entries.find((e) => e.publicPath === "/sitemap.xml");
    expect(sitemap?.handler).toBe("/sitemap-xml");
  });
});
