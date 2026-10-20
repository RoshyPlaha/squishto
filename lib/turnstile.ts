const TURNSTILE_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function isLikelyBot(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail open in local/dev environments without a configured key.
    return false;
  }

  const response = await fetch(TURNSTILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!response.ok) {
    // Fail open on upstream errors so a Cloudflare outage doesn't take down link creation.
    return false;
  }

  const data = (await response.json()) as { success: boolean };
  return !data.success;
}
