// Very light persistence layer: Node's built-in node:sqlite (no external dependency).
// Each account is stored as a single JSON blob keyed by username — this keeps every
// existing route's in-memory object-mutation code working unchanged; only a
// `persistAccount(account)` call after a mutation is needed to make it durable.

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import type { Account } from "./db";

// Vercel (and most serverless hosts) ship a read-only filesystem for the deployed
// app — only /tmp is writable, and even that is wiped on cold start and isn't shared
// across instances. So on Vercel this becomes "persists for the life of one warm
// instance" rather than real durable storage. For real persistence in production,
// swap this file for a hosted database (Vercel Postgres/Neon, Turso, Supabase, etc.).
const dataDir = process.env.VERCEL ? "/tmp/data" : path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "bharatbank.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    username TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  );
`);

export function loadAllAccounts(): Record<string, Account> {
  const rows = db.prepare("SELECT username, data FROM accounts").all() as { username: string; data: string }[];
  const result: Record<string, Account> = {};
  for (const row of rows) {
    result[row.username] = JSON.parse(row.data);
  }
  return result;
}

export function persistAccount(account: Account): void {
  db.prepare("INSERT INTO accounts (username, data) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data").run(
    account.username,
    JSON.stringify(account)
  );
}

export function loadIdCounter(): number {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'idCounter'").get() as { value: number } | undefined;
  return row?.value ?? 100;
}

export function persistIdCounter(value: number): void {
  db.prepare("INSERT INTO meta (key, value) VALUES ('idCounter', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(value);
}

export function hasAnyAccounts(): boolean {
  const row = db.prepare("SELECT COUNT(*) AS c FROM accounts").get() as { c: number };
  return row.c > 0;
}
