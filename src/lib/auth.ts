import { NextRequest } from "next/server";
import { Account, findAccount } from "./db";
import { COOKIE_NAME, decodeSession } from "./session";

export function getSessionAccount(req: NextRequest): Account | null {
  const session = decodeSession(req.cookies.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return findAccount(session.username) ?? null;
}
