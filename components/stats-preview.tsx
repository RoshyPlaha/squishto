const DAILY_HEIGHTS = [34, 52, 41, 68, 60, 88, 100, 74, 46, 58, 39, 63, 50, 29];
const PEAK_THRESHOLD = 88;

const RECENT_OPENS = [
  { time: "14:02 TODAY", source: "Direct", country: "United Kingdom" },
  { time: "13:48 TODAY", source: "Instagram", country: "Germany" },
  { time: "11:19 TODAY", source: "Newsletter", country: "United States" },
  { time: "09:55 TODAY", source: "Direct", country: "Ireland" },
  { time: "22:31 YDAY", source: "WhatsApp", country: "Spain" },
];

const KPIS = [
  { label: "Total opens", value: "1,284" },
  { label: "Last 7 days", value: "412" },
  { label: "Busiest day", value: "Tue" },
  { label: "Created", value: "24 Aug" },
];

export function StatsPreview() {
  return (
    <div className="flex flex-col gap-7 rounded-[22px] bg-surface p-5 md:gap-8 md:rounded-[26px] md:p-10">
      <div className="flex max-w-[60ch] flex-col gap-2.5">
        <h2 className="m-0 font-display text-3xl leading-none tracking-tight uppercase md:text-[48px]">
          See exactly who&apos;s clicking
        </h2>
        <p className="m-0 text-sm leading-relaxed text-text-muted md:text-base">
          Every squish.to link comes with a stats page like this one - no
          dashboard, no login, just the code you already made.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border-input bg-page px-[18px] py-2.5 font-mono text-xs text-text-dim">
        showing stats for{" "}
        <span className="font-medium text-lime">squish.to/summer-sale</span>
      </div>

      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-1.5 rounded-[20px] bg-page p-[20px] md:p-[22px_24px]"
          >
            <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
              {kpi.label}
            </span>
            <span className="font-display text-3xl leading-none md:text-[38px]">
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1.4fr_1fr] md:gap-4">
        <div className="flex flex-col gap-4 rounded-[20px] bg-page p-[22px] md:p-[26px]">
          <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Opens · last 14 days
          </span>
          <div className="flex h-[130px] items-end gap-1.5 md:h-[150px] md:gap-2">
            {DAILY_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className={
                  "flex-1 rounded-md " +
                  (height >= PEAK_THRESHOLD ? "bg-lime" : "bg-lime-dim")
                }
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[11px] text-text-faint">
            <span>24 AUG</span>
            <span>6 SEP</span>
          </div>
        </div>

        <div className="flex flex-col rounded-[20px] bg-page p-[22px] md:p-[26px]">
          <span className="pb-2.5 font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Recent opens
          </span>
          {RECENT_OPENS.map((open, i) => (
            <div
              key={i}
              className="flex items-baseline gap-3.5 border-t border-border py-3 first:border-t-0 first:pt-0"
            >
              <span className="w-[84px] shrink-0 font-mono text-xs text-lime">
                {open.time}
              </span>
              <span className="flex-1 text-sm">{open.source}</span>
              <span className="text-xs text-text-dim">{open.country}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 text-sm text-text-faint">
          This is what you&apos;ll see the moment someone opens your link - no
          setup required.
        </p>
        <a
          href="#url-input"
          className="rounded-full bg-lime px-6 py-3 font-display text-lg text-ink uppercase no-underline hover:bg-lime-hover"
        >
          Squish a link
        </a>
      </div>
    </div>
  );
}
