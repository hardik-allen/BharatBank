import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { Account, nextId } from "@/lib/db";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sorted = [...account.upiPayments].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json({ upiId: account.upiId, upiPayments: sorted });
}

function settle(account: Account, paymentId: string) {
  const payment = account.upiPayments.find((p) => p.id === paymentId);
  if (!payment || payment.status !== "pending") return;
  payment.status = "success";
  account.balance -= payment.amount;
  account.transactions.push({
    id: nextId("t"),
    date: new Date().toISOString().slice(0, 10),
    description: `UPI payment to ${payment.payeeVpaOrMobile}`,
    amount: -payment.amount,
    channel: "UPI",
  });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { payeeVpaOrMobile, amount, note, simulate } = await req.json();
  const value = Number(amount);
  if (!payeeVpaOrMobile) return NextResponse.json({ error: "Enter a UPI ID or mobile number" }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const outcome: "success" | "pending" | "failed" = ["success", "pending", "failed"].includes(simulate)
    ? simulate
    : "success";

  if (outcome !== "failed" && value > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const id = nextId("upi");
  const payment = {
    id,
    date: new Date().toISOString().slice(0, 10),
    payeeVpaOrMobile,
    amount: value,
    note: note || "",
    status: outcome === "success" ? ("success" as const) : outcome === "failed" ? ("failed" as const) : ("pending" as const),
  };
  account.upiPayments.push(payment);

  if (outcome === "success") {
    account.balance -= value;
    account.transactions.push({
      id: nextId("t"),
      date: payment.date,
      description: `UPI payment to ${payeeVpaOrMobile}`,
      amount: -value,
      channel: "UPI",
    });
  } else if (outcome === "pending") {
    setTimeout(() => settle(account, id), 4000);
  }

  return NextResponse.json({ ok: true, payment, balance: account.balance });
}
