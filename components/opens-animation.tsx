"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./opens-animation.module.css";

// The scene is drawn on a fixed 720x480 stage and scaled to fit its box, so
// the timings in the stylesheet can rely on exact pixel positions. Narrow
// screens crop to the stats card alone so its text stays readable.
const FULL_VIEW = { x: 24, y: 36, width: 690, height: 408 };
const COMPACT_VIEW = { x: 342, y: 42, width: 366, height: 396 };
const COMPACT_QUERY = "(max-width: 639px)";

const OPENS = [
  { time: "14:02", source: "Email", country: "United Kingdom" },
  { time: "14:03", source: "Slack", country: "Ireland" },
  { time: "14:05", source: "WhatsApp", country: "Spain" },
  { time: "14:06", source: "Direct", country: "Germany" },
  { time: "14:08", source: "Instagram", country: "United States" },
];

const BAR_HEIGHTS = [30, 52, 40, 62, 74];

export function OpensAnimation() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(box);

    const query = window.matchMedia(COMPACT_QUERY);
    const updateCompact = () => setCompact(query.matches);
    updateCompact();
    query.addEventListener("change", updateCompact);

    return () => {
      observer.disconnect();
      query.removeEventListener("change", updateCompact);
    };
  }, []);

  const view = compact ? COMPACT_VIEW : FULL_VIEW;
  const scale = width ? width / view.width : 1;

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label="A squish.to link being opened five times, with the open count, chart and recent opens list updating live"
      className="relative aspect-[366/396] w-full overflow-hidden rounded-[20px] bg-page sm:aspect-[690/408]"
    >
      <div
        aria-hidden="true"
        className={`${styles.stage} absolute top-0 left-0 h-[480px] w-[720px] origin-top-left text-ink`}
        style={{
          transform: `scale(${scale}) translate(${-view.x}px, ${-view.y}px)`,
          visibility: width ? "visible" : "hidden",
        }}
      >
        {/* The link card's kick and ripples spill into the compact crop, so it
            shows the stats card alone, with pings arriving from off-screen. */}
        {!compact && (
          <>
            <div className={`${styles.ring} absolute top-[60px] left-[40px] h-[360px] w-[300px] rounded-[26px] border-[3px] border-brand`} />
            <div className={`${styles.ring2} absolute top-[60px] left-[40px] h-[360px] w-[300px] rounded-[26px] border-2 border-brand`} />
            <div className={`${styles.card} absolute top-[60px] left-[40px] flex h-[360px] w-[300px] flex-col justify-between rounded-[26px] bg-brand p-7`}>
              <span className="font-mono text-xs tracking-wide uppercase">
                Your link
              </span>
              <span className="font-display text-[58px] leading-[0.9] uppercase">
                squish.to/
                <br />
                proposal
              </span>
              <span className="text-[15px] font-semibold">
                Sent to the client team
              </span>
            </div>
          </>
        )}

        <div className={`${styles.stats} absolute top-[60px] left-[360px] h-[360px] w-[330px] rounded-[26px] bg-surface`}>
          <span className="absolute top-6 left-[26px] font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Total opens
          </span>
          <span className="absolute top-[22px] right-[26px] flex items-center gap-2 font-mono text-[11px] tracking-wide text-accent-strong uppercase">
            <span className={`${styles.dot} size-2 rounded-full bg-accent`} />
            Live
          </span>

          <svg
            className={`${styles.spark} absolute top-[30px] left-[-14px] text-accent`}
            width="130"
            height="130"
            viewBox="0 0 130 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M65 8v16M65 106v16M8 65h16M106 65h16M25 25l11 11M94 94l11 11M105 25l-11 11M36 94l-11 11" />
          </svg>

          <div className="absolute top-[52px] left-[26px] size-[90px]">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`${styles.digit} absolute top-0 left-0 font-display text-[86px] leading-none`}
              >
                {n}
              </span>
            ))}
          </div>
          <span className={`${styles.plus} absolute top-[62px] left-[92px] font-mono text-lg font-bold text-accent`}>
            +1
          </span>

          <div className="absolute top-16 right-[26px] left-40 flex h-[74px] items-end gap-[7px]">
            {BAR_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className={`${styles.bar} flex-1 rounded-md`}
                style={{ height }}
              />
            ))}
          </div>

          <span className="absolute top-[158px] right-[26px] left-[26px] border-t border-border pt-3 font-mono text-[11px] tracking-wide text-text-dim uppercase">
            Recent opens
          </span>

          <div className="absolute top-[190px] right-[18px] left-[18px] h-[152px] overflow-hidden">
            {OPENS.map((open) => (
              <div
                key={open.time}
                className={`${styles.row} absolute top-0 right-0 left-0 flex h-[34px] items-center gap-3 rounded-lg px-2`}
              >
                <span className="w-11 font-mono text-xs text-accent-strong">
                  {open.time}
                </span>
                <span className="flex-1 text-sm">{open.source}</span>
                <span className="text-xs text-text-dim">{open.country}</span>
              </div>
            ))}
          </div>
        </div>

        <span className={`${styles.ping} absolute top-[232px] left-[330px] size-4 rounded-full bg-accent`} />
      </div>
    </div>
  );
}
