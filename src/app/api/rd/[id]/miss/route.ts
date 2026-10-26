import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { saveAccount } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const rd = account.recurringDeposits.find((r) => r.id === id);
  if (!rd) return NextResponse.json({ error: "Recurring deposit not found" }, { status: 404 });

  rd.missedInstallments += 1;
  saveAccount(account);
  return NextResponse.json({ ok: true, recurringDeposit: rd });
}
