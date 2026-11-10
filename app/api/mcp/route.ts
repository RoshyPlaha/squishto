import { AsyncLocalStorage } from "node:async_hooks";
import { NextRequest } from "next/server";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createShortLinkViaApi } from "@/lib/create-link-service";
import { getRequestIp, hashIp } from "@/lib/ip";
import { getPublicLinkStats } from "@/lib/public-link-stats";

// registerTool's callback only receives the tool's own arguments, not the
// inbound Request — AsyncLocalStorage carries the per-request IP hash across
// that boundary so the tool can still be rate-limited the same way the REST
// endpoint is, without mcp-handler needing to support passing it through.
const requestContext = new AsyncLocalStorage<{
  ipHash?: string;
  country?: string | null;
}>();

const mcpHandler = createMcpHandler((server) => {
  server.registerTool(
    "create_short_link",
    {
      title: "Create a short link",
      description:
        "Create a squish.to short link for a URL. Free, no account needed.",
      inputSchema: z.object({
        url: z.string().url().describe("The http(s) URL to shorten"),
        customCode: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9-]+$/)
          .optional()
          .describe(
            "Optional custom short code (letters, numbers, hyphens, 3-30 chars). A random one is generated if omitted.",
          ),
      }),
    },
    async ({ url, customCode }) => {
      const ctx = requestContext.getStore();

      const result = await createShortLinkViaApi({
        destinationUrl: url,
        customCode,
        ipHash: ctx?.ipHash,
        country: ctx?.country,
      });

      if (!result.ok) {
        return { content: [{ type: "text", text: result.error }], isError: true };
      }

      return {
        content: [
          {
            type: "text",
            text: `Created https://squish.to/${result.link.shortCode} -> ${result.link.destinationUrl}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_link_stats",
    {
      title: "Get link stats",
      description:
        "Get open stats for a squish.to short link: total opens, opens in the last 7 days, the busiest day, daily opens for the last 14 days, and the 6 most recent opens with their source and country. Stats are per link, not per person.",
      inputSchema: z.object({
        shortCode: z
          .string()
          .min(1)
          .max(200)
          .describe(
            'The short code, such as "summer-sale" for squish.to/summer-sale. A full squish.to link also works.',
          ),
      }),
    },
    async ({ shortCode }) => {
      // Agents often pass the whole link they were given rather than its code.
      const code = shortCode
        .trim()
        .replace(/^(https?:\/\/)?(www\.)?squish\.to\//i, "")
        .replace(/[/?#].*$/, "");

      let stats;
      try {
        stats = await getPublicLinkStats(code);
      } catch (error) {
        // Keep database errors (and their SQL) out of the agent's reply.
        console.error("get_link_stats failed", error);
        return {
          content: [{ type: "text", text: "Could not load stats, please try again later" }],
          isError: true,
        };
      }

      if (!stats) {
        return {
          content: [{ type: "text", text: `No squish.to link found for "${code}"` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    },
  );
}, { serverInfo: { name: "squish.to", version: "1.1.0" } });

async function handler(request: NextRequest) {
  const ip = getRequestIp(request);
  const ipHash = ip ? hashIp(ip) : undefined;
  const country = request.headers.get("x-vercel-ip-country");

  return requestContext.run({ ipHash, country }, () => mcpHandler(request));
}

export { handler as GET, handler as POST };
