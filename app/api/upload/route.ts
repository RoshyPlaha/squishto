import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getLinkById, finalizeFileLink } from "@/lib/db/queries";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_CONTENT_TYPES,
  FILE_EXPIRY_DAYS,
} from "@/lib/upload-config";
import { PENDING_UPLOAD_DESTINATION } from "@/lib/blob";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayloadRaw) => {
        const { linkId } = JSON.parse(clientPayloadRaw ?? "{}") as {
          linkId?: number;
        };

        if (typeof linkId !== "number") {
          throw new Error("Missing reservation — upload a file via the form, not directly.");
        }

        // The reservation (and its Turnstile bot-check) happened in
        // /api/upload/reserve; this just confirms it's real and unused,
        // rather than re-running the check.
        const reserved = await getLinkById(linkId);
        if (!reserved || reserved.destinationUrl !== PENDING_UPLOAD_DESTINATION) {
          throw new Error("Invalid or already-used reservation.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ linkId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { linkId } = JSON.parse(tokenPayload ?? "{}") as { linkId: number };
        const expiresAt = new Date();
        expiresAt.setUTCDate(expiresAt.getUTCDate() + FILE_EXPIRY_DAYS);

        await finalizeFileLink({
          id: linkId,
          blobUrl: blob.url,
          expiresAt,
          contentType: blob.contentType,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
