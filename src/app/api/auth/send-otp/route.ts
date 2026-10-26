import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { mobile } = await req.json();
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
  }

  const otp = generateOtp(mobile);
  // Demo-only: a real bank would send this via SMS and never return it in the response.
  return NextResponse.json({ ok: true, demoOtp: otp });
}
