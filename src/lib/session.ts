// Deliberately simple session token (base64 JSON, no signing) — fine for a demo app, never for a real one.

export type SessionPayload = {
  username: string;
  issuedAt: number;
};

const COOKIE_NAME = "dummybank_session";

export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
