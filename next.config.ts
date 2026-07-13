import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker (rpi) runtime image.
  // Inert for local dev and Vercel.
  output: "standalone",
};

export default withNextIntl(nextConfig);
