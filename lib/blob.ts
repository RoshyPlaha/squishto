export const PENDING_UPLOAD_DESTINATION = "pending:upload";

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("blob.vercel-storage.com");
  } catch {
    return false;
  }
}
