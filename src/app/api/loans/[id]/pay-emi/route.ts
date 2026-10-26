import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";
import { addMonths } from "@/lib/interest";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const loan = account.loans.find((l) => l.id === id);
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  if (loan.outstanding <= 0) return NextResponse.json({ error: "Loan is already closed" }, { status: 400 });

  const payment = Math.min(loan.emi, loan.outstanding);
  if (payment > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  account.balance -= payment;
  loan.outstanding -= payment;
  if (loan.outstanding <= 0) loan.status = "closed";
  loan.nextDueDate = addMonths(loan.nextDueDate, 1);
  account.transactions.push({
    id: nextId("t"),
    date: new Date().toISOString().slice(0, 10),
    description: `EMI payment — ${loan.productName}`,
    amount: -payment,
    channel: "Internal",
  });

  return NextResponse.json({ ok: true, balance: account.balance, loan });
}
