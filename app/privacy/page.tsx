export const metadata = {
  title: "Privacy Policy | squish.to",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-gray-600">
        squish.to does not require an account to create short links. We store
        the destination URL, the short code, a hashed (not raw) form of the
        creating IP address for abuse prevention, and basic click metadata
        (timestamp, referrer, user agent) for the link&apos;s public stats
        page.
      </p>
    </main>
  );
}
