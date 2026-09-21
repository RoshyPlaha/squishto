"use client";

import { deleteLinkAction } from "@/lib/admin-actions";

export function DeleteLinkForm({
  id,
  redirectTo,
}: {
  id: number;
  redirectTo: string;
}) {
  return (
    <form
      action={deleteLinkAction}
      onSubmit={(e) => {
        if (!confirm("Delete this link? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        className="cursor-pointer text-red-400 underline"
      >
        Delete
      </button>
    </form>
  );
}
