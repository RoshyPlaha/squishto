"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  ogImage?: string;
};

const ALL = "All";

export function BlogFilter({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<string>(ALL);
  const filtered =
    active === ALL ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {[ALL, ...BLOG_CATEGORIES].map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={
                "cursor-pointer rounded-full px-[22px] py-[11px] text-sm font-medium " +
                (isActive
                  ? "bg-ink text-lime font-semibold"
                  : "bg-ink/[0.09] text-ink")
              }
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3 md:gap-4">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col gap-4 overflow-hidden rounded-[22px] bg-surface pb-7 text-text no-underline hover:bg-surface-2 md:rounded-[26px]"
          >
            <div
              className="flex h-[160px] items-end p-3.5 md:h-[190px]"
              style={
                post.ogImage
                  ? {
                      backgroundImage: `url(${post.ogImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {
                      backgroundImage:
                        "repeating-linear-gradient(135deg, #17181C 0 10px, #1F2126 10px 20px)",
                    }
              }
            >
              {!post.ogImage && (
                <span className="font-mono text-[11px] text-text-faint">
                  image · 3:2
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5 px-6">
              <span className="font-mono text-[11px] tracking-wide text-lime uppercase">
                {post.category}
              </span>
              <span className="text-xl leading-snug font-bold tracking-tight md:text-2xl">
                {post.title}
              </span>
              <span className="text-sm leading-relaxed text-text-dim">
                {post.description}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-[22px] bg-surface p-8 text-text-dim md:rounded-[26px]">
            No posts in this category yet.
          </div>
        )}
      </div>
    </>
  );
}
