import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { nextId } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const card = account.cards.find((c) => c.id === id);
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  account.serviceRequests.push({
    id: nextId("sr"),
    type: "card_replacement",
    label: "Card replacement request",
    details: `Replacement requested for ${card.type} card ending ${card.last4}`,
    status: "submitted",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ ok: true });
}
