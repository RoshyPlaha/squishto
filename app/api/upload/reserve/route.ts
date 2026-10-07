import { NextRequest, NextResponse } from "next/server";
import { reserveUploadSchema } from "@/lib/validation";
import { isReservedWord } from "@/lib/reserved-words";
import { reserveFileLinkCode } from "@/lib/db/queries";
import { getRequestIp, hashIp } from "@/lib/ip";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = reserveUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { customCode } = parsed.data;

  if (customCode && isReservedWord(customCode)) {
    return NextResponse.json(
      { error: "That code is reserved and cannot be used" },
      { status: 400 },
    );
  }

  const ip = getRequestIp(request);
  const creatorIpHash = ip ? hashIp(ip) : undefined;
  const creatorCountry = request.headers.get("x-vercel-ip-country");

  const link = await reserveFileLinkCode({
    customCode,
    creatorIpHash,
    creatorCountry,
  });

  if (!link) {
    return NextResponse.json(
      { error: "That code is already taken" },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { linkId: link.id, shortCode: link.shortCode },
    { status: 201 },
  );
}
