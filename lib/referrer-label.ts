const HOSTNAME_LABELS: Record<string, string> = {
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "whatsapp.com": "WhatsApp",
  "wa.me": "WhatsApp",
  "web.whatsapp.com": "WhatsApp",
  "t.co": "Twitter/X",
  "x.com": "Twitter/X",
  "twitter.com": "Twitter/X",
  "facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  "lm.facebook.com": "Facebook",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "google.com": "Google",
  "mail.google.com": "Newsletter",
};

export function referrerLabel(referrer: string | null): string {
  if (!referrer) return "Direct";

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "");
    return HOSTNAME_LABELS[hostname] ?? hostname;
  } catch {
    return "Direct";
  }
}
