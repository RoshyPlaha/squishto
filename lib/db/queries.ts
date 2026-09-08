import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./client";
import { links, clicks } from "./schema";
import { generateShortCode } from "../short-code";

const DAILY_WINDOW_DAYS = 14;
const RECENT_OPENS_LIMIT = 6;

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
  country: string | null;
}) {
  const { linkId, referrer, userAgent, country } = params;

  await Promise.all([
    db.insert(clicks).values({ linkId, referrer, userAgent, country }),
    db
      .update(links)
      .set({ clickCount: sql`${links.clickCount} + 1` })
      .where(eq(links.id, linkId)),
  ]);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getLinkStats(shortCode: string) {
  const link = await getLinkByShortCode(shortCode);
  if (!link) return null;

  const windowStart = new Date();
  windowStart.setUTCHours(0, 0, 0, 0);
  windowStart.setUTCDate(windowStart.getUTCDate() - (DAILY_WINDOW_DAYS - 1));

  const [windowClicks, recentOpens] = await Promise.all([
    db
      .select({ clickedAt: clicks.clickedAt })
      .from(clicks)
      .where(and(eq(clicks.linkId, link.id), gte(clicks.clickedAt, windowStart))),
    db
      .select({
        clickedAt: clicks.clickedAt,
        referrer: clicks.referrer,
        country: clicks.country,
      })
      .from(clicks)
      .where(eq(clicks.linkId, link.id))
      .orderBy(desc(clicks.clickedAt))
      .limit(RECENT_OPENS_LIMIT),
  ]);

  const countsByDay = new Map<string, number>();
  for (let i = 0; i < DAILY_WINDOW_DAYS; i++) {
    const d = new Date(windowStart);
    d.setUTCDate(d.getUTCDate() + i);
    countsByDay.set(dayKey(d), 0);
  }
  for (const { clickedAt } of windowClicks) {
    const key = dayKey(new Date(clickedAt));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const dailyCounts = [...countsByDay.entries()].map(([date, count]) => ({
    date,
    count,
  }));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  const last7Days = dailyCounts
    .filter((d) => new Date(d.date) >= sevenDaysAgo)
    .reduce((sum, d) => sum + d.count, 0);

  const busiest = dailyCounts.reduce(
    (max, d) => (d.count > max.count ? d : max),
    dailyCounts[0],
  );
  const busiestDay =
    busiest.count > 0
      ? new Date(busiest.date).toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        })
      : null;

  return {
    shortCode: link.shortCode,
    destinationUrl: link.destinationUrl,
    createdAt: link.createdAt,
    totalOpens: link.clickCount,
    last7Days,
    busiestDay,
    dailyCounts,
    recentOpens,
  };
}
