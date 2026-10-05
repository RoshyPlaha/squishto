import { NextRequest, NextResponse } from "next/server";
import { getExpiredFileLinks, deleteLink } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await getExpiredFileLinks();

  for (const link of expired) {
    // deleteLink already handles deleting the underlying Blob file when the
    // destination points at one, then removes the row (clicks cascade).
    await deleteLink(link.id);
  }

  return NextResponse.json({ deleted: expired.length });
}
