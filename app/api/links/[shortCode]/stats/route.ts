import { NextRequest, NextResponse } from "next/server";
import { getLinkStats } from "@/lib/db/queries";
import { referrerLabel } from "@/lib/referrer-label";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;
  const stats = await getLinkStats(shortCode);

  if (!stats) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}
