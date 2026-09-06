import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;
  const link = await getLinkByShortCode(shortCode);

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    shortCode: link.shortCode,
    clickCount: link.clickCount,
    createdAt: link.createdAt,
  });
}
