import { countRecentHits, recordRateLimitHit } from "./db/queries";

export const API_RATE_LIMIT_PER_MINUTE = 5;
export const API_RATE_LIMIT_PER_DAY = 100;

export async function checkRateLimit(
  ipHash: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  await recordRateLimitHit(ipHash);

  const [lastMinute, lastDay] = await Promise.all([
    countRecentHits(ipHash, 1),
    countRecentHits(ipHash, 24 * 60),
  ]);

  if (lastDay > API_RATE_LIMIT_PER_DAY) {
    return { allowed: false, retryAfterSeconds: 24 * 60 * 60 };
  }
  if (lastMinute > API_RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}
