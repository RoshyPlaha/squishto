import type { Metadata } from "next";
import Link from "next/link";
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

const STEPS = [
  {
    n: "01",
    title: "Paste the long one",
    body: "Any URL, however ugly. Query strings included.",
  },
  {
    n: "02",
    title: "Name the ending",
    body: "squish.to/summer-sale, or let us pick six characters.",
  },
  {
    n: "03",
    title: "Watch the opens",
    body: "Every click is counted and timestamped on your stats page.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <HomeForm />

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3 md:gap-4">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="flex flex-col gap-2.5 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]"
          >
            <span className="font-display text-3xl leading-none text-lime md:text-[44px]">
              {step.n}
            </span>
            <span className="text-lg font-bold tracking-tight md:text-xl">
              {step.title}
            </span>
            <span className="text-sm leading-relaxed text-text-dim md:text-[15px]">
              {step.body}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 px-[26px] pt-3.5 pb-1.5">
        <span className="font-mono text-xs tracking-wide text-text-dim">
          SQUISH.TO
        </span>
        <div className="flex-1" />
        <Link href="/stats" className="text-sm text-text-dim">
          Stats
        </Link>
        <Link href="/blog" className="text-sm text-text-dim">
          Blog
        </Link>
        <Link href="/privacy" className="text-sm text-text-dim">
          Privacy
        </Link>
      </div>
    </main>
  );
}
