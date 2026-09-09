export const metadata = {
  title: "Privacy Policy | squish.to",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-gray-600">
        squish.to does not require an account to create short links. When you
        create a link, we store the destination URL, the short code, and a
        hashed (not raw) form of the creating IP address for abuse
        prevention. When someone opens a short link, we store click metadata
        (timestamp, referrer, user agent, and a coarse country code derived
        from the request&apos;s geolocation header — not the raw IP) for the
        link&apos;s public stats page.
      </p>
      <p className="mt-4 text-gray-600">
        squish.to uses Google Analytics to understand site traffic. Google
        Analytics may set cookies in your browser and receive data about your
        visit as described in{" "}
        <a
          href="https://policies.google.com/privacy"
          className="underline"
        >
          Google&apos;s privacy policy
        </a>
        .
      </p>
    </main>
  );
}
