const SAFE_BROWSING_ENDPOINT =
  "https://safebrowsing.googleapis.com/v4/threatMatches:find";

export async function isUrlUnsafe(url: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    // Fail open in local/dev environments without a configured key.
    return false;
  }

  const response = await fetch(`${SAFE_BROWSING_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client: { clientId: "squish-to", clientVersion: "1.0.0" },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }],
      },
    }),
  });

  if (!response.ok) {
    // Fail open on upstream errors so a Safe Browsing outage doesn't take down link creation.
    return false;
  }

  const data = (await response.json()) as { matches?: unknown[] };
  return Boolean(data.matches && data.matches.length > 0);
}
