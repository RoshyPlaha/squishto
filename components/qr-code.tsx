"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, filename }: { value: string; filename: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: 240 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        // best-effort; the card below just stays empty if generation fails
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[20px] bg-page">
        <span className="font-mono text-[11px] text-text-faint uppercase">
          Generating...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={dataUrl}
        alt={`QR code for ${value}`}
        className="aspect-square w-full rounded-[20px] bg-white p-3"
      />
      <a
        href={dataUrl}
        download={`${filename}-qr.png`}
        className="font-mono text-[11px] tracking-wide text-text-dim uppercase underline"
      >
        Download QR
      </a>
    </div>
  );
}
