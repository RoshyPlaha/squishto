"use client";

import { useState, FormEvent } from "react";

type Stats = {
  shortCode: string;
  clickCount: number;
  createdAt: string;
};

function extractShortCode(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    return url.pathname.replace(/^\//, "");
  } catch {
    return trimmed.replace(/^\//, "");
  }
}

export default function StatsPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStats(null);
    const shortCode = extractShortCode(input);
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

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Check link stats</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="squish.to/yourcode or yourcode"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {stats && (
        <div className="rounded border p-4">
          <p>
            <span className="font-medium">Short code:</span> {stats.shortCode}
          </p>
          <p>
            <span className="font-medium">Clicks:</span> {stats.clickCount}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(stats.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </main>
  );
}
