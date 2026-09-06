import { z } from "zod";

export const customCodeSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and hyphens are allowed");

export const createLinkSchema = z.object({
  destinationUrl: z
    .string()
    .url()
    .refine((value) => {
      try {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:";
      } catch {
        return false;
      }
    }, "Only http(s) URLs are allowed"),
  customCode: customCodeSchema.optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
