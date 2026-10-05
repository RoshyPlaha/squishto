export const metadata = {
  title: "Terms of Service | squish.to",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-gray-600">
        squish.to is provided free of charge, as-is. Do not use squish.to to
        create links to malicious, illegal, or abusive content. Links found to
        violate this may be removed without notice.
      </p>
      <p className="mt-4 text-gray-600">
        The same applies to file uploads: do not upload malicious, illegal,
        infringing, or abusive files. Uploaded files found to violate this
        may be removed without notice, and uploading is subject to the same
        reservation that squish.to is provided as-is, with no guarantee of
        availability.
      </p>
    </main>
  );
}
