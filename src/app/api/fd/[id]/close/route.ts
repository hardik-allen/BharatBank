import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId, saveAccount } from "@/lib/db";

const PREMATURE_PENALTY_RATE = 0.01; // 1% penalty on principal for closing before maturity

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const fd = account.fixedDeposits.find((f) => f.id === id);
  if (!fd) return NextResponse.json({ error: "Fixed deposit not found" }, { status: 404 });
  if (fd.status === "closed") {
    return NextResponse.json({ error: "Fixed deposit already closed" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isPremature = today < fd.maturityDate;
  const penalty = isPremature ? fd.principal * PREMATURE_PENALTY_RATE : 0;
  const payout = fd.maturityAmount - penalty;

  fd.status = "closed";
  account.balance += payout;
  account.transactions.push({
    id: nextId("t"),
    date: today,
    description: isPremature ? "Fixed Deposit closed (premature)" : "Fixed Deposit matured",
    amount: payout,
  });
  saveAccount(account);

  return NextResponse.json({ ok: true, balance: account.balance, payout, penalty });
}
