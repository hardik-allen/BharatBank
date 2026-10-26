import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId, saveAccount } from "@/lib/db";

const PREMATURE_PENALTY_RATE = 0.01;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const rd = account.recurringDeposits.find((r) => r.id === id);
  if (!rd) return NextResponse.json({ error: "Recurring deposit not found" }, { status: 404 });
  if (rd.status === "closed") {
    return NextResponse.json({ error: "Recurring deposit already closed" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isPremature = today < rd.maturityDate;
  const paidSoFar = rd.monthlyInstallment * rd.installmentsPaid;
  const payout = isPremature ? paidSoFar * (1 - PREMATURE_PENALTY_RATE) : rd.maturityAmount;

  rd.status = "closed";
  account.balance += payout;
  account.transactions.push({
    id: nextId("t"),
    date: today,
    description: isPremature ? "Recurring Deposit closed (premature)" : "Recurring Deposit matured",
    amount: payout,
  });
  saveAccount(account);

  return NextResponse.json({ ok: true, balance: account.balance, payout });
}
