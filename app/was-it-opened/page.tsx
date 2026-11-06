import type { Metadata } from "next";
import Link from "next/link";
import { StatsPreview } from "@/components/stats-preview";
import { SITE_URL } from "@/lib/site";

const title = "Was it opened? See when a proposal or sales doc is read | squish.to";
const description =
  "Upload a proposal, quote, one-pager or deck, send the link, and see when it is opened. No signup for the reader, no tracking pixel, no CRM.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/was-it-opened" },
  openGraph: { title, description, url: "/was-it-opened" },
};

const STEPS = [
  {
    n: "01",
    title: "Upload the file",
    body: "A PDF, an HTML page or an image, up to 10MB. No account needed.",
  },
  {
    n: "02",
    title: "Send the link",
    body: "Pick a readable ending, then paste it into your email, chat or calendar invite. Use one upload per recipient.",
  },
  {
    n: "03",
    title: "Read the stats",
    body: "Open the stats page for the link and follow up when it makes sense.",
  },
];

const DOCS = [
  { label: "Proposals", href: "/blog/send-pdf-proposal-as-link-see-when-opened" },
  { label: "Quotes and estimates", href: "/blog/how-to-know-if-client-opened-your-quote-or-estimate" },
  { label: "PDF attachments", href: "/blog/how-to-know-if-someone-opened-your-pdf-attachment" },
  { label: "One link per recipient", href: "/blog/one-link-per-recipient-track-who-opened-your-proposal" },
  { label: "Sales one-pagers", href: "/blog/host-ai-generated-html-track-views" },
  { label: "Battlecards", href: "/blog/send-ai-generated-sales-battlecard-as-a-link" },
  { label: "Pitch decks", href: "/blog/share-ai-generated-pitch-deck-as-a-link" },
];

const LIMITS = [
  "Stats are per link, not per person. Upload once per recipient if you want to know who opened what.",
  "Link previews and email scanners can add opens that no human made, so read a single early open with a pinch of salt.",
  "Files can be up to 10MB.",
  "Uploaded files expire after 30 days, so re-upload for a long sales cycle.",
];

const FAQ = [
  {
    question: "How do I know if someone opened my proposal?",
    answer:
      "Upload the proposal to squish.to, send the short link instead of an attachment, and check the link's stats page. It shows total opens, opens in the last 7 days, the busiest day, a 14-day chart and recent opens with their source and country.",
  },
  {
    question: "Does the person I send it to need an account?",
    answer:
      "No. They just open the link. You do not need an account either to upload and get a stats page.",
  },
  {
    question: "Does this use a tracking pixel?",
    answer:
      "No. Opens are counted when the link is opened, so there is no hidden image in an email and nothing for a mail client to block.",
  },
  {
    question: "Can I see which person opened it?",
    answer:
      "Stats are per link, not per person. To tell recipients apart, upload the file once per recipient and send each person their own link.",
  },
  {
    question: "Are the opens always from a real person?",
    answer:
      "Not always. Link previews and email security scanners can open a link before the reader does, so an open right after sending may not be human. Several opens spread over days is a stronger sign.",
  },
  {
    question: "What file types and sizes work?",
    answer:
      "PDF, HTML and images (JPEG, PNG, WebP and GIF), up to 10MB each. Uploaded files expire after 30 days.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  url: `${SITE_URL}/was-it-opened`,
  mainEntity: FAQ.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function WasItOpened() {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-[10px] px-[10px] pb-[10px] md:gap-4 md:px-4 md:pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="overflow-hidden rounded-[22px] bg-brand p-[26px_20px] text-ink md:rounded-[26px] md:p-[36px_40px]">
        <h1 className="m-0 font-display text-5xl leading-[0.9] uppercase md:text-[96px]">
          Was it opened?
        </h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed md:text-xl">
          Upload your proposal, quote, one-pager or deck, send the link, and
          see when it is opened. No signup for the reader, no tracking pixel
          and no CRM. You get a simple way to know when to follow up.
        </p>
        <Link
          href="/upload"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
        >
          Upload a file
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3 md:gap-4">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="flex flex-col gap-2.5 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]"
          >
            <span className="font-display text-3xl leading-none text-accent md:text-[44px]">
              {step.n}
            </span>
            <span className="text-lg font-bold tracking-tight md:text-xl">{step.title}</span>
            <span className="text-sm leading-relaxed text-text-dim md:text-[15px]">{step.body}</span>
          </div>
        ))}
      </div>

      <StatsPreview />

      <section className="flex flex-col gap-4 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]">
        <h2 className="m-0 font-display text-3xl leading-none uppercase md:text-[40px]">
          Good for what you send
        </h2>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {DOCS.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="inline-block rounded-full border border-border-input bg-page px-4 py-2 text-sm"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]">
        <h2 className="m-0 font-display text-3xl leading-none uppercase md:text-[40px]">
          Good to know
        </h2>
        <p className="m-0 text-sm leading-relaxed text-text-dim md:text-base">
          An open tells you a link was visited, which is a useful nudge about
          timing. It is not a promise that someone read every page.
        </p>
        <ul className="m-0 flex flex-col gap-2 pl-5 text-sm leading-relaxed text-text-dim md:text-base">
          {LIMITS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-5 rounded-[22px] bg-surface p-[20px] md:rounded-[26px] md:p-[30px]">
        <h2 className="m-0 font-display text-3xl leading-none uppercase md:text-[40px]">FAQ</h2>
        {FAQ.map((f) => (
          <div key={f.question} className="flex flex-col gap-1.5">
            <h3 className="m-0 text-base font-bold md:text-lg">{f.question}</h3>
            <p className="m-0 text-sm leading-relaxed text-text-dim md:text-base">{f.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
