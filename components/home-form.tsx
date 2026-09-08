"use client";

import { useRef, useState, FormEvent } from "react";
import Link from "next/link";

type Result = {
  shortCode: string;
  destinationUrl: string;
};

export function HomeForm() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl,
          customCode: customCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResult({ shortCode: data.shortCode, destinationUrl: data.destinationUrl });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setDestinationUrl("");
    setCustomCode("");
    setError(null);
  }

  async function handleCopy() {
    if (!result) return;
    const link = `https://squish.to/${result.shortCode}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        throw new Error("no clipboard API");
      }
    } catch {
      const input = document.createElement("textarea");
      input.value = link;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand("copy");
      } catch {
        // best-effort fallback; nothing more we can do here
      }
      document.body.removeChild(input);
    }
    setCopied(true);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1600);
  }

  if (result) {
    const shortLink = `squish.to/${result.shortCode}`;
    return (
      <>
        <div className="flex flex-col gap-4 rounded-[22px] bg-lime p-[26px_20px] text-ink md:rounded-[26px] md:p-10">
          <span className="font-mono text-xs tracking-wide uppercase md:text-xs">
            Squished · {result.destinationUrl.length} chars → {shortLink.length}
          </span>
          <div className="font-display text-4xl leading-[0.9] break-words uppercase md:text-[100px] md:leading-[0.86]">
            {shortLink}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[52px] cursor-pointer rounded-full bg-ink px-[30px] py-4 text-base font-semibold text-lime hover:bg-surface-2"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link
              href="/stats"
              className="flex min-h-[52px] cursor-pointer items-center rounded-full border-[1.5px] border-ink px-[30px] py-4 text-base font-semibold text-ink no-underline hover:bg-ink/10"
            >
              View stats
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1.4fr_1fr_1fr] md:gap-4">
          <div className="flex flex-col gap-1.5 rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-7">
            <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
              Destination
            </span>
            <span className="text-base break-words text-text-muted">
              {result.destinationUrl}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-7">
            <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
              Clicks
            </span>
            <span className="font-display text-4xl leading-none">0</span>
            <span className="text-sm text-text-dim">Tracking is on</span>
          </div>
          <div className="flex flex-col justify-center gap-2.5 rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-7">
            <span className="text-base text-text-muted">Need another?</span>
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded-full bg-lime px-5 py-3 text-center font-display text-lg text-ink uppercase hover:bg-lime-hover"
            >
              Squish another
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rounded-[22px] bg-lime p-[22px_20px_24px] text-ink md:rounded-[26px] md:p-[44px_40px_34px]">
        <div className="flex items-end justify-between gap-5">
          <h1 className="m-0 origin-bottom-left scale-x-90 pb-[0.13em] font-display text-[clamp(4rem,1.3rem+19vw,16.75rem)] leading-[0.76] uppercase">
            Squish
          </h1>
          <span className="mb-6 hidden shrink-0 whitespace-nowrap font-display text-2xl uppercase md:mb-[26px] md:block md:text-[26px]">
            Free · No account
          </span>
        </div>
        <p className="mt-1 max-w-[24ch] text-[25px] leading-[1.12] font-semibold tracking-tight text-wrap-pretty md:mt-0 md:text-[40px] md:leading-[1.08]">
          Make your links as small as possible. Track when they are opened.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1.05fr_1fr] md:gap-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8"
        >
          <input
            id="url-input"
            type="url"
            required
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://example.com/your-long-url"
            className="w-full rounded-2xl border border-border-input bg-page px-[22px] py-5 text-base text-text placeholder:text-text-faint focus:outline-2 focus:outline-lime focus:outline-offset-2 md:text-lg"
          />
          <div className="flex items-center gap-2.5 rounded-2xl border border-border-input bg-page px-[22px]">
            <span className="text-base text-text-faint md:text-lg">
              squish.to/
            </span>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="summer-sale"
              className="min-w-0 flex-1 bg-transparent py-5 text-base text-text placeholder:text-text-faint focus:outline-none md:text-lg"
            />
            <span className="font-mono text-[11px] tracking-wide text-text-faint uppercase">
              Optional
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[56px] cursor-pointer rounded-full bg-lime py-4 font-display text-2xl tracking-wide text-ink uppercase hover:bg-lime-hover disabled:opacity-50 md:min-h-[60px] md:text-[26px]"
          >
            {loading ? "Squishing..." : "Squish it"}
          </button>
          {error && <p className="text-red-400">{error}</p>}
        </form>
        <div className="flex items-center rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8">
          <p className="m-0 text-sm leading-relaxed text-text-muted text-wrap-pretty md:text-[17px] md:leading-[1.6]">
            squish.to is a free URL shortener with custom slugs — pick your
            own ending, like squish.to/summer-sale, instead of a random
            string. Every link comes with built-in click tracking, so you
            always know when and how often it&apos;s been opened. No account
            required: just your marketing companion for cleaner, trackable
            links.
          </p>
        </div>
      </div>
    </>
  );
}
