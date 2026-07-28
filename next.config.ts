import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker (rpi) runtime image.
  // Inert for local dev and Vercel.
  output: "standalone",
  images: {
    // AVIF first, WebP as the fallback — the wordmark ships as PNG source and is
    // re-encoded on demand, so this is pure byte savings on the LCP path.
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
