"use client";

import { useRef, useState, FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { QrCode } from "@/components/qr-code";
import { Toast } from "@/components/toast";
import { MAX_FILE_SIZE_BYTES, ALLOWED_CONTENT_TYPES, FILE_EXPIRY_DAYS } from "@/lib/upload-config";

type Result = { shortCode: string; fileName: string };

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyToClipboard(link: string) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        throw new Error("no clipboard API");
      }
    } catch {
      const input = document.createElement("textarea");
      input.value = link;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand("copy");
      } catch {
        // best-effort fallback
      }
      document.body.removeChild(input);
    }
    setCopied(true);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1600);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose a file first");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large — max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
      return;
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      setError("That file type isn't supported — images, PDF, or HTML only");
      return;
    }

    setLoading(true);

    try {
      const reserveRes = await fetch("/api/upload/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCode: customCode || undefined }),
      });
      const reserveData = await reserveRes.json();

      if (!reserveRes.ok) {
        setError(reserveData.error ?? "Something went wrong");
        return;
      }

      const { linkId, shortCode } = reserveData as { linkId: number; shortCode: string };

      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ linkId }),
      });

      setResult({ shortCode, fileName: file.name });
      await copyToClipboard(`https://squish.to/${shortCode}`);
    } catch {
      setError("Upload failed, please try again");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setFile(null);
    setCustomCode("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (result) {
    const shortLink = `squish.to/${result.shortCode}`;
    return (
      <>
        <div className="flex flex-col gap-4 overflow-hidden rounded-[22px] bg-lime p-[26px_20px] text-ink md:rounded-[26px] md:p-10">
          <span className="font-mono text-xs tracking-wide uppercase">
            {result.fileName} &middot; expires in {FILE_EXPIRY_DAYS} days
          </span>
          <div className="font-display text-4xl leading-[0.9] break-words uppercase md:text-[100px] md:leading-[0.86]">
            {shortLink}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => copyToClipboard(`https://squish.to/${result.shortCode}`)}
              className="min-h-[52px] cursor-pointer rounded-full bg-ink px-[30px] py-4 text-base font-semibold text-lime hover:bg-surface-2"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[10px] md:grid-cols-[1fr_auto] md:gap-4">
          <div className="flex flex-col justify-center gap-2.5 rounded-[22px] bg-surface p-[22px] md:rounded-[26px] md:p-7">
            <span className="text-base text-text-muted">Need another?</span>
            <button
              type="button"
              onClick={reset}
              className="w-fit cursor-pointer rounded-full bg-lime px-5 py-3 text-center font-display text-lg text-ink uppercase hover:bg-lime-hover"
            >
              Upload another
            </button>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[22px] bg-surface p-[22px] md:w-[160px] md:rounded-[26px] md:p-5">
            <span className="font-mono text-[11px] tracking-wide text-text-dim uppercase">
              QR code
            </span>
            <QrCode
              value={`https://squish.to/${result.shortCode}`}
              filename={result.shortCode}
            />
          </div>
        </div>
        <Toast show={copied} message="Copied squish.to link to clipboard" />
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8"
      >
        <input
          ref={fileInputRef}
          type="file"
          required
          accept={[...ALLOWED_CONTENT_TYPES, ".html"].join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-border-input bg-page px-[22px] py-5 text-base text-text file:mr-4 file:rounded-full file:border-0 file:bg-lime file:px-4 file:py-2 file:font-semibold file:text-ink"
        />
        <div className="flex items-center gap-2.5 rounded-2xl border border-border-input bg-page px-[22px]">
          <span className="text-base text-text-faint md:text-lg">squish.to/</span>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-file"
            className="min-w-0 flex-1 bg-transparent py-5 text-base text-text placeholder:text-text-faint focus:outline-none md:text-lg"
          />
          <span className="font-mono text-[11px] tracking-wide text-text-faint uppercase">
            Optional
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="min-h-[56px] cursor-pointer rounded-full bg-lime py-4 font-display text-2xl tracking-wide text-ink uppercase hover:bg-lime-hover disabled:opacity-50 md:min-h-[60px] md:text-[26px]"
        >
          {loading ? "Uploading..." : "Upload it"}
        </button>
        {error && <p className="text-red-400">{error}</p>}
        <p className="m-0 text-xs text-text-faint">
          Images, PDF, or a single HTML file, up to {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.
          HTML pages render at your link, but scripts are blocked and relative
          file paths won&apos;t resolve — keep it self-contained. Links expire
          after {FILE_EXPIRY_DAYS} days.
        </p>
      </form>
    </>
  );
}
