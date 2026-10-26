import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sorted = [...account.notifications].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json({ notifications: sorted });
}

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  const notification = account.notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
  return NextResponse.json({ ok: true });
}
