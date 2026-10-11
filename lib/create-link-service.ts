import { isReservedWord } from "./reserved-words";
import { isUrlUnsafe } from "./safe-browsing";
import { createLink } from "./db/queries";
import { checkRateLimit } from "./rate-limit";

type CreateShortLinkParams = {
  destinationUrl: string;
  customCode?: string;
  ipHash?: string;
  country?: string | null;
};

type CreateShortLinkResult =
  | {
      ok: true;
      link: { shortCode: string; destinationUrl: string; createdAt: Date };
    }
  | { ok: false; status: 429; error: string; retryAfterSeconds: number }
  | { ok: false; status: 400 | 409; error: string };

/** Shared by the public REST API and the MCP tool — both need the same
 * rate-limit → reserved-word → Safe Browsing → create sequence, just
 * translated to their own transport afterward. */
export async function createShortLinkViaApi(
  params: CreateShortLinkParams,
): Promise<CreateShortLinkResult> {
  const { destinationUrl, customCode, ipHash, country } = params;

  if (ipHash) {
    const rateLimit = await checkRateLimit(ipHash);
    if (!rateLimit.allowed) {
      return {
        ok: false,
        status: 429,
        error: "Rate limit exceeded, please try again later",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      };
    }
  }

  if (customCode && isReservedWord(customCode)) {
    return { ok: false, status: 400, error: "That code is reserved and cannot be used" };
  }

  if (await isUrlUnsafe(destinationUrl)) {
    return {
      ok: false,
      status: 400,
      error: "This URL was flagged as unsafe and cannot be shortened",
    };
  }

  const link = await createLink({
    destinationUrl,
    customCode,
    creatorIpHash: ipHash,
    creatorCountry: country,
  });

  if (!link) {
    return { ok: false, status: 409, error: "That code is already taken" };
  }

  return {
    ok: true,
    link: {
      shortCode: link.shortCode,
      destinationUrl: link.destinationUrl,
      createdAt: link.createdAt,
    },
  };
}
