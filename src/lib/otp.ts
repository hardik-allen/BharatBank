// Mock OTP store. No real SMS is sent — the OTP is returned directly in the API
// response so the demo app can display it on screen. Never do this in a real bank.
//
// Anchored to globalThis so it survives Next.js dev's per-route module recompilation
// (see the comment in lib/db.ts for why this matters).

type OtpEntry = { code: string; expiresAt: number };
type GlobalStore = { bharatbankOtps?: Map<string, OtpEntry> };
const globalStore = globalThis as unknown as GlobalStore;
const otpStore = globalStore.bharatbankOtps ?? (globalStore.bharatbankOtps = new Map());

const OTP_TTL_MS = 5 * 60 * 1000;

export function generateOtp(mobile: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(mobile, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

export function verifyOtp(mobile: string, code: string): boolean {
  const entry = otpStore.get(mobile);
  if (!entry) return false;
  const valid = entry.code === code && Date.now() < entry.expiresAt;
  if (valid) otpStore.delete(mobile);
  return valid;
}
