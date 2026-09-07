import Link from "next/link";
import { posts } from "#site/content";

export const metadata = {
  title: "Blog | squish.to",
  description: "Updates, guides, and notes from the squish.to team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <ul className="flex flex-col gap-6">
        {sorted.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="text-xl font-medium underline">
              {post.title}
            </Link>
            <p className="text-gray-600">{post.description}</p>
            <p className="text-sm text-gray-400">
              {new Date(post.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
