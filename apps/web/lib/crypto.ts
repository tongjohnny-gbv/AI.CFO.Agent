import crypto from "crypto";

const key = (process.env.ENCRYPTION_KEY || "01234567890123456789012345678901").slice(0, 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  return `${iv.toString("hex")}:${cipher.update(text, "utf8", "hex") + cipher.final("hex")}`;
}
