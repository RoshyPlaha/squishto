import type { Metadata } from "next";
import { StatsForm } from "@/components/stats-form";

export const metadata: Metadata = {
  title: "Check link stats | squish.to",
  description: "Look up click stats for any squish.to short link.",
  alternates: { canonical: "/stats" },
};

export default function StatsPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Check link stats</h1>
      <StatsForm />
    </main>
  );
}
