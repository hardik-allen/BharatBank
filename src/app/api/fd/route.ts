import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";
import { addMonths, calcFDMaturity } from "@/lib/interest";

const FD_RATE_PERCENT = 7.1;

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({ fixedDeposits: account.fixedDeposits, rate: FD_RATE_PERCENT });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { principal, tenureMonths, payoutFrequency, nomineeName } = await req.json();
  const amount = Number(principal);
  const months = Number(tenureMonths);

  if (!Number.isFinite(amount) || amount < 1000) {
    return NextResponse.json({ error: "Minimum FD amount is ₹1,000" }, { status: 400 });
  }
  if (!Number.isFinite(months) || months < 3 || months > 120) {
    return NextResponse.json({ error: "Tenure must be between 3 and 120 months" }, { status: 400 });
  }
  if (amount > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const startDate = new Date().toISOString().slice(0, 10);
  account.balance -= amount;
  account.fixedDeposits.push({
    id: nextId("fd"),
    principal: amount,
    annualRate: FD_RATE_PERCENT,
    tenureMonths: months,
    startDate,
    maturityDate: addMonths(startDate, months),
    maturityAmount: calcFDMaturity(amount, FD_RATE_PERCENT, months),
    payoutFrequency: payoutFrequency || "At maturity",
    nomineeName: nomineeName || "",
    status: "active",
  });
  account.transactions.push({
    id: nextId("t"),
    date: startDate,
    description: `Fixed Deposit opened`,
    amount: -amount,
    channel: "Internal",
  });

  return NextResponse.json({ ok: true, balance: account.balance, fixedDeposits: account.fixedDeposits });
}
