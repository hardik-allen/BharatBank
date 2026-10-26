import { NextRequest, NextResponse } from "next/server";
import { billers } from "@/lib/db";
import { getSessionAccount } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  const billPayments = account ? [...account.billPayments].sort((a, b) => b.date.localeCompare(a.date)) : [];
  return NextResponse.json({ billers, billPayments });
}
