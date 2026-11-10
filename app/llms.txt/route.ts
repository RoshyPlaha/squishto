import { posts } from "#site/content";
import { SITE_URL } from "@/lib/site";
import { FILE_EXPIRY_DAYS, MAX_FILE_SIZE_BYTES } from "@/lib/upload-config";

// An llms.txt (https://llmstxt.org) index of the site for AI agents: what
// squish.to does, how to use it programmatically, and every blog post as
// Markdown.
export async function GET() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const blogLinks = sorted
    .map(
      (post) =>
        `- [${post.title}](${SITE_URL}/blog/${post.slug}.md): ${post.description}`,
    )
    .join("\n");

  const maxFileSizeMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);

  const text = `# squish.to

> A free URL shortener and file host with custom endpoints and click stats. No account required.

squish.to turns long URLs into short links such as squish.to/summer-sale, and hosts files behind a short link. Every link has a stats page showing total opens, opens in the last 7 days, a 14-day chart and recent opens with their source and country.

- Free, with no account for the person making the link or the person opening it.
- Custom codes use letters, numbers and hyphens, 3-30 characters. Without one, a random code is generated.
- File uploads: PDF, HTML and images (JPEG, PNG, WebP, GIF), up to ${maxFileSizeMb}MB. Uploaded files expire after ${FILE_EXPIRY_DAYS} days.
- Stats are per link, not per person. To tell recipients apart, send each one their own link.
- The API and MCP server are limited to 5 requests a minute and 100 a day per IP address.

## For agents

- [MCP server](${SITE_URL}/api/mcp): Streamable HTTP, no authentication. Tool: create_short_link. Add it to Claude Code with \`claude mcp add --transport http squish ${SITE_URL}/api/mcp\`.
- [API docs](${SITE_URL}/docs): create short links with one POST request, no API key.
- [OpenAPI spec](${SITE_URL}/openapi.json): machine-readable description of the API.

## Pages

- [Home](${SITE_URL}/): shorten a URL or pick a custom ending.
- [Upload](${SITE_URL}/upload): host a file behind a short link.
- [Stats](${SITE_URL}/stats): look up opens for any short code.
- [Was it opened?](${SITE_URL}/was-it-opened): send a proposal or sales doc as a link and see when it is opened.
- [About](${SITE_URL}/about)
- [Privacy](${SITE_URL}/privacy)
- [Terms](${SITE_URL}/terms)

## Blog

${blogLinks}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
