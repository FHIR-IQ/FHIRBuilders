import { createHmac } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

// Generate a shareable token for an app (7-day expiry)
export function generateShareToken(appId: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${appId}:${expiresAt}`;
  const signature = createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  // URL-safe base64 encoding of payload + signature
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");
  return token;
}

// Verify a share token. Returns the appId if valid, null otherwise.
export function verifyShareToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [appId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiry
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

    // Verify signature
    const payload = `${appId}:${expiresAtStr}`;
    const expectedSig = createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex")
      .slice(0, 16);

    if (signature !== expectedSig) return null;

    return appId;
  } catch {
    return null;
  }
}
