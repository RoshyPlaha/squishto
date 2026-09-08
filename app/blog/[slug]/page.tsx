import { notFound } from "next/navigation";
import Link from "next/link";
import { posts } from "#site/content";
import { MDXContent } from "@/components/mdx-content";
import { readingTimeMinutes } from "@/lib/reading-time";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | squish.to Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: [post.ogImage ?? "/opengraph-image"],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
  };

  const dateLabel = new Date(post.date)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
  const minutes = readingTimeMinutes(post.content);

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col gap-3.5 rounded-[22px] bg-lime p-[26px_20px] text-ink md:rounded-[26px] md:p-[36px_40px]">
        <span className="font-mono text-xs tracking-wide uppercase">
          {post.category} · {dateLabel} · {minutes} MIN
        </span>
        <h1 className="m-0 max-w-[24ch] font-display text-4xl leading-[0.95] uppercase md:text-[88px] md:leading-[0.88]">
          {post.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1fr_300px] md:gap-4">
        <article className="article-body rounded-[22px] bg-surface p-6 md:rounded-[26px] md:p-10">
          <MDXContent code={post.content} />
        </article>
        <div className="flex h-fit flex-col gap-3.5 rounded-[22px] bg-surface p-6 md:rounded-[26px] md:p-[30px]">
          <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Try it
          </span>
          <span className="text-base leading-relaxed text-text-muted">
            Make a readable link in about four seconds.
          </span>
          <Link
            href="/"
            className="rounded-full bg-lime px-5 py-3.5 text-center font-display text-xl text-ink uppercase no-underline hover:bg-lime-hover"
          >
            Squish a link
          </Link>
        </div>
      </div>
    </main>
  );
}
