"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function Home() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
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

      setResult(data.shortCode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold">squish.to</h1>
        <p className="text-gray-600">Make your links as small as possible.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="url"
          required
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://example.com/your-long-url"
          className="rounded border px-3 py-2"
        />
        <input
          type="text"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Custom code (optional)"
          className="rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Squishing..." : "Squish"}
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <div className="rounded border p-4">
          <p className="text-gray-600">Your link is ready:</p>
          <a
            href={`/${result}`}
            className="font-medium text-blue-600 underline"
          >
            squish.to/{result}
          </a>
        </div>
      )}
      <div className="flex gap-4 text-sm text-gray-500">
        <Link href="/stats" className="underline">
          Check link stats
        </Link>
        <Link href="/blog" className="underline">
          Blog
        </Link>
      </div>
    </main>
  );
}
