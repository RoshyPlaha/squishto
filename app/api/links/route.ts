import { NextRequest, NextResponse } from "next/server";
import { createLinkSchema } from "@/lib/validation";
import { isReservedWord } from "@/lib/reserved-words";
import { isUrlUnsafe } from "@/lib/safe-browsing";
import { createLink } from "@/lib/db/queries";
import { getRequestIp, hashIp } from "@/lib/ip";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { destinationUrl, customCode } = parsed.data;

  if (customCode && isReservedWord(customCode)) {
    return NextResponse.json(
      { error: "That code is reserved and cannot be used" },
      { status: 400 },
    );
  }

  if (await isUrlUnsafe(destinationUrl)) {
    return NextResponse.json(
      { error: "This URL was flagged as unsafe and cannot be shortened" },
      { status: 400 },
    );
  }

  const ip = getRequestIp(request);
  const creatorIpHash = ip ? hashIp(ip) : undefined;

  const link = await createLink({ destinationUrl, customCode, creatorIpHash });

  if (!link) {
    return NextResponse.json(
      { error: "That code is already taken" },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { shortCode: link.shortCode, destinationUrl: link.destinationUrl },
    { status: 201 },
  );
}
