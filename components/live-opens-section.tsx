import type { ReactNode } from "react";
import { OpensAnimation } from "@/components/opens-animation";

export function LiveOpensSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-6 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:p-10">
      <div className="flex flex-col gap-3 lg:pl-2">
        <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
          Live tracking
        </span>
        <h2 className="m-0 font-display text-4xl leading-[0.95] uppercase md:text-[56px]">
          {title}
        </h2>
        <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-text-muted md:text-[17px] md:leading-[1.6]">
          {children}
        </p>
      </div>
      <div className="mx-auto w-full max-w-[760px]">
        <OpensAnimation />
      </div>
    </div>
  );
}
