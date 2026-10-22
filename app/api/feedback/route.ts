import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validation";
import { createFeedback } from "@/lib/db/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIp, hashIp } from "@/lib/ip";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { message, shortCode } = parsed.data;

  const ip = getRequestIp(request);
  if (ip) {
    const limit = await checkRateLimit(hashIp(ip));
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many messages, please try again later" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }
  }

  await createFeedback({
    message,
    shortCode,
    country: request.headers.get("x-vercel-ip-country"),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
