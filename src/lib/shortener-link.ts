import { customAlphabet } from "nanoid";

const generate = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  8,
);

export function encodeLink(): string {
  return generate();
}
