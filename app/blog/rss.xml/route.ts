import { posts } from "#site/content";
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items = sorted
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid>${BASE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>squish.to Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Updates, guides, and notes from the squish.to team.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
