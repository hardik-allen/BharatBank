import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const index = account.beneficiaries.findIndex((b) => b.id === id);
  if (index === -1) return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 });

  account.beneficiaries.splice(index, 1);
  return NextResponse.json({ ok: true, beneficiaries: account.beneficiaries });
}
