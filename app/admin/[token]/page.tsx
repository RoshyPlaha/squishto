import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllLinks } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { token } = await params;
  if (token !== process.env.ADMIN_URL_TOKEN) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { links, totalCount, totalPages } = await getAllLinks(page);

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold text-text">
        All links ({totalCount})
      </h1>

      <div className="overflow-x-auto rounded-[22px] bg-surface">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-text-dim">
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Short code
              </th>
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Destination
              </th>
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Country
              </th>
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Created
              </th>
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Clicks
              </th>
              <th className="p-4 font-mono text-xs tracking-wide uppercase">
                Custom
              </th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-border">
                <td className="p-4 text-text">
                  <Link
                    href={`/stats?code=${link.shortCode}`}
                    className="underline"
                  >
                    {link.shortCode}
                  </Link>
                </td>
                <td className="max-w-[320px] truncate p-4 text-text-muted">
                  {link.destinationUrl}
                </td>
                <td className="p-4 text-text-muted">
                  {link.creatorCountry ?? "—"}
                </td>
                <td className="p-4 whitespace-nowrap text-text-muted">
                  {formatDate(link.createdAt)}
                </td>
                <td className="p-4 text-text-muted">{link.clickCount}</td>
                <td className="p-4 text-text-muted">
                  {link.isCustom ? "Yes" : "No"}
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-text-dim">
                  No links yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-sm text-text-dim">
        {page > 1 && (
          <Link href={`?page=${page - 1}`} className="underline">
            Previous
          </Link>
        )}
        <span>
          Page {page} of {totalPages}
        </span>
        {page < totalPages && (
          <Link href={`?page=${page + 1}`} className="underline">
            Next
          </Link>
        )}
      </div>
    </main>
  );
}
