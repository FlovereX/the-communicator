interface PasswordSetupMarkerPayload {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

/** Web Crypto only (not node:crypto) — this must run in proxy.ts's Edge runtime as well as Node Server Actions. */
async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.PASSWORD_SETUP_COOKIE_SECRET;
  if (!secret) {
    // Fail closed: never sign or verify a marker without a real server-only secret configured.
    throw new Error("PASSWORD_SETUP_COOKIE_SECRET is not set");
  }
  return crypto.subtle.importKey(
    "raw",
    encodeUtf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Always backed by a plain ArrayBuffer (never SharedArrayBuffer), matching what crypto.subtle's BufferSource requires. */
function encodeUtf8(text: string): Uint8Array<ArrayBuffer> {
  const source = new TextEncoder().encode(text);
  const bytes = new Uint8Array(source.length);
  bytes.set(source);
  return bytes;
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  // Built via a plain `new Uint8Array(length)` (not `Uint8Array.from`) so it's always backed
  // by a real ArrayBuffer, matching the stricter `BufferSource` type crypto.subtle expects.
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Signs a fresh-sign-in marker binding /set-password access to this user for ~15 minutes. */
export async function createPasswordSetupMarker(userId: string): Promise<string> {
  const issuedAt = Date.now();
  const payload: PasswordSetupMarkerPayload = {
    userId,
    issuedAt,
    expiresAt: issuedAt + 15 * 60 * 1000,
  };

  const payloadPart = base64UrlEncode(encodeUtf8(JSON.stringify(payload)));
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encodeUtf8(payloadPart));
  const signaturePart = base64UrlEncode(signature);

  return `${payloadPart}.${signaturePart}`;
}

/** Verifies signature, expiration, and user binding. Never throws — any malformed/invalid token returns false. */
export async function verifyPasswordSetupMarker(
  token: string | undefined,
  expectedUserId: string
): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadPart, signaturePart] = parts;
  if (!payloadPart || !signaturePart) return false;

  let signatureBytes: Uint8Array<ArrayBuffer>;
  try {
    signatureBytes = base64UrlDecode(signaturePart);
  } catch {
    return false;
  }

  let key: CryptoKey;
  try {
    key = await getHmacKey();
  } catch {
    return false;
  }

  const isSignatureValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encodeUtf8(payloadPart)
  );
  if (!isSignatureValid) return false;

  let payload: PasswordSetupMarkerPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart)));
  } catch {
    return false;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.userId !== "string" ||
    typeof payload.expiresAt !== "number"
  ) {
    return false;
  }

  if (payload.userId !== expectedUserId) return false;
  if (Date.now() > payload.expiresAt) return false;

  return true;
}
