import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  shortCode: text("short_code").notNull().unique(),
  destinationUrl: text("destination_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  creatorIpHash: text("creator_ip_hash"),
  isCustom: boolean("is_custom").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id")
    .notNull()
    .references(() => links.id),
  clickedAt: timestamp("clicked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
});
