export const BLOG_CATEGORIES = [
  "Product",
  "How to",
  "Marketing",
  "Engineering",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
