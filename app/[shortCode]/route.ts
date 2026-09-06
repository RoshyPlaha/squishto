import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { isReservedWord } from "@/lib/reserved-words";
import { getLinkByShortCode, recordClick } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;

  if (isReservedWord(shortCode)) {
    notFound();
  }

  const link = await getLinkByShortCode(shortCode);

  if (!link) {
    notFound();
  }

  after(() =>
    recordClick({
      linkId: link.id,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    }),
  );

  return NextResponse.redirect(link.destinationUrl, { status: 307 });
}
