import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { saveAccount } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const card = account.cards.find((c) => c.id === id);
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const body = await req.json();
  if (typeof body.domesticEnabled === "boolean") card.domesticEnabled = body.domesticEnabled;
  if (typeof body.internationalEnabled === "boolean") card.internationalEnabled = body.internationalEnabled;
  if (typeof body.onlineEnabled === "boolean") card.onlineEnabled = body.onlineEnabled;
  if (typeof body.spendingLimit === "number" && body.spendingLimit >= 0) card.spendingLimit = body.spendingLimit;
  saveAccount(account);

  return NextResponse.json({ ok: true, card });
}
