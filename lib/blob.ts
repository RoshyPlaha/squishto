export const PENDING_UPLOAD_DESTINATION = "pending:upload";

// Uploaded HTML renders here, not on squish.to itself — an isolated
// subdomain so a malicious upload (no account, no bot-check gates it) can't
// touch squish.to's own cookies/origin/reputation even with scripts allowed.
export const FILE_HOST = "file.squish.to";

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("blob.vercel-storage.com");
  } catch {
    return false;
  }
}
