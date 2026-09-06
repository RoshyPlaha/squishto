import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { links, clicks } from "./schema";
import { generateShortCode } from "../short-code";

export async function getLinkByShortCode(shortCode: string) {
  const rows = await db
    .select()
    .from(links)
    .where(eq(links.shortCode, shortCode))
    .limit(1);
  return rows[0] ?? null;
}

export async function createLink(params: {
  destinationUrl: string;
  customCode?: string;
  creatorIpHash?: string;
}) {
  const { destinationUrl, customCode, creatorIpHash } = params;

  if (customCode) {
    const [row] = await db
      .insert(links)
      .values({
        shortCode: customCode,
        destinationUrl,
        isCustom: true,
        creatorIpHash,
      })
      .onConflictDoNothing({ target: links.shortCode })
      .returning();

    return row ?? null; // null signals the custom code was already taken
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = generateShortCode();
    const [row] = await db
      .insert(links)
      .values({
        shortCode,
        destinationUrl,
        isCustom: false,
        creatorIpHash,
      })
      .onConflictDoNothing({ target: links.shortCode })
      .returning();

    if (row) return row;
  }

  throw new Error("Failed to generate a unique short code after several attempts");
}

export async function recordClick(params: {
  linkId: number;
  referrer: string | null;
  userAgent: string | null;
}) {
  const { linkId, referrer, userAgent } = params;

  await Promise.all([
    db.insert(clicks).values({ linkId, referrer, userAgent }),
    db
      .update(links)
      .set({ clickCount: sql`${links.clickCount} + 1` })
      .where(eq(links.id, linkId)),
  ]);
}
