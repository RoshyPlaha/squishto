export type FaqItem = { question: string; answer: string };

const FAQ_HEADING = /^##\s+(FAQ|Quick answers)\s*$/im;

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Posts end with a "## FAQ" or "## Quick answers" section where each entry is
// a block that starts with a bolded question: `**Question?** answer` or
// `**Question?**` followed by the answer on the next line.
export function extractFaq(raw: string): FaqItem[] {
  const heading = FAQ_HEADING.exec(raw);
  if (!heading) return [];

  const afterHeading = raw.slice(heading.index + heading[0].length);
  const nextHeading = afterHeading.search(/^##\s/m);
  const section = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);

  const items: FaqItem[] = [];
  for (const block of section.split(/\n\s*\n/)) {
    const match = /^\s*\*\*(.+?\?)\*\*\s*([\s\S]*)$/.exec(block);
    if (!match) continue;
    const answer = stripMarkdown(match[2]);
    if (answer) items.push({ question: stripMarkdown(match[1]), answer });
  }
  return items;
}
