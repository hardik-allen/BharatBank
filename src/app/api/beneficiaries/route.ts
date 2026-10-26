import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";

function withComputedStatus<T extends { activatesAt: string }>(b: T) {
  return { ...b, status: new Date(b.activatesAt) <= new Date() ? "active" : "pending" };
}

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({ beneficiaries: account.beneficiaries.map(withComputedStatus) });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, nickname, accountNumber, ifsc, bank } = await req.json();
  if (!name || !accountNumber || !ifsc || !bank) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const activatesAt = new Date(Date.now() + 30_000).toISOString(); // 30s demo cooling period
  const beneficiary = {
    id: nextId("ben"),
    name,
    nickname: nickname || name,
    accountNumber,
    ifsc,
    bank,
    status: "pending" as const,
    activatesAt,
  };
  account.beneficiaries.push(beneficiary);

  return NextResponse.json({ ok: true, beneficiaries: account.beneficiaries.map(withComputedStatus) });
}
