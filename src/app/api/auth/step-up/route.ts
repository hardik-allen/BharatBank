import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

// Re-confirms the user's MPIN before a sensitive action (transfer, closing a deposit, etc.).
// This never grants a new session — it's a one-off check the client gates an action on.
export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { mpin } = await req.json();
  if (mpin !== account.mpin) {
    return NextResponse.json({ error: "Incorrect MPIN" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
