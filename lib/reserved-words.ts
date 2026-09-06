export const RESERVED_WORDS = new Set([
  // real app routes
  "blog",
  "api",
  "admin",
  "about",
  "privacy",
  "terms",
  "contact",
  "pricing",
  "login",
  "signup",
  "dashboard",
  "docs",
  "help",
  "support",
  "stats",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  // next.js / vercel internals
  "_next",
  "_vercel",
  "static",
  "assets",
  "public",
  // common squatting targets
  "www",
  "app",
  "mail",
  "ftp",
  "test",
  "null",
  "undefined",
  "new",
  "create",
  "edit",
  "delete",
  "settings",
  "account",
  "user",
  "users",
]);

export function isReservedWord(value: string): boolean {
  return RESERVED_WORDS.has(value.toLowerCase());
}
