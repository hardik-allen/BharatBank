import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId, saveAccount } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const loan = account.loans.find((l) => l.id === id);
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

  const { amount } = await req.json();
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (value > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const payment = Math.min(value, loan.outstanding);
  account.balance -= payment;
  loan.outstanding -= payment;
  if (loan.outstanding <= 0) loan.status = "closed";

  account.transactions.push({
    id: nextId("t"),
    date: new Date().toISOString().slice(0, 10),
    description: `Loan prepayment — ${loan.productName}`,
    amount: -payment,
    channel: "Internal",
  });
  saveAccount(account);

  return NextResponse.json({ ok: true, balance: account.balance, loan });
}
