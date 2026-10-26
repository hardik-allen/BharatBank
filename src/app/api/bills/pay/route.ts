import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { billers, nextId, saveAccount } from "@/lib/db";

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { billerId, consumerNumber, amount, scheduledFor, autopay } = await req.json();
  const biller = billers.find((b) => b.id === billerId);
  const value = Number(amount);

  if (!biller) return NextResponse.json({ error: "Unknown biller" }, { status: 400 });
  if (!consumerNumber) return NextResponse.json({ error: "Consumer/account number is required" }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const isFuture = scheduledFor && scheduledFor > new Date().toISOString().slice(0, 10);
  if (!isFuture && value > account.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const record = {
    id: nextId("bp"),
    billerId,
    billerName: biller.name,
    consumerNumber,
    amount: value,
    date: new Date().toISOString().slice(0, 10),
    scheduledFor: isFuture ? scheduledFor : null,
    autopay: !!autopay,
  };
  account.billPayments.push(record);

  if (!isFuture) {
    account.balance -= value;
    account.transactions.push({
      id: nextId("t"),
      date: record.date,
      description: `${biller.name} bill payment`,
      amount: -value,
      channel: "Internal",
    });
  }
  saveAccount(account);

  return NextResponse.json({ ok: true, balance: account.balance, record });
}
