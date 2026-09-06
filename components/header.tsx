import Link from "next/link";

export function Header() {
  return (
    <header className="flex gap-4 border-b p-4 text-sm">
      <Link href="/" className="font-semibold">
        squish.to
      </Link>
      <nav className="flex gap-4">
        <Link href="/" className="underline">
          Home
        </Link>
        <Link href="/stats" className="underline">
          Stats
        </Link>
        <Link href="/blog" className="underline">
          Blog
        </Link>
      </nav>
    </header>
  );
}
