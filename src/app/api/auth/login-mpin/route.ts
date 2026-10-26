import { NextRequest, NextResponse } from "next/server";
import { findAccountByMobile } from "@/lib/db";
import { isLocked, recordFailedAttempt, resetAttempts } from "@/lib/rateLimit";
import { COOKIE_NAME, encodeSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { mobile, mpin } = await req.json();
  if (!mobile || !mpin) {
    return NextResponse.json({ error: "Mobile number and MPIN are required" }, { status: 400 });
  }

  if (isLocked(mobile)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in a couple of minutes." },
      { status: 429 }
    );
  }

  const account = findAccountByMobile(mobile);
  if (!account || account.mpin !== mpin) {
    recordFailedAttempt(mobile);
    return NextResponse.json({ error: "Invalid mobile number or MPIN" }, { status: 401 });
  }

  resetAttempts(mobile);
  const token = encodeSession({ username: account.username, issuedAt: Date.now() });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  return res;
}
