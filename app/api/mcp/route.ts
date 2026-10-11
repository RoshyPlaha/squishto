import { AsyncLocalStorage } from "node:async_hooks";
import { NextRequest } from "next/server";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createShortLinkViaApi } from "@/lib/create-link-service";
import { getRequestIp, hashIp } from "@/lib/ip";

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
}, { serverInfo: { name: "squish.to", version: "1.0.0" } });

async function handler(request: NextRequest) {
  const ip = getRequestIp(request);
  const ipHash = ip ? hashIp(ip) : undefined;
  const country = request.headers.get("x-vercel-ip-country");

  return requestContext.run({ ipHash, country }, () => mcpHandler(request));
}

export { handler as GET, handler as POST };
