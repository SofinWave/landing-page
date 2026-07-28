import { DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";

export { generateStaticParams } from "../params";
export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const config = siteConfig(isSiteId(site) ? site : DEFAULT_SITE.id);

  return Response.json({
    name: config.name,
    short_name: config.name,
    start_url: "/",
    display: "standalone",
    background_color: "#080E16",
    theme_color: "#080E16",
    icons: [{ src: "/icon.png", sizes: "500x500", type: "image/png" }],
  });
}
