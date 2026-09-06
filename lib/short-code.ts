import { customAlphabet } from "nanoid";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH = 6;

const generateId = customAlphabet(ALPHABET, DEFAULT_LENGTH);

export function generateShortCode(): string {
  return generateId();
}
