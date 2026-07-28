import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ALL_SITES, DEFAULT_SITE, isSiteId, siteConfig } from "@/lib/sites";

/**
 * Default social card for every route of every site.
 *
 * Replaces the old 500x500 `/icon.png`, which was letterboxed by every platform
 * that honours `summary_large_image`. Colours mirror the brand tokens in
 * `app/globals.css` as hex, since Satori cannot parse `oklch()`.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = DEFAULT_SITE.name;

const BACKGROUND = "#080E16";
const FOREGROUND = "#FAFAFA";
const ACCENT_FROM = "#29D1E8";
const ACCENT_TO = "#3082F6";

export function generateStaticParams() {
  return ALL_SITES.flatMap((site) => routing.locales.map((locale) => ({ site: site.id, locale })));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;
  const config = siteConfig(isSiteId(site) ? site : DEFAULT_SITE.id);
  const t = await getTranslations({ locale, namespace: config.metaNamespace });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BACKGROUND,
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 8,
          background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
          }}
        />
        <div style={{ color: FOREGROUND, fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
          {config.name}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            color: FOREGROUND,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          {t("ogHeadline")}
        </div>
        <div style={{ color: "#94A3B8", fontSize: 30, lineHeight: 1.4, maxWidth: 900 }}>
          {t("ogSubline")}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 4, background: ACCENT_FROM }} />
        <div style={{ color: "#64748B", fontSize: 26 }}>{config.host}</div>
      </div>
    </div>,
    size,
  );
}
