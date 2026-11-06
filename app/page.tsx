import type { Metadata } from "next";
import Link from "next/link";
import { HomeForm } from "@/components/home-form";
import { OpensAnimation } from "@/components/opens-animation";
import { StatsPreview } from "@/components/stats-preview";

const title = "squish.to - make your links as small as possible";
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

      <div className="grid grid-cols-1 items-center gap-6 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:p-10">
        <div className="flex flex-col gap-3 lg:pl-2">
          <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Live tracking
          </span>
          <h2 className="m-0 font-display text-4xl leading-[0.95] uppercase md:text-[56px]">
            Know the moment it&apos;s opened
          </h2>
          <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-text-muted md:text-[17px] md:leading-[1.6]">
            Share your squish.to link and watch the opens roll in. Every click
            is counted and timestamped, with where it came from and the
            country, on a stats page that needs no login.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[760px]">
          <OpensAnimation />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3 md:gap-4">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="flex flex-col gap-2.5 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]"
          >
            <span className="font-display text-3xl leading-none text-accent md:text-[44px]">
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

      <StatsPreview />

      <div className="flex items-center gap-6 px-[26px] pt-3.5 pb-1.5">
        <span className="text-xs tracking-wide text-text-dim">
          squish.to, for your marketing needs
        </span>
        <div className="flex-1" />
        <Link href="/was-it-opened" className="text-sm text-text-dim">
          Was it opened?
        </Link>
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
