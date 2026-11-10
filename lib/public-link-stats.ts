import { getLinkStats } from "@/lib/db/queries";
import { referrerLabel } from "@/lib/referrer-label";

// The stats anyone with a short code can see, shared by the stats API route
// and the MCP get_link_stats tool so both return the same shape.
export async function getPublicLinkStats(shortCode: string) {
  const stats = await getLinkStats(shortCode);
  if (!stats) return null;

  return {
    shortCode: stats.shortCode,
    destinationUrl: stats.destinationUrl,
    createdAt: stats.createdAt,
    totalOpens: stats.totalOpens,
    last7Days: stats.last7Days,
    busiestDay: stats.busiestDay,
    dailyCounts: stats.dailyCounts,
    recentOpens: stats.recentOpens.map((open) => ({
      clickedAt: open.clickedAt,
      source: referrerLabel(open.referrer),
      country: open.country,
    })),
  };
}
