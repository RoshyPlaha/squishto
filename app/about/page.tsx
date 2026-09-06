export const metadata = { title: "About | squish.to" };

export default function About() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">About squish.to</h1>
      <p className="mt-4 text-gray-600">
        squish.to is a free URL shortener focused on making your links as
        small as possible, with support for custom endpoints.
      </p>
    </main>
  );
}
