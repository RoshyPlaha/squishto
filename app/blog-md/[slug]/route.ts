import { posts } from "#site/content";
import { SITE_URL } from "@/lib/site";

// Served at /blog/<slug>.md through a rewrite in next.config.ts: the post's
// Markdown source, for AI agents that would rather not parse the HTML page.
// The HTML page stays the canonical, indexed version.
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const markdown = `# ${post.title}

> ${post.description}

Published ${post.date.slice(0, 10)} on the squish.to blog: ${url}

${post.raw.trim()}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${url}>; rel="canonical"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
