import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { loanProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({
    loans: account.loans,
    loanApplications: account.loanApplications,
    loanProducts,
  });
}
