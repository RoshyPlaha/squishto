import type { Metadata } from "next";
import Link from "next/link";

const title = "API Docs | squish.to";
const description =
  "How to create squish.to short links programmatically: the endpoint, request and response shapes, rate limits, and error codes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/docs" },
  openGraph: { title, description, url: "/docs" },
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-page p-4 font-mono text-sm text-text">
      <code>{children}</code>
    </pre>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8">
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 font-display text-xl uppercase md:text-2xl">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <div className="flex flex-col gap-2.5 rounded-[22px] bg-surface p-5 md:rounded-[26px] md:p-8">
        <h1 className="m-0 font-display text-3xl uppercase md:text-5xl">
          API docs
        </h1>
        <p className="m-0 text-sm text-text-muted md:text-base">
          Create squish.to short links from a script, a build step, or
          anything else that isn&apos;t a browser. No account, no API key.
        </p>
      </div>

      <Card>
        <SectionHeading>Create a link</SectionHeading>
        <p className="m-0 text-base text-text-muted">
          <span className="font-mono text-text">POST</span>{" "}
          <span className="font-mono text-text">
            https://www.squish.to/api/v1/links
          </span>
        </p>
        <Code>{`curl -X POST https://www.squish.to/api/v1/links \\
  -H "Content-Type: application/json" \\
  -d '{"destinationUrl": "https://example.com/your-long-url"}'`}</Code>
        <Code>{`{
  "shortCode": "aB3dE9",
  "shortUrl": "https://squish.to/aB3dE9",
  "destinationUrl": "https://example.com/your-long-url",
  "createdAt": "2026-10-11T09:14:02.000Z"
}`}</Code>
      </Card>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2 md:gap-4">
        <Card>
          <SectionHeading>Request fields</SectionHeading>
          <table className="w-full text-left text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-3 font-mono text-text-dim">
                  destinationUrl
                </td>
                <td className="py-2 text-text-muted">
                  Required. The http(s) URL to shorten.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono text-text-dim">
                  customCode
                </td>
                <td className="py-2 text-text-muted">
                  Optional. Letters, numbers, hyphens, 3–30 characters. A
                  random code is generated if omitted.
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card>
          <SectionHeading>Response fields</SectionHeading>
          <table className="w-full text-left text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-3 font-mono text-text-dim">
                  shortCode
                </td>
                <td className="py-2 text-text-muted">The generated or chosen code.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-3 font-mono text-text-dim">shortUrl</td>
                <td className="py-2 text-text-muted">The full short link to share.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-3 font-mono text-text-dim">
                  destinationUrl
                </td>
                <td className="py-2 text-text-muted">Echoes the URL you sent.</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-mono text-text-dim">createdAt</td>
                <td className="py-2 text-text-muted">ISO 8601 timestamp.</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <SectionHeading>Limits</SectionHeading>
        <p className="m-0 text-base text-text-muted">
          <strong className="text-text">5 requests a minute</strong> and{" "}
          <strong className="text-text">100 a day</strong>, per IP address.
          Go over, and you&apos;ll get a <span className="font-mono">429</span>{" "}
          with a <span className="font-mono">Retry-After</span> header telling
          you how many seconds to wait.
        </p>
        <p className="m-0 text-base text-text-muted">
          There&apos;s no Cloudflare Turnstile check on this endpoint, unlike
          the web form - Turnstile needs a browser to solve a challenge in,
          which an API caller doesn&apos;t have. The rate limit is the gate
          instead.
        </p>
      </Card>

      <Card>
        <SectionHeading>Errors</SectionHeading>
        <table className="w-full text-left text-sm">
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-3 font-mono text-text-dim">400</td>
              <td className="py-2 text-text-muted">
                Invalid input, a reserved custom code, or a URL flagged as
                unsafe by Google Safe Browsing.
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3 font-mono text-text-dim">409</td>
              <td className="py-2 text-text-muted">
                That custom code is already taken.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-mono text-text-dim">429</td>
              <td className="py-2 text-text-muted">
                Rate limit exceeded - check <span className="font-mono">Retry-After</span>.
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionHeading>Analytics</SectionHeading>
        <p className="m-0 text-base text-text-muted">
          This API only creates links - it doesn&apos;t return clicks or
          stats. That stays on the dashboard: open{" "}
          <Link href="/stats" className="underline">
            squish.to/stats
          </Link>{" "}
          and enter your short code to see opens, referrers, and countries for
          any link, including ones created through the API.
        </p>
        <p className="m-0 text-base text-text-muted">
          Want a machine-readable spec instead of this page? See{" "}
          <Link href="/openapi.json" className="underline">
            squish.to/openapi.json
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
