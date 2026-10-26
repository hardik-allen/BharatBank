import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";

const LABELS: Record<string, string> = {
  cheque_book: "Cheque book request",
  stop_cheque: "Stop cheque payment",
  address_update: "Address update",
  nominee_update: "Nominee update",
  transaction_dispute: "Transaction dispute",
  fraud_report: "Fraud report",
};

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sorted = [...account.serviceRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ serviceRequests: sorted });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { type, details } = await req.json();
  if (!LABELS[type]) return NextResponse.json({ error: "Unknown request type" }, { status: 400 });

  account.serviceRequests.push({
    id: nextId("sr"),
    type,
    label: LABELS[type],
    details: details || "",
    status: "submitted",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ ok: true, serviceRequests: account.serviceRequests });
}
