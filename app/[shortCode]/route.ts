import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { isReservedWord } from "@/lib/reserved-words";
import { getLinkByShortCode, recordClick } from "@/lib/db/queries";
import { PENDING_UPLOAD_DESTINATION } from "@/lib/blob";

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

  if (link.destinationUrl === PENDING_UPLOAD_DESTINATION) {
    // Reserved for a file upload that hasn't finished yet — this window is
    // normally sub-second, so a plain retry almost always works.
    return new NextResponse("Upload still in progress, try again in a moment.", {
      status: 503,
      headers: { "Retry-After": "2" },
    });
  }

  after(() =>
    recordClick({
      linkId: link.id,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
      country: request.headers.get("x-vercel-ip-country"),
    }),
  );

  if (link.contentType === "text/html") {
    // Vercel Blob forces Content-Disposition: attachment for text/html (to
    // stop exactly this kind of hosting abuse), so a redirect would just
    // download the file instead of rendering it. Fetch it ourselves and
    // re-serve it under our own headers instead — crucially with a CSP that
    // blocks script execution, since this is anonymous, unauthenticated
    // upload hosting arbitrary HTML under our own domain.
    const blobRes = await fetch(link.destinationUrl);
    if (!blobRes.ok) notFound();
    const html = await blobRes.text();

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.redirect(link.destinationUrl, { status: 307 });
}
