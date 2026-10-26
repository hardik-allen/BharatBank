import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sorted = [...account.transactions].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json({ transactions: sorted });
}
