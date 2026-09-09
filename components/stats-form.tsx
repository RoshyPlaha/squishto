"use client";

import { useState, FormEvent } from "react";

type DailyCount = { date: string; count: number };
type RecentOpen = { clickedAt: string; source: string; country: string | null };

type Stats = {
  shortCode: string;
  destinationUrl: string;
  createdAt: string;
  totalOpens: number;
  last7Days: number;
  busiestDay: string | null;
  dailyCounts: DailyCount[];
  recentOpens: RecentOpen[];
};

function extractShortCode(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");
  const segments = trimmed.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

const countryNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryLabel(code: string | null): string {
  if (!code) return "Unknown";
  try {
    return countryNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

function formatShortTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `${time} TODAY`;
  if (isYesterday) return `${time} YDAY`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

type StatsFormProps = {
  initialInput?: string;
  initialSearched?: boolean;
  initialStats?: Stats | null;
};

export function StatsForm({
  initialInput = "",
  initialSearched = false,
  initialStats = null,
}: StatsFormProps) {
  const [input, setInput] = useState(initialInput);
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(initialSearched);

  async function runLookup(shortCode: string) {
    setError(null);
    setStats(null);
    setSearched(true);
    if (!shortCode) {
      setError("Enter a short link or code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(shortCode)}/stats`);
      if (!res.ok) {
        setError("No stats found for that link");
        return;
      }
      setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runLookup(extractShortCode(input));
  }

  const maxDaily = stats
    ? Math.max(1, ...stats.dailyCounts.map((d) => d.count))
    : 1;
  const peakThreshold = stats
    ? [...stats.dailyCounts].sort((a, b) => b.count - a.count)[1]?.count ?? Infinity
    : Infinity;

  const kpis = stats
    ? [
        { label: "TOTAL OPENS", value: stats.totalOpens.toLocaleString() },
        { label: "LAST 7 DAYS", value: stats.last7Days.toLocaleString() },
        { label: "BUSIEST DAY", value: stats.busiestDay ?? "—" },
        {
          label: "CREATED",
          value: new Date(stats.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
        },
      ]
    : [];

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[22px] bg-lime p-[26px_20px] text-ink md:flex-row md:items-end md:rounded-[26px] md:p-[36px_40px_30px]">
        <h1 className="m-0 origin-bottom-left scale-x-90 pb-[0.1em] font-display text-6xl leading-[0.8] uppercase md:text-[132px]">
          Stats
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2.5"
        >
          <div className="flex items-center gap-2 rounded-full bg-ink px-5">
            <span className="text-sm text-text-faint md:text-base">
              squish.to/
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="your-code"
              className="w-[140px] bg-transparent py-4 text-sm text-text placeholder:text-text-faint focus:outline-none md:w-[180px] md:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] cursor-pointer rounded-full bg-ink px-6 text-base font-semibold text-lime hover:bg-surface-2 disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Look up"}
          </button>
        </form>
      </div>

      {!stats && searched && !loading && (
        <div className="rounded-[22px] bg-surface p-[26px] md:rounded-[26px] md:p-8">
          <span className="font-mono text-xs tracking-wide text-text-dim uppercase">
            {error ?? "No stats found for that link"}
          </span>
        </div>
      )}

      {!searched && (
        <div className="rounded-[22px] bg-surface p-[26px] md:rounded-[26px] md:p-8">
          <span className="font-mono text-xs tracking-wide text-text-dim uppercase">
            Enter a short code above to see its stats
          </span>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex flex-col gap-1.5 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[26px_28px]"
              >
                <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
                  {kpi.label}
                </span>
                <span className="font-display text-3xl leading-none md:text-[46px]">
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1.4fr_1fr] md:gap-4">
            <div className="flex flex-col gap-4 rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-[30px]">
              <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
                Opens · last 14 days
              </span>
              <div className="flex h-[140px] items-end gap-1.5 md:h-[190px] md:gap-2">
                {stats.dailyCounts.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count}`}
                    className={
                      "flex-1 rounded-md " +
                      (d.count >= peakThreshold && d.count > 0
                        ? "bg-lime"
                        : "bg-lime-dim")
                    }
                    style={{
                      height: `${Math.max(4, (d.count / maxDaily) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[11px] text-text-faint">
                  {new Date(stats.dailyCounts[0].date)
                    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    .toUpperCase()}
                </span>
                <span className="font-mono text-[11px] text-text-faint">
                  {new Date(stats.dailyCounts[stats.dailyCounts.length - 1].date)
                    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                    .toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-[30px]">
              <span className="pb-2.5 font-mono text-[11px] tracking-wide text-text-dim uppercase">
                Recent opens
              </span>
              {stats.recentOpens.length === 0 && (
                <span className="py-3 text-sm text-text-dim">
                  No opens yet — share the link to start seeing activity here.
                </span>
              )}
              {stats.recentOpens.map((open, i) => (
                <div
                  key={i}
                  className="flex items-baseline gap-3.5 border-t border-border py-3"
                >
                  <span className="w-[88px] shrink-0 font-mono text-xs text-lime md:w-24 md:text-[13px]">
                    {formatShortTime(open.clickedAt)}
                  </span>
                  <span className="flex-1 text-sm md:text-[15px]">
                    {open.source}
                  </span>
                  <span className="text-xs text-text-dim md:text-sm">
                    {countryLabel(open.country)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
