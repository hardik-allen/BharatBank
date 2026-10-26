// Simple in-memory login rate limiter — resets when the dev server restarts.
// Anchored to globalThis so it survives Next.js dev's per-route module recompilation
// (see the comment in lib/db.ts for why this matters).

type Attempt = { count: number; lockedUntil: number };
type GlobalStore = { bharatbankLoginAttempts?: Map<string, Attempt> };
const globalStore = globalThis as unknown as GlobalStore;
const attempts = globalStore.bharatbankLoginAttempts ?? (globalStore.bharatbankLoginAttempts = new Map());

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 1000;

export function isLocked(key: string): boolean {
  const entry = attempts.get(key);
  return !!entry && entry.lockedUntil > Date.now();
}

export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS;
    entry.count = 0;
  }
  attempts.set(key, entry);
}

export function resetAttempts(key: string): void {
  attempts.delete(key);
}
