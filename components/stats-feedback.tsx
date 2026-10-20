"use client";

import { useState, FormEvent } from "react";

export function StatsFeedback({ shortCode }: { shortCode: string }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, shortCode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong");
        return;
      }

      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-brand p-[22px] text-ink md:flex-row md:items-center md:gap-8 md:rounded-[26px] md:p-[26px_30px]">
      <label
        htmlFor="stats-feedback"
        className="font-display text-3xl leading-none uppercase md:w-[300px] md:shrink-0 md:text-[40px]"
      >
        What&apos;s missing from these stats?
      </label>
      {sent ? (
        <span className="text-base font-semibold md:text-lg">
          Thanks, that helps.
        </span>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-2.5 md:flex-row"
        >
          <input
            id="stats-feedback"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Optional, one line is plenty"
            className="min-h-[52px] flex-1 rounded-full bg-surface px-5 text-sm text-text placeholder:text-text-faint focus:outline-none md:text-base"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="min-h-[52px] cursor-pointer rounded-full bg-ink px-6 text-base font-semibold text-brand hover:bg-ink-hover disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      )}
      {error && <span className="text-sm font-medium">{error}</span>}
    </div>
  );
}
