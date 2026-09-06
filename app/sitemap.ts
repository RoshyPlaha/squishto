import type { MetadataRoute } from "next";
import { posts } from "#site/content";

const BASE_URL = "https://squish.to";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/blog", "/stats", "/about", "/privacy", "/terms"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const postRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticRoutes, ...postRoutes];
}
