import styles from "./kinetic-hero.module.css";

const WORDS = [
  { className: styles.w1, top: "Drop", bottom: "it." },
  { className: styles.w2, top: "Squish", bottom: "it." },
  { className: styles.w3, top: "Send", bottom: "it." },
  { className: styles.w4, top: "See it", bottom: "open." },
];

const TICKER = [
  "squish.to/proposal · opened 14:02 · London",
  "squish.to/menu · opened 14:09 · Dublin",
  "squish.to/summer-sale · opened 14:31 · Berlin",
  "squish.to/pitch-deck · opened 15:12 · New York",
];

export function KineticHero() {
  return (
    <div
      className={`${styles.hero} overflow-hidden rounded-[22px] bg-brand text-ink md:rounded-[26px]`}
    >
      <div className="flex items-center gap-8 p-[22px_20px_26px] md:p-[40px_40px_36px]">
        <div className="flex min-w-0 flex-col gap-5 md:gap-6">
          <span className="font-display text-xl uppercase md:text-[26px]">
            Free · No account
          </span>
          <div
            aria-hidden="true"
            className="relative h-[1.72em] font-display text-[clamp(4.5rem,1.5rem+11vw,12rem)] leading-[0.86] uppercase"
          >
            {WORDS.map((word) => (
              <span
                key={word.top}
                className={`${styles.word} ${word.className} absolute top-0 left-0 whitespace-nowrap`}
              >
                {word.top}
                <br />
                {word.bottom}
              </span>
            ))}
          </div>
          <h1 className="m-0 max-w-[24ch] text-[25px] leading-[1.12] font-semibold tracking-tight text-wrap-pretty md:text-[34px] md:leading-[1.1]">
            Upload any file or URL. Make links as small as possible. Track
            when they are opened.
          </h1>
        </div>

        <div aria-hidden="true" className="hidden flex-1 justify-center md:flex">
          <div className="relative h-[280px] w-[240px] shrink-0 xl:scale-125">
            <div
              className={`${styles.v1} absolute top-[30px] left-[45px] flex h-[180px] w-[150px] flex-col justify-between rounded-[18px] bg-surface p-4 shadow-[0_18px_40px_rgba(17,17,20,0.22)]`}
            >
              <div className="flex h-14 w-[46px] items-end justify-center rounded-lg bg-ink pb-2 font-mono text-[11px] font-medium text-brand">
                PDF
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-bold">Proposal.pdf</span>
                <span className="font-mono text-[11px] text-text-dim">2.4 MB</span>
              </div>
            </div>

            <div
              className={`${styles.v2} absolute top-[110px] left-[5px] flex h-[58px] w-[230px] items-center justify-center rounded-full bg-ink font-mono text-[15px] font-medium text-white`}
            >
              squish.to/proposal
            </div>

            <svg
              className={`${styles.v3} absolute top-[85px] left-[65px]`}
              width="110"
              height="110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4z" />
            </svg>

            <div
              className={`${styles.v4} absolute top-[40px] left-[16px] flex w-[208px] flex-col gap-2 rounded-[22px] bg-surface p-[20px_22px]`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
                  Opens
                </span>
                <span className={`${styles.dot} size-2 rounded-full bg-accent`} />
              </div>
              <span className="font-display text-[84px] leading-none">3</span>
              <span className="font-mono text-xs text-accent-strong">
                Last open 14:31 · Berlin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The track is absolutely positioned so its long line of text never
          widens the page. */}
      <div aria-hidden="true" className="relative h-[52px] overflow-hidden bg-ink md:h-[60px]">
        <div className={`${styles.track} absolute inset-y-0 left-0 flex items-center font-mono text-xs tracking-wide whitespace-nowrap text-brand uppercase md:text-[13px]`}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="pr-10">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
