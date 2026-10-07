import type { Metadata } from "next";
import { UploadForm } from "@/components/upload-form";

const title = "Upload a file | squish.to";
const description =
  "Upload a file or an HTML page and get a short, shareable link with a QR code. No account required.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/upload" },
  openGraph: { title, description, url: "/upload" },
};

export default function UploadPage() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <div className="flex flex-col gap-2.5 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8">
        <h1 className="m-0 font-display text-3xl uppercase md:text-5xl">
          Upload HTML or a file
        </h1>
        <p className="m-0 text-sm text-text-muted md:text-base">
          Get a short link and a QR code for any image, PDF, or HTML page -
          HTML renders right at your link. No account needed - links expire
          automatically after 30 days.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
