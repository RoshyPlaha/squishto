import { NextRequest, NextResponse } from "next/server";
import { getPublicLinkStats } from "@/lib/public-link-stats";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;
  const stats = await getPublicLinkStats(shortCode);

  if (!stats) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(stats);
}
