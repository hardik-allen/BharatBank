import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId, saveAccount } from "@/lib/db";
import { addMonths, calcRDMaturity } from "@/lib/interest";

const RD_RATE_PERCENT = 6.9;

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({ recurringDeposits: account.recurringDeposits, rate: RD_RATE_PERCENT });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { monthlyInstallment, tenureMonths } = await req.json();
  const installment = Number(monthlyInstallment);
  const months = Number(tenureMonths);

  if (!Number.isFinite(installment) || installment < 500) {
    return NextResponse.json({ error: "Minimum monthly installment is ₹500" }, { status: 400 });
  }
  if (!Number.isFinite(months) || months < 6 || months > 120) {
    return NextResponse.json({ error: "Tenure must be between 6 and 120 months" }, { status: 400 });
  }
  if (installment > account.balance) {
    return NextResponse.json({ error: "Insufficient balance for the first installment" }, { status: 400 });
  }

  const startDate = new Date().toISOString().slice(0, 10);
  account.balance -= installment;
  account.recurringDeposits.push({
    id: nextId("rd"),
    monthlyInstallment: installment,
    annualRate: RD_RATE_PERCENT,
    tenureMonths: months,
    startDate,
    maturityDate: addMonths(startDate, months),
    maturityAmount: calcRDMaturity(installment, RD_RATE_PERCENT, months),
    installmentsPaid: 1,
    missedInstallments: 0,
    status: "active",
  });
  account.transactions.push({
    id: nextId("t"),
    date: startDate,
    description: "Recurring Deposit opened (1st installment)",
    amount: -installment,
    channel: "Internal",
  });
  saveAccount(account);

  return NextResponse.json({ ok: true, balance: account.balance, recurringDeposits: account.recurringDeposits });
}
