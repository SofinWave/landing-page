import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { resolveSite } from "./lib/sites";

const intlMiddleware = createMiddleware(routing);

/**
 * Root-level files whose content differs per site. They carry no locale prefix,
 * so they are rewritten straight into the site-scoped handlers under `/s/`.
 */
const SITE_SCOPED_FILES = new Set([
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/manifest.webmanifest",
]);

/**
 * Resolves the incoming hostname to one of the four verticals and rewrites the
 * request into that site's route subtree.
 *
 * The rewrite is invisible to the client: public URLs stay
 * `media.sofinwave.org/en/about` while the app renders `/media/en/about`. That
 * keeps next-intl's locale handling untouched — it still sees the locale as the
 * first path segment — and keeps every page statically generatable, which
 * reading the `Host` header inside a page would not.
 */
export default function proxy(request: NextRequest) {
  const site = resolveSite(request.headers.get("host"));
  const { pathname } = request.nextUrl;

  if (SITE_SCOPED_FILES.has(pathname)) {
    const url = new URL(request.nextUrl);
    url.pathname = `/s/${site.id}${pathname}`;
    return NextResponse.rewrite(url);
  }

  const response = intlMiddleware(request);

  // next-intl redirects when the locale prefix is missing. Let that resolve
  // first; the follow-up request comes back here with a locale to work with.
  if (response.headers.has("location")) return response;

  const url = new URL(request.nextUrl);
  url.pathname = `/${site.id}${url.pathname}`;

  const rewritten = NextResponse.rewrite(url, { request });
  // Carry over next-intl's own headers (locale negotiation, cookies), but not
  // its rewrite directive — ours supersedes it.
  response.headers.forEach((value, key) => {
    if (key !== "x-middleware-rewrite") rewritten.headers.set(key, value);
  });

  return rewritten;
}

export const config = {
  matcher: [
    "/",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    "/llms-full.txt",
    "/manifest.webmanifest",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
