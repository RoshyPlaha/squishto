import { NextRequest, NextResponse } from "next/server";
import { apiCreateLinkSchema } from "@/lib/validation";
import { createShortLinkViaApi } from "@/lib/create-link-service";
import { getRequestIp, hashIp } from "@/lib/ip";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = apiCreateLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const ip = getRequestIp(request);
  const ipHash = ip ? hashIp(ip) : undefined;
  const country = request.headers.get("x-vercel-ip-country");

  const result = await createShortLinkViaApi({
    destinationUrl: parsed.data.destinationUrl,
    customCode: parsed.data.customCode,
    ipHash,
    country,
  });

  if (!result.ok) {
    if (result.status === 429) {
      return NextResponse.json(
        { error: result.error },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
      );
    }
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      shortCode: result.link.shortCode,
      shortUrl: `https://squish.to/${result.link.shortCode}`,
      destinationUrl: result.link.destinationUrl,
      createdAt: result.link.createdAt,
    },
    { status: 201 },
  );
}
