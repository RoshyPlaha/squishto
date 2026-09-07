import type { Metadata } from "next";
import { HomeForm } from "@/components/home-form";

const title = "squish.to — make your links as small as possible";
const description =
  "A free URL shortener with custom endpoints and click stats. No account required.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/" },
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold">squish.to</h1>
        <p className="text-gray-600">
          Make your links as small as possible. Track when they are opened.
        </p>
        <p className="mt-3 text-gray-600">
          squish.to is a free URL shortener with custom slugs - pick your own
          ending, like squish.to/summer-sale, instead of a random string.
          Every link comes with built-in click tracking, so you always know
          when and how often it&apos;s been opened. No account required: just
          your marketing companion for cleaner, trackable links.
        </p>
      </div>
      <HomeForm />
    </main>
  );
}
