import { NextRequest, NextResponse } from "next/server";
import { findAccount } from "@/lib/db";
import { COOKIE_NAME, encodeSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const account = findAccount(username);
  if (!account || account.password !== password) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = encodeSession({ username: account.username, issuedAt: Date.now() });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
