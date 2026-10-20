"use client";

import { useEffect, useState, FormEvent } from "react";
import Script from "next/script";
import { getTurnstileToken } from "@/lib/turnstile-client";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const DISMISSED_KEY = "squish-feedback-dismissed";
const SHOW_DELAY_MS = 4000;
const THANKS_MS = 2500;

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // best-effort; the popup just shows again next visit
  }
}

export function StatsFeedback({ shortCode }: { shortCode: string }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    rememberDismissed();
    setVisible(false);
  }

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(close, THANKS_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const turnstileToken = await getTurnstileToken(
        TURNSTILE_SITE_KEY,
        "feedback",
      );

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, shortCode, turnstileToken }),
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

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Send feedback"
      className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 rounded-[22px] bg-brand p-5 text-ink shadow-lg md:inset-x-auto md:right-6 md:bottom-6 md:w-[380px]"
    >
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute top-3 right-4 cursor-pointer text-2xl leading-none text-ink hover:opacity-70"
      >
        ×
      </button>
      {sent ? (
        <span className="pr-6 text-base font-semibold">
          Thanks, that helps.
        </span>
      ) : (
        <>
          <label
            htmlFor="stats-feedback"
            className="pr-6 font-display text-2xl leading-none uppercase"
          >
            What&apos;s missing from these stats?
          </label>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input
              id="stats-feedback"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="Optional, one line is plenty"
              className="min-h-[48px] rounded-full bg-surface px-5 text-sm text-text placeholder:text-text-faint focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="min-h-[48px] cursor-pointer rounded-full bg-ink px-6 text-base font-semibold text-brand hover:bg-ink-hover disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
          {error && <span className="text-sm font-medium">{error}</span>}
        </>
      )}
    </div>
  );
}
