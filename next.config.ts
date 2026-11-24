import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Static proposal page (HOOPSIDIA x NESQUIK), built from NESQUIK/LANDING
  // by NESQUIK/source/build_landing_site.py into public/nesquik.
  async rewrites() {
    return [{ source: "/nesquik", destination: "/nesquik/index.html" }];
  },
};

export default withNextIntl(nextConfig);
