import { NextRequest, NextResponse } from "next/server";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

export async function proxy(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedPasswordHash) {
    // Not configured — fail closed, admin area stays inaccessible rather
    // than silently open.
    return unauthorized();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  const decoded = atob(authHeader.slice("Basic ".length));
  const separatorIndex = decoded.indexOf(":");
  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  const passwordHash = await sha256Hex(password);

  if (username !== expectedUsername || passwordHash !== expectedPasswordHash) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
