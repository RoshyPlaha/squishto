import { defineConfig, defineCollection, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      date: s.isodate(),
      tags: s.array(s.string()).optional(),
      ogImage: s.string().optional(),
      slug: s.path(),
      content: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      slug: data.slug.replace(/^blog\//, ""),
    })),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
});
