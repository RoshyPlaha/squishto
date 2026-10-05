const TURNSTILE_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function isLikelyBot(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  console.log(
    "[turnstile debug] token length:",
    token.length,
    "prefix:",
    token.slice(0, 12),
  );
  if (!secret) {
    // Fail open in local/dev environments without a configured key.
    console.log("[turnstile debug] no secret configured, failing open");
    return false;
  }

  const response = await fetch(TURNSTILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!response.ok) {
    // Fail open on upstream errors so a Cloudflare outage doesn't take down link creation.
    console.log("[turnstile debug] siteverify HTTP error:", response.status);
    return false;
  }

  const data = (await response.json()) as { success: boolean };
  console.log("[turnstile debug] siteverify response:", data);
  return !data.success;
}
