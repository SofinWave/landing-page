import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Software Consulting & Implementation`,
    short_name: SITE_NAME,
    description:
      "Software consulting & implementation — from architecture to delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon.png", sizes: "500x500", type: "image/png" },
    ],
  };
}
