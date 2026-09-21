"use server";

import { redirect } from "next/navigation";
import { deleteLink } from "@/lib/db/queries";

export async function deleteLinkAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (id) {
    await deleteLink(id);
  }

  redirect(redirectTo);
}
