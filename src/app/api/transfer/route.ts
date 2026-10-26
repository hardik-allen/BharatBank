import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";

const METHODS = {
  UPI: { fee: 0, eta: "Instant", minAmount: 1 },
  IMPS: { fee: 5, eta: "Instant", minAmount: 1 },
  NEFT: { fee: 2.5, eta: "Within 2 hours", minAmount: 1 },
  RTGS: { fee: 25, eta: "Within 30 minutes", minAmount: 200000 },
} as const;

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { beneficiaryId, payeeName, amount, method, remarks } = await req.json();
  const value = Number(amount);
  const methodConfig = METHODS[method as keyof typeof METHODS];

  if (!methodConfig) return NextResponse.json({ error: "Invalid transfer method" }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (value < methodConfig.minAmount) {
    return NextResponse.json({ error: `${method} requires a minimum of ₹${methodConfig.minAmount.toLocaleString("en-IN")}` }, { status: 400 });
  }

  let name = payeeName;
  if (beneficiaryId) {
    const ben = account.beneficiaries.find((b) => b.id === beneficiaryId);
    if (!ben) return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 });
    if (new Date(ben.activatesAt) > new Date()) {
      return NextResponse.json({ error: "This beneficiary is still in the activation cooling period" }, { status: 400 });
    }
    name = ben.nickname || ben.name;
  }
  if (!name) return NextResponse.json({ error: "Select or enter a payee" }, { status: 400 });

  const total = value + methodConfig.fee;
  if (total > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  account.balance -= total;
  const txId = nextId("t");
  account.transactions.push({
    id: txId,
    date: new Date().toISOString().slice(0, 10),
    description: `${method} transfer to ${name}${remarks ? ` (${remarks})` : ""}`,
    amount: -value,
    channel: method,
  });
  if (methodConfig.fee > 0) {
    account.transactions.push({
      id: nextId("t"),
      date: new Date().toISOString().slice(0, 10),
      description: `${method} transfer fee`,
      amount: -methodConfig.fee,
      channel: method,
    });
  }

  return NextResponse.json({
    ok: true,
    balance: account.balance,
    receipt: { id: txId, method, payee: name, amount: value, fee: methodConfig.fee, eta: methodConfig.eta, date: new Date().toISOString() },
  });
}
