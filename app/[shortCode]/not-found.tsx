import Link from "next/link";

export default function ShortCodeNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">This link doesn&apos;t exist</h1>
      <p className="text-gray-600">
        The short link you followed isn&apos;t in our system.
      </p>
      <Link
        href="/"
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Create your own short link
      </Link>
    </main>
  );
}
