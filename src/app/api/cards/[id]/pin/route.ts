import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

// Mock only — never stores or returns a real card PIN.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const card = account.cards.find((c) => c.id === id);
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const { pin } = await req.json();
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
