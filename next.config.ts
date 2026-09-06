import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Velite runs as a separate build step (see package.json scripts) since
     Turbopack, Next 16's default bundler, doesn't support webpack plugins. */
};

export default nextConfig;
