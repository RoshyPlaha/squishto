import type { Metadata } from "next";
import { StatsForm } from "@/components/stats-form";

export const metadata: Metadata = {
  title: "Check link stats | squish.to",
  description: "Look up click stats for any squish.to short link.",
  alternates: { canonical: "/stats" },
};

export default function StatsPage() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <StatsForm />
    </main>
  );
}
