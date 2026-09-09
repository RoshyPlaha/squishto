import type { Metadata } from "next";
import { getLinkStats } from "@/lib/db/queries";
import { referrerLabel } from "@/lib/referrer-label";
import { StatsForm } from "@/components/stats-form";

export const metadata: Metadata = {
  title: "Check link stats | squish.to",
  description: "Look up click stats for any squish.to short link.",
  alternates: { canonical: "/stats" },
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const initialStats = code ? await getLinkStats(code) : null;

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <StatsForm
        initialInput={code}
        initialSearched={Boolean(code)}
        initialStats={
          initialStats
            ? {
                shortCode: initialStats.shortCode,
                destinationUrl: initialStats.destinationUrl,
                createdAt: initialStats.createdAt.toISOString(),
                totalOpens: initialStats.totalOpens,
                last7Days: initialStats.last7Days,
                busiestDay: initialStats.busiestDay,
                dailyCounts: initialStats.dailyCounts,
                recentOpens: initialStats.recentOpens.map((open) => ({
                  clickedAt: open.clickedAt.toISOString(),
                  source: referrerLabel(open.referrer),
                  country: open.country,
                })),
              }
            : null
        }
      />
    </main>
  );
}
