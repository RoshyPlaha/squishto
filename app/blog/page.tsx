import { posts } from "#site/content";
import { BlogFilter } from "@/components/blog-filter";

export const metadata = {
  title: "Blog | squish.to",
  description: "Updates, guides, and notes from the squish.to team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <div className="rounded-[22px] bg-lime p-[26px_20px] text-ink md:rounded-[26px] md:p-[36px_40px_30px]">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h1 className="m-0 origin-bottom-left scale-x-90 pb-[0.1em] font-display text-6xl leading-[0.8] uppercase md:text-[132px]">
            Blog
          </h1>
          <span className="font-display text-lg uppercase md:mb-[18px] md:text-[26px]">
            {today}
          </span>
        </div>
      </div>

      <BlogFilter posts={sorted} />
    </main>
  );
}
