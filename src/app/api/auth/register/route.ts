import { NextRequest, NextResponse } from "next/server";
import { accounts, findAccountByMobile, maskAccountNumber, nextId, saveAccount } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { COOKIE_NAME, encodeSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { mobile, otp, name, email, pan, aadhaarLast4, mpin } = await req.json();

  if (!mobile || !otp || !name || !mpin) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(mpin)) {
    return NextResponse.json({ error: "MPIN must be 6 digits" }, { status: 400 });
  }
  if (findAccountByMobile(mobile)) {
    return NextResponse.json({ error: "An account with this mobile number already exists" }, { status: 409 });
  }
  if (!verifyOtp(mobile, otp)) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  const last4 = String(1000 + Math.floor(Math.random() * 9000));
  accounts[mobile] = {
    username: mobile,
    mpin,
    name,
    mobile,
    email: email || "",
    panMasked: pan ? `${pan.slice(0, 5)}XXXX${pan.slice(-1)}` : "Not provided (demo)",
    aadhaarMasked: aadhaarLast4 ? `XXXX XXXX ${aadhaarLast4}` : "Not provided (demo)",
    kycStatus: "pending",
    accountNumber: maskAccountNumber(last4),
    accountType: "Savings",
    ifsc: "BHRT0001234",
    branch: "Bengaluru",
    monthlyIncome: 0,
    nomineeName: "",
    upiId: `${mobile}@bharatbank`,
    balance: 1000,
    transactions: [
      { id: nextId("t"), date: new Date().toISOString().slice(0, 10), description: "Welcome bonus credit", amount: 1000, channel: "Internal" },
    ],
    fixedDeposits: [],
    recurringDeposits: [],
    beneficiaries: [],
    cards: [],
    loans: [],
    loanApplications: [],
    billPayments: [],
    upiPayments: [],
    serviceRequests: [],
    notifications: [
      { id: nextId("n"), title: "Welcome to BharatBank", body: "Your account is ready to use.", date: new Date().toISOString().slice(0, 10), read: false },
    ],
  };
  saveAccount(accounts[mobile]);

  const token = encodeSession({ username: mobile, issuedAt: Date.now() });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  return res;
}
